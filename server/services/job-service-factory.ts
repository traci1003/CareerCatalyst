import { JobPlatformService } from "./job-platform.interface";
import { LinkedInService } from "./linkedin-service";
import { IndeedService } from "./indeed-service";

/**
 * Factory for job platform services
 */
export class JobServiceFactory {
  private static services: Record<string, JobPlatformService> = {
    linkedin: new LinkedInService(),
    indeed: new IndeedService(),
  };

  /**
   * Get a service by platform name
   * @param platform Platform name (e.g., "linkedin", "indeed")
   * @returns The corresponding job platform service
   */
  static getService(platform: string): JobPlatformService | null {
    const platformKey = platform.toLowerCase();
    return this.services[platformKey] || null;
  }

  /**
   * Get all available services
   * @returns Array of all available job platform services
   */
  static getAllServices(): JobPlatformService[] {
    return Object.values(this.services);
  }

  /**
   * Add or replace a service
   * @param platformKey The key for the platform
   * @param service The service implementation
   */
  static registerService(platformKey: string, service: JobPlatformService): void {
    this.services[platformKey.toLowerCase()] = service;
  }
}