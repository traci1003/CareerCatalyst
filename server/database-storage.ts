import { eq, and } from "drizzle-orm";
import { db } from "./db";
import { 
  users, 
  applications, 
  documents, 
  portfolioProjects, 
  jobListings, 
  jobSearchFilters, 
  stats,
  type User, 
  type InsertUser, 
  type Application, 
  type InsertApplication, 
  type Document, 
  type InsertDocument, 
  type PortfolioProject, 
  type InsertPortfolioProject, 
  type JobListing, 
  type InsertJobListing, 
  type JobSearchFilter, 
  type InsertJobSearchFilter, 
  type Stat, 
  type InsertStat
} from "@shared/schema";
import { IStorage } from "./storage";

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: number, userUpdate: Partial<InsertUser>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set(userUpdate)
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  // Application methods
  async getApplications(userId: number): Promise<Application[]> {
    return await db.select().from(applications).where(eq(applications.userId, userId));
  }

  async getApplicationsByStatus(userId: number, status: string): Promise<Application[]> {
    return await db
      .select()
      .from(applications)
      .where(eq(applications.userId, userId))
      .where(eq(applications.status, status));
  }

  async getApplication(id: number): Promise<Application | undefined> {
    const [application] = await db.select().from(applications).where(eq(applications.id, id));
    return application;
  }

  async createApplication(application: InsertApplication): Promise<Application> {
    const [newApplication] = await db.insert(applications).values(application).returning();
    return newApplication;
  }

  async updateApplication(id: number, applicationUpdate: Partial<InsertApplication>): Promise<Application | undefined> {
    const [application] = await db
      .update(applications)
      .set(applicationUpdate)
      .where(eq(applications.id, id))
      .returning();
    return application;
  }

  async deleteApplication(id: number): Promise<boolean> {
    const result = await db.delete(applications).where(eq(applications.id, id));
    return result.count > 0;
  }

  // Document methods
  async getDocuments(userId: number): Promise<Document[]> {
    return await db.select().from(documents).where(eq(documents.userId, userId));
  }

  async getDocumentsByType(userId: number, type: string): Promise<Document[]> {
    return await db
      .select()
      .from(documents)
      .where(eq(documents.userId, userId))
      .where(eq(documents.type, type));
  }

  async getDocument(id: number): Promise<Document | undefined> {
    const [document] = await db.select().from(documents).where(eq(documents.id, id));
    return document;
  }

  async createDocument(document: InsertDocument): Promise<Document> {
    const [newDocument] = await db.insert(documents).values(document).returning();
    return newDocument;
  }

  async updateDocument(id: number, documentUpdate: Partial<InsertDocument>): Promise<Document | undefined> {
    const [document] = await db
      .update(documents)
      .set(documentUpdate)
      .where(eq(documents.id, id))
      .returning();
    return document;
  }

  async deleteDocument(id: number): Promise<boolean> {
    const result = await db.delete(documents).where(eq(documents.id, id));
    return result.count > 0;
  }

  // Portfolio methods
  async getPortfolioProjects(userId: number): Promise<PortfolioProject[]> {
    return await db.select().from(portfolioProjects).where(eq(portfolioProjects.userId, userId));
  }

  async getPortfolioProject(id: number): Promise<PortfolioProject | undefined> {
    const [project] = await db.select().from(portfolioProjects).where(eq(portfolioProjects.id, id));
    return project;
  }

  async createPortfolioProject(project: InsertPortfolioProject): Promise<PortfolioProject> {
    const [newProject] = await db.insert(portfolioProjects).values(project).returning();
    return newProject;
  }

  async updatePortfolioProject(id: number, projectUpdate: Partial<InsertPortfolioProject>): Promise<PortfolioProject | undefined> {
    const [project] = await db
      .update(portfolioProjects)
      .set(projectUpdate)
      .where(eq(portfolioProjects.id, id))
      .returning();
    return project;
  }

  async deletePortfolioProject(id: number): Promise<boolean> {
    const result = await db.delete(portfolioProjects).where(eq(portfolioProjects.id, id));
    return result.count > 0;
  }

  // Job Listing methods
  async getJobListings(userId: number): Promise<JobListing[]> {
    return await db.select().from(jobListings).where(eq(jobListings.userId, userId));
  }

  async getJobListingsBySource(userId: number, source: string): Promise<JobListing[]> {
    return await db
      .select()
      .from(jobListings)
      .where(eq(jobListings.userId, userId))
      .where(eq(jobListings.source, source));
  }

  async getJobListing(id: number): Promise<JobListing | undefined> {
    const [jobListing] = await db.select().from(jobListings).where(eq(jobListings.id, id));
    return jobListing;
  }
  
  async getJobListingByExternalId(userId: number, externalId: string): Promise<JobListing | undefined> {
    const [jobListing] = await db
      .select()
      .from(jobListings)
      .where(
        and(
          eq(jobListings.userId, userId),
          eq(jobListings.externalId, externalId)
        )
      );
    return jobListing;
  }

  async createJobListing(jobListing: InsertJobListing): Promise<JobListing> {
    const [newJobListing] = await db.insert(jobListings).values(jobListing).returning();
    return newJobListing;
  }

  async updateJobListing(id: number, jobListingUpdate: Partial<InsertJobListing>): Promise<JobListing | undefined> {
    const [jobListing] = await db
      .update(jobListings)
      .set(jobListingUpdate)
      .where(eq(jobListings.id, id))
      .returning();
    return jobListing;
  }

  async deleteJobListing(id: number): Promise<boolean> {
    const result = await db.delete(jobListings).where(eq(jobListings.id, id));
    return result.count > 0;
  }

  async markJobListingAsApplied(id: number): Promise<JobListing | undefined> {
    const [jobListing] = await db
      .update(jobListings)
      .set({ applied: true })
      .where(eq(jobListings.id, id))
      .returning();
    return jobListing;
  }

  async hideJobListing(id: number): Promise<JobListing | undefined> {
    const [jobListing] = await db
      .update(jobListings)
      .set({ hidden: true })
      .where(eq(jobListings.id, id))
      .returning();
    return jobListing;
  }

  // Job Search Filter methods
  async getJobSearchFilters(userId: number): Promise<JobSearchFilter[]> {
    return await db.select().from(jobSearchFilters).where(eq(jobSearchFilters.userId, userId));
  }

  async getJobSearchFilter(id: number): Promise<JobSearchFilter | undefined> {
    const [filter] = await db.select().from(jobSearchFilters).where(eq(jobSearchFilters.id, id));
    return filter;
  }

  async createJobSearchFilter(filter: InsertJobSearchFilter): Promise<JobSearchFilter> {
    const [newFilter] = await db.insert(jobSearchFilters).values(filter).returning();
    return newFilter;
  }

  async updateJobSearchFilter(id: number, filterUpdate: Partial<InsertJobSearchFilter>): Promise<JobSearchFilter | undefined> {
    const [filter] = await db
      .update(jobSearchFilters)
      .set(filterUpdate)
      .where(eq(jobSearchFilters.id, id))
      .returning();
    return filter;
  }

  async deleteJobSearchFilter(id: number): Promise<boolean> {
    const result = await db.delete(jobSearchFilters).where(eq(jobSearchFilters.id, id));
    return result.count > 0;
  }

  // Stats methods
  async getUserStats(userId: number): Promise<Stat | undefined> {
    const [userStats] = await db.select().from(stats).where(eq(stats.userId, userId));
    return userStats;
  }

  async updateUserStats(id: number, statsUpdate: Partial<InsertStat>): Promise<Stat | undefined> {
    const [userStats] = await db
      .update(stats)
      .set(statsUpdate)
      .where(eq(stats.id, id))
      .returning();
    return userStats;
  }

  async createUserStats(userStats: InsertStat): Promise<Stat> {
    const [newStats] = await db.insert(stats).values(userStats).returning();
    return newStats;
  }

  // Seed initial data
  async seedDemoData() {
    try {
      // Check if demo data already exists
      const existingUser = await this.getUserByUsername('traci');
      if (existingUser) {
        console.log('Demo data already exists, skipping seed');
        return;
      }

      // Create demo user
      const user = await this.createUser({
        username: 'traci',
        password: 'password123',
        name: 'Traci Davis',
        title: 'Senior Cybersecurity Engineer',
        email: 'traci.davis@example.com',
        profileImageUrl: 'https://randomuser.me/api/portraits/women/8.jpg',
      });

      // Create portfolio projects
      const project1 = await this.createPortfolioProject({
        userId: user.id,
        name: 'PhishShield',
        description: 'An AI-powered email security tool that detects and filters phishing attempts using advanced ML algorithms.',
        imageUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
        githubUrl: 'https://github.com/tracidavis/phishshield',
        projectUrl: 'https://phishshield.demo.com',
        technologies: ['Python', 'TensorFlow', 'React', 'AWS Lambda'],
      });

      const project2 = await this.createPortfolioProject({
        userId: user.id,
        name: 'SecureVault',
        description: 'A zero-knowledge encrypted password manager with breach detection capabilities.',
        imageUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
        githubUrl: 'https://github.com/tracidavis/securevault',
        projectUrl: 'https://securevault.demo.com',
        technologies: ['TypeScript', 'Node.js', 'React Native', 'SQLite'],
      });

      // Create job applications
      const applications = [
        {
          userId: user.id,
          role: 'Frontend Developer',
          company: 'TechCorp',
          description: 'Building responsive web applications using React and TypeScript.',
          location: 'San Francisco, CA',
          status: 'applied',
          link: 'https://techcorp.com/careers/frontend-dev-123',
          appliedAt: new Date(2025, 3, 10),
        },
        {
          userId: user.id,
          role: 'Full Stack Engineer',
          company: 'DataSys',
          description: 'Developing full stack applications with Node.js and React.',
          location: 'Remote',
          status: 'interview',
          link: 'https://datasys.co/jobs/full-stack-eng',
          appliedAt: new Date(2025, 3, 12),
          responseAt: new Date(2025, 3, 15),
        },
        {
          userId: user.id,
          role: 'Security Engineer',
          company: 'CyberDefense',
          description: 'Working on security infrastructure and penetration testing.',
          location: 'Austin, TX',
          status: 'rejected',
          link: 'https://cyberdefense.io/careers/security-eng',
          appliedAt: new Date(2025, 3, 5),
          responseAt: new Date(2025, 3, 20),
        },
        {
          userId: user.id,
          role: 'DevOps Engineer',
          company: 'CloudNative',
          description: 'Managing cloud infrastructure and CI/CD pipelines.',
          location: 'Seattle, WA',
          status: 'offer',
          link: 'https://cloudnative.dev/careers/devops-eng',
          appliedAt: new Date(2025, 3, 8),
          responseAt: new Date(2025, 3, 18),
        },
      ];

      for (const app of applications) {
        await this.createApplication(app);
      }

      // Create user stats
      const userStats = await this.createUserStats({
        userId: user.id,
        totalApplications: applications.length,
        interviewRate: 50,
        avgResponseTime: 7,
        aiGeneratedDocs: 5,
      });

      // Create document templates
      const resumeTemplate = await this.createDocument({
        userId: user.id,
        name: 'Software Developer Resume',
        type: 'resume',
        content: 'Traci Davis\nSenior Cybersecurity Engineer\n\nEXPERIENCE\n...',
      });

      const coverLetterTemplate = await this.createDocument({
        userId: user.id,
        name: 'Standard Cover Letter',
        type: 'cover_letter',
        content: 'Dear Hiring Manager,\n\nI am writing to express my interest in the [POSITION] role at [COMPANY]...',
      });

      // Create job search filters
      const softwareDevFilter = await this.createJobSearchFilter({
        userId: user.id,
        name: 'Software Development',
        keywords: ['React', 'JavaScript', 'TypeScript', 'Frontend', 'Full Stack'],
        locations: ['San Francisco', 'Remote'],
        remoteOnly: false,
        excludeKeywords: ['Senior', '10+ years'],
        experience: '3-5 years',
      });

      const cyberSecurityFilter = await this.createJobSearchFilter({
        userId: user.id,
        name: 'Cybersecurity',
        keywords: ['Security Engineer', 'Penetration Testing', 'CISSP', 'Security Analyst'],
        locations: ['Remote'],
        remoteOnly: true,
        excludeKeywords: ['Clearance', 'TS/SCI'],
        experience: '2-4 years',
      });

      // Create job listings
      const jobListingsData = [
        {
          userId: user.id,
          source: 'linkedin',
          externalId: 'linkedin-123456',
          title: 'Frontend Developer',
          company: 'InnovateTech',
          location: 'Remote',
          description: 'We are looking for a Frontend Developer proficient in React and TypeScript...',
          salary: '$120,000 - $150,000',
          url: 'https://linkedin.com/jobs/view/frontend-dev-innovatetech',
          isRemote: true,
          postedAt: new Date(2025, 3, 15),
          applied: false,
          hidden: false,
          details: { jobType: 'Full-time', industry: 'Tech' },
        },
        {
          userId: user.id,
          source: 'indeed',
          externalId: 'indeed-789012',
          title: 'Security Engineer',
          company: 'SecureNet',
          location: 'San Francisco, CA',
          description: 'Join our team to help protect our infrastructure from cyber threats...',
          salary: '$140,000 - $170,000',
          url: 'https://indeed.com/jobs/security-engineer-securenet',
          isRemote: false,
          postedAt: new Date(2025, 3, 17),
          applied: false,
          hidden: false,
          details: { jobType: 'Full-time', industry: 'Cybersecurity' },
        },
      ];

      for (const job of jobListingsData) {
        await this.createJobListing(job);
      }

      console.log('Demo data seeded successfully');
    } catch (error) {
      console.error('Error seeding demo data:', error);
    }
  }
}