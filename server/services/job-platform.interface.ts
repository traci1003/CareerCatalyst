import { JobListing } from "@shared/schema";

/**
 * Interface for job platform API integrations
 */
export interface JobPlatformService {
  /**
   * Name of the platform (e.g., "LinkedIn", "Indeed")
   */
  platformName: string;

  /**
   * Check if the service has valid credentials
   */
  hasValidCredentials(credentials: any): boolean;

  /**
   * Search for jobs based on given criteria
   */
  searchJobs(
    credentials: any,
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
  }>;

  /**
   * Get job details for a specific job
   */
  getJobDetails(
    credentials: any,
    externalId: string
  ): Promise<JobListing | null>;

  /**
   * Apply to a job (if supported by the platform)
   */
  applyToJob?(
    credentials: any,
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
  }>;
}