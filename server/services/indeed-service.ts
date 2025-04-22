import axios from "axios";
import { JobPlatformService } from "./job-platform.interface";
import { InsertJobListing, JobListing } from "@shared/schema";

/**
 * Indeed API credentials interface
 */
export interface IndeedCredentials {
  publisherId: string;
  apiKey: string;
  jobseekerId?: string;
}

/**
 * Indeed job service for interacting with Indeed's API
 */
export class IndeedService implements JobPlatformService {
  platformName = "Indeed";
  private baseUrl = "https://api.indeed.com/v2";

  /**
   * Check if Indeed credentials are valid
   */
  hasValidCredentials(credentials: IndeedCredentials): boolean {
    return !!(credentials && credentials.publisherId && credentials.apiKey);
  }

  /**
   * Search for jobs on Indeed
   */
  async searchJobs(
    credentials: IndeedCredentials,
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
        throw new Error("Invalid Indeed credentials");
      }

      // Build search parameters
      const searchParams = new URLSearchParams();
      searchParams.append("publisher", credentials.publisherId);
      searchParams.append("v", "2");
      searchParams.append("format", "json");
      
      if (params.keywords && params.keywords.length > 0) {
        searchParams.append("q", params.keywords.join(" "));
      }
      
      if (params.locations && params.locations.length > 0) {
        searchParams.append("l", params.locations[0]); // Indeed only supports one location per search
      }
      
      if (params.remote) {
        searchParams.append("remotejob", "1");
      }
      
      // Pagination
      const page = params.page || 0;
      const limit = params.limit || 20;
      searchParams.append("start", (page * limit).toString());
      searchParams.append("limit", limit.toString());

      // Make request to Indeed API
      const response = await axios.get(
        `${this.baseUrl}/jobs/search?${searchParams.toString()}`,
        {
          headers: {
            Authorization: `Basic ${Buffer.from(`${credentials.publisherId}:${credentials.apiKey}`).toString('base64')}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Process and transform the response
      const data = response.data;
      const jobs = (data.results || []).map((job: any) => 
        this.mapJobToSchema(job, params.userId)
      );
      
      const total = data.totalResults || jobs.length;
      const hasMore = (page * limit) + jobs.length < total;

      return {
        jobs,
        hasMore,
        total,
      };
    } catch (error) {
      console.error("Indeed job search error:", error);
      return {
        jobs: [],
        hasMore: false,
        total: 0,
      };
    }
  }

  /**
   * Get details for a specific job on Indeed
   */
  async getJobDetails(
    credentials: IndeedCredentials,
    externalId: string
  ): Promise<JobListing | null> {
    // Extract userId from credentials or use a default (needed for implementation)
    const userId = (credentials as any).userId || 1;
    try {
      if (!this.hasValidCredentials(credentials)) {
        throw new Error("Invalid Indeed credentials");
      }

      // Indeed doesn't have a specific endpoint for individual jobs
      // We need to search for the job by its ID
      const searchParams = new URLSearchParams();
      searchParams.append("publisher", credentials.publisherId);
      searchParams.append("v", "2");
      searchParams.append("format", "json");
      searchParams.append("jobkeys", externalId);

      const response = await axios.get(
        `${this.baseUrl}/jobs/search?${searchParams.toString()}`,
        {
          headers: {
            Authorization: `Basic ${Buffer.from(`${credentials.publisherId}:${credentials.apiKey}`).toString('base64')}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = response.data;
      if (!data.results || data.results.length === 0) {
        return null;
      }

      return this.mapJobToSchema(data.results[0], userId);
    } catch (error) {
      console.error("Indeed job details error:", error);
      return null;
    }
  }

  /**
   * Map Indeed job data to our JobListing schema
   */
  private mapJobToSchema(jobData: any, userId: number): JobListing {
    const job: InsertJobListing = {
      userId,
      source: this.platformName,
      externalId: jobData.jobkey || `indeed-${Date.now()}`,
      title: jobData.jobtitle || "Untitled Position",
      company: jobData.company || "Unknown Company",
      location: jobData.formattedLocation || jobData.city || null,
      description: jobData.snippet || null,
      salary: jobData.formattedRelativeTime || null,
      url: jobData.url || `https://www.indeed.com/viewjob?jk=${jobData.jobkey}`,
      isRemote: jobData.remote || null,
      postedAt: jobData.date ? new Date(jobData.date) : null,
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