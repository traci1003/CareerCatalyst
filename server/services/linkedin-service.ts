import axios from "axios";
import { JobPlatformService } from "./job-platform.interface";
import { InsertJobListing, JobListing } from "@shared/schema";

/**
 * LinkedIn API credentials interface
 */
export interface LinkedInCredentials {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number;
}

/**
 * LinkedIn job service for interacting with LinkedIn's API
 */
export class LinkedInService implements JobPlatformService {
  platformName = "LinkedIn";
  private baseUrl = "https://api.linkedin.com/v2";

  /**
   * Check if LinkedIn credentials are valid
   */
  hasValidCredentials(credentials: LinkedInCredentials): boolean {
    if (!credentials || !credentials.accessToken) {
      return false;
    }

    // Check if token is expired
    if (credentials.expiresAt && Date.now() > credentials.expiresAt) {
      return false;
    }

    return true;
  }

  /**
   * Search for jobs on LinkedIn
   */
  async searchJobs(
    credentials: LinkedInCredentials,
    params: {
      keywords?: string[];
      locations?: string[];
      remote?: boolean;
      excludeKeywords?: string[];
      experience?: string;
      page?: number;
      limit?: number;
      userId: number;
    }
  ): Promise<{
    jobs: JobListing[];
    hasMore: boolean;
    total?: number;
  }> {
    try {
      if (!this.hasValidCredentials(credentials)) {
        throw new Error("Invalid or expired LinkedIn credentials");
      }

      // Build search parameters
      const searchParams = new URLSearchParams();
      
      if (params.keywords && params.keywords.length > 0) {
        searchParams.append("keywords", params.keywords.join(" "));
      }
      
      if (params.locations && params.locations.length > 0) {
        searchParams.append("location", params.locations.join(" "));
      }
      
      if (params.remote) {
        searchParams.append("remoteFilter", "true");
      }
      
      if (params.experience) {
        searchParams.append("experience", params.experience);
      }
      
      // Pagination
      const page = params.page || 0;
      const limit = params.limit || 20;
      searchParams.append("start", (page * limit).toString());
      searchParams.append("count", limit.toString());

      // Make request to LinkedIn API
      const response = await axios.get(
        `${this.baseUrl}/jobSearch?${searchParams.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${credentials.accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Process and transform the response
      const data = response.data;
      const jobs = (data.elements || []).map((job: any) => this.mapJobToSchema(job, params.userId));
      const total = data.paging?.total || jobs.length;
      const hasMore = data.paging?.links?.some((link: any) => link.rel === "next") || false;

      return {
        jobs,
        hasMore,
        total,
      };
    } catch (error) {
      console.error("LinkedIn job search error:", error);
      return {
        jobs: [],
        hasMore: false,
        total: 0,
      };
    }
  }

  /**
   * Get details for a specific job on LinkedIn
   */
  async getJobDetails(
    credentials: LinkedInCredentials,
    externalId: string
  ): Promise<JobListing | null> {
    try {
      if (!this.hasValidCredentials(credentials)) {
        throw new Error("Invalid or expired LinkedIn credentials");
      }

      // Extract userId from credentials or use a default
      const userId = (credentials as any).userId || 1;

      const response = await axios.get(
        `${this.baseUrl}/jobs/${externalId}`,
        {
          headers: {
            Authorization: `Bearer ${credentials.accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      const jobData = response.data;
      return this.mapJobToSchema(jobData, userId);
    } catch (error) {
      console.error("LinkedIn job details error:", error);
      return null;
    }
  }

  /**
   * Apply to a job on LinkedIn (if supported)
   */
  async applyToJob(
    credentials: LinkedInCredentials,
    externalId: string,
    application: {
      resumeId?: number;
      coverId?: number;
      customMessage?: string;
    }
  ): Promise<{
    success: boolean;
    message?: string;
    applicationId?: string;
  }> {
    try {
      if (!this.hasValidCredentials(credentials)) {
        throw new Error("Invalid or expired LinkedIn credentials");
      }

      // Note: LinkedIn's API for job applications typically requires additional setup
      // This is a simplified placeholder for the actual implementation
      const response = await axios.post(
        `${this.baseUrl}/jobs/${externalId}/applications`,
        {
          customMessage: application.customMessage,
          // Would need to include resume/cover letter files here
        },
        {
          headers: {
            Authorization: `Bearer ${credentials.accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      return {
        success: true,
        message: "Application submitted",
        applicationId: response.data.id,
      };
    } catch (error) {
      console.error("LinkedIn job application error:", error);
      return {
        success: false,
        message: error.message || "Failed to apply for job",
      };
    }
  }

  /**
   * Map LinkedIn job data to our JobListing schema
   */
  private mapJobToSchema(jobData: any, userId: number): JobListing {
    const companyData = jobData.company || {};
    const locationData = jobData.locationName || jobData.location || {};
    
    const job: InsertJobListing = {
      userId,
      source: this.platformName,
      externalId: jobData.id || `linkedin-${Date.now()}`,
      title: jobData.title || "Untitled Position",
      company: companyData.name || "Unknown Company",
      location: typeof locationData === 'string' ? locationData : locationData.name || null,
      description: jobData.description || null,
      salary: jobData.salary || null,
      url: jobData.applyUrl || jobData.url || `https://www.linkedin.com/jobs/view/${jobData.id}`,
      isRemote: jobData.workplaceType === "REMOTE" || null,
      postedAt: jobData.postedAt ? new Date(jobData.postedAt) : null,
      applied: false,
      hidden: false,
      details: jobData,
    };

    return {
      ...job,
      id: 0, // This will be assigned by the database
      savedAt: new Date(),
    } as JobListing;
  }
}