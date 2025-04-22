import {
  users,
  applications,
  documents,
  portfolioProjects,
  stats,
  jobListings,
  jobSearchFilters,
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
  type InsertStat,
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;
  
  // Application methods
  getApplications(userId: number): Promise<Application[]>;
  getApplicationsByStatus(userId: number, status: string): Promise<Application[]>;
  getApplication(id: number): Promise<Application | undefined>;
  createApplication(application: InsertApplication): Promise<Application>;
  updateApplication(id: number, application: Partial<InsertApplication>): Promise<Application | undefined>;
  deleteApplication(id: number): Promise<boolean>;
  
  // Document methods
  getDocuments(userId: number): Promise<Document[]>;
  getDocumentsByType(userId: number, type: string): Promise<Document[]>;
  getDocument(id: number): Promise<Document | undefined>;
  createDocument(document: InsertDocument): Promise<Document>;
  updateDocument(id: number, document: Partial<InsertDocument>): Promise<Document | undefined>;
  deleteDocument(id: number): Promise<boolean>;
  
  // Portfolio methods
  getPortfolioProjects(userId: number): Promise<PortfolioProject[]>;
  getPortfolioProject(id: number): Promise<PortfolioProject | undefined>;
  createPortfolioProject(project: InsertPortfolioProject): Promise<PortfolioProject>;
  updatePortfolioProject(id: number, project: Partial<InsertPortfolioProject>): Promise<PortfolioProject | undefined>;
  deletePortfolioProject(id: number): Promise<boolean>;
  
  // Job Listing methods
  getJobListings(userId: number): Promise<JobListing[]>;
  getJobListingsBySource(userId: number, source: string): Promise<JobListing[]>;
  getJobListing(id: number): Promise<JobListing | undefined>;
  getJobListingByExternalId(userId: number, externalId: string): Promise<JobListing | undefined>;
  createJobListing(jobListing: InsertJobListing): Promise<JobListing>;
  updateJobListing(id: number, jobListing: Partial<InsertJobListing>): Promise<JobListing | undefined>;
  deleteJobListing(id: number): Promise<boolean>;
  markJobListingAsApplied(id: number): Promise<JobListing | undefined>;
  hideJobListing(id: number): Promise<JobListing | undefined>;
  
  // Job Search Filter methods
  getJobSearchFilters(userId: number): Promise<JobSearchFilter[]>;
  getJobSearchFilter(id: number): Promise<JobSearchFilter | undefined>;
  createJobSearchFilter(filter: InsertJobSearchFilter): Promise<JobSearchFilter>;
  updateJobSearchFilter(id: number, filter: Partial<InsertJobSearchFilter>): Promise<JobSearchFilter | undefined>;
  deleteJobSearchFilter(id: number): Promise<boolean>;
  
  // Stats methods
  getUserStats(userId: number): Promise<Stat | undefined>;
  updateUserStats(id: number, newStats: Partial<InsertStat>): Promise<Stat | undefined>;
  createUserStats(stats: InsertStat): Promise<Stat>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private applications: Map<number, Application>;
  private documents: Map<number, Document>;
  private portfolioProjects: Map<number, PortfolioProject>;
  private jobListings: Map<number, JobListing>;
  private jobSearchFilters: Map<number, JobSearchFilter>;
  private stats: Map<number, Stat>;
  
  private userIdCounter: number;
  private applicationIdCounter: number;
  private documentIdCounter: number;
  private portfolioIdCounter: number;
  private jobListingIdCounter: number;
  private jobSearchFilterIdCounter: number;
  private statsIdCounter: number;

  constructor() {
    this.users = new Map();
    this.applications = new Map();
    this.documents = new Map();
    this.portfolioProjects = new Map();
    this.jobListings = new Map();
    this.jobSearchFilters = new Map();
    this.stats = new Map();
    
    this.userIdCounter = 1;
    this.applicationIdCounter = 1;
    this.documentIdCounter = 1;
    this.portfolioIdCounter = 1;
    this.jobListingIdCounter = 1;
    this.jobSearchFilterIdCounter = 1;
    this.statsIdCounter = 1;
    
    // Add demo data
    this.seedDemoData();
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  async updateUser(id: number, userUpdate: Partial<InsertUser>): Promise<User | undefined> {
    const existingUser = this.users.get(id);
    if (!existingUser) return undefined;
    
    const updatedUser = { ...existingUser, ...userUpdate };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Application methods
  async getApplications(userId: number): Promise<Application[]> {
    return Array.from(this.applications.values()).filter(
      (app) => app.userId === userId
    );
  }
  
  async getApplicationsByStatus(userId: number, status: string): Promise<Application[]> {
    return Array.from(this.applications.values()).filter(
      (app) => app.userId === userId && app.status === status
    );
  }
  
  async getApplication(id: number): Promise<Application | undefined> {
    return this.applications.get(id);
  }
  
  async createApplication(application: InsertApplication): Promise<Application> {
    const id = this.applicationIdCounter++;
    const now = new Date();
    const newApp: Application = { 
      ...application, 
      id, 
      createdAt: now, 
      updatedAt: now
    };
    this.applications.set(id, newApp);
    return newApp;
  }
  
  async updateApplication(id: number, applicationUpdate: Partial<InsertApplication>): Promise<Application | undefined> {
    const existingApplication = this.applications.get(id);
    if (!existingApplication) return undefined;
    
    const updatedApplication = { 
      ...existingApplication, 
      ...applicationUpdate,
      updatedAt: new Date()
    };
    this.applications.set(id, updatedApplication);
    return updatedApplication;
  }
  
  async deleteApplication(id: number): Promise<boolean> {
    return this.applications.delete(id);
  }
  
  // Document methods
  async getDocuments(userId: number): Promise<Document[]> {
    return Array.from(this.documents.values()).filter(
      (doc) => doc.userId === userId
    );
  }
  
  async getDocumentsByType(userId: number, type: string): Promise<Document[]> {
    return Array.from(this.documents.values()).filter(
      (doc) => doc.userId === userId && doc.type === type
    );
  }
  
  async getDocument(id: number): Promise<Document | undefined> {
    return this.documents.get(id);
  }
  
  async createDocument(document: InsertDocument): Promise<Document> {
    const id = this.documentIdCounter++;
    const now = new Date();
    const newDoc: Document = { 
      ...document, 
      id, 
      createdAt: now, 
      updatedAt: now 
    };
    this.documents.set(id, newDoc);
    return newDoc;
  }
  
  async updateDocument(id: number, documentUpdate: Partial<InsertDocument>): Promise<Document | undefined> {
    const existingDocument = this.documents.get(id);
    if (!existingDocument) return undefined;
    
    const updatedDocument = { 
      ...existingDocument, 
      ...documentUpdate,
      updatedAt: new Date()
    };
    this.documents.set(id, updatedDocument);
    return updatedDocument;
  }
  
  async deleteDocument(id: number): Promise<boolean> {
    return this.documents.delete(id);
  }
  
  // Portfolio methods
  async getPortfolioProjects(userId: number): Promise<PortfolioProject[]> {
    return Array.from(this.portfolioProjects.values()).filter(
      (project) => project.userId === userId
    );
  }
  
  async getPortfolioProject(id: number): Promise<PortfolioProject | undefined> {
    return this.portfolioProjects.get(id);
  }
  
  async createPortfolioProject(project: InsertPortfolioProject): Promise<PortfolioProject> {
    const id = this.portfolioIdCounter++;
    const now = new Date();
    const newProject: PortfolioProject = { 
      ...project, 
      id, 
      createdAt: now, 
      updatedAt: now 
    };
    this.portfolioProjects.set(id, newProject);
    return newProject;
  }
  
  async updatePortfolioProject(id: number, projectUpdate: Partial<InsertPortfolioProject>): Promise<PortfolioProject | undefined> {
    const existingProject = this.portfolioProjects.get(id);
    if (!existingProject) return undefined;
    
    const updatedProject = { 
      ...existingProject, 
      ...projectUpdate,
      updatedAt: new Date()
    };
    this.portfolioProjects.set(id, updatedProject);
    return updatedProject;
  }
  
  async deletePortfolioProject(id: number): Promise<boolean> {
    return this.portfolioProjects.delete(id);
  }
  
  // Job Listing methods
  async getJobListings(userId: number): Promise<JobListing[]> {
    return Array.from(this.jobListings.values()).filter(
      (listing) => listing.userId === userId && !listing.hidden
    );
  }
  
  async getJobListingsBySource(userId: number, source: string): Promise<JobListing[]> {
    return Array.from(this.jobListings.values()).filter(
      (listing) => listing.userId === userId && listing.source === source && !listing.hidden
    );
  }
  
  async getJobListing(id: number): Promise<JobListing | undefined> {
    return this.jobListings.get(id);
  }
  
  async getJobListingByExternalId(userId: number, externalId: string): Promise<JobListing | undefined> {
    return Array.from(this.jobListings.values()).find(
      (listing) => listing.userId === userId && listing.externalId === externalId
    );
  }
  
  async createJobListing(jobListing: InsertJobListing): Promise<JobListing> {
    const id = this.jobListingIdCounter++;
    const newListing: JobListing = { 
      ...jobListing, 
      id, 
      savedAt: new Date(),
      applied: jobListing.applied ?? false,
      hidden: jobListing.hidden ?? false
    };
    this.jobListings.set(id, newListing);
    return newListing;
  }
  
  async updateJobListing(id: number, jobListingUpdate: Partial<InsertJobListing>): Promise<JobListing | undefined> {
    const existingListing = this.jobListings.get(id);
    if (!existingListing) return undefined;
    
    const updatedListing = { 
      ...existingListing, 
      ...jobListingUpdate
    };
    this.jobListings.set(id, updatedListing);
    return updatedListing;
  }
  
  async deleteJobListing(id: number): Promise<boolean> {
    return this.jobListings.delete(id);
  }
  
  async markJobListingAsApplied(id: number): Promise<JobListing | undefined> {
    const existingListing = this.jobListings.get(id);
    if (!existingListing) return undefined;
    
    const updatedListing = { 
      ...existingListing, 
      applied: true 
    };
    this.jobListings.set(id, updatedListing);
    return updatedListing;
  }
  
  async hideJobListing(id: number): Promise<JobListing | undefined> {
    const existingListing = this.jobListings.get(id);
    if (!existingListing) return undefined;
    
    const updatedListing = { 
      ...existingListing, 
      hidden: true 
    };
    this.jobListings.set(id, updatedListing);
    return updatedListing;
  }
  
  // Job Search Filter methods
  async getJobSearchFilters(userId: number): Promise<JobSearchFilter[]> {
    return Array.from(this.jobSearchFilters.values()).filter(
      (filter) => filter.userId === userId
    );
  }
  
  async getJobSearchFilter(id: number): Promise<JobSearchFilter | undefined> {
    return this.jobSearchFilters.get(id);
  }
  
  async createJobSearchFilter(filter: InsertJobSearchFilter): Promise<JobSearchFilter> {
    const id = this.jobSearchFilterIdCounter++;
    const now = new Date();
    const newFilter: JobSearchFilter = { 
      ...filter, 
      id, 
      createdAt: now, 
      updatedAt: now,
      keywords: filter.keywords || [],
      locations: filter.locations || [],
      excludeKeywords: filter.excludeKeywords || [],
      remoteOnly: filter.remoteOnly ?? false
    };
    this.jobSearchFilters.set(id, newFilter);
    return newFilter;
  }
  
  async updateJobSearchFilter(id: number, filterUpdate: Partial<InsertJobSearchFilter>): Promise<JobSearchFilter | undefined> {
    const existingFilter = this.jobSearchFilters.get(id);
    if (!existingFilter) return undefined;
    
    const updatedFilter = { 
      ...existingFilter, 
      ...filterUpdate,
      updatedAt: new Date()
    };
    this.jobSearchFilters.set(id, updatedFilter);
    return updatedFilter;
  }
  
  async deleteJobSearchFilter(id: number): Promise<boolean> {
    return this.jobSearchFilters.delete(id);
  }
  
  // Stats methods
  async getUserStats(userId: number): Promise<Stat | undefined> {
    return Array.from(this.stats.values()).find(
      (stat) => stat.userId === userId
    );
  }
  
  async updateUserStats(id: number, statsUpdate: Partial<InsertStat>): Promise<Stat | undefined> {
    const existingStats = this.stats.get(id);
    if (!existingStats) return undefined;
    
    const updatedStats = { 
      ...existingStats, 
      ...statsUpdate,
      timestamp: new Date()
    };
    this.stats.set(id, updatedStats);
    return updatedStats;
  }
  
  async createUserStats(userStats: InsertStat): Promise<Stat> {
    const id = this.statsIdCounter++;
    const now = new Date();
    const newStats: Stat = { 
      ...userStats, 
      id, 
      timestamp: now 
    };
    this.stats.set(id, newStats);
    return newStats;
  }
  
  // Seed demo data
  private seedDemoData() {
    // Create demo user
    const user: User = {
      id: this.userIdCounter++,
      username: "traci",
      password: "password123",
      name: "Traci Davis",
      title: "Software Developer",
      email: "traci@example.com",
      profileImageUrl: ""
    };
    this.users.set(user.id, user);
    
    // Create portfolio projects
    const projectIds: number[] = [];
    const project1: PortfolioProject = {
      id: this.portfolioIdCounter++,
      userId: user.id,
      name: "PhishShield AI",
      description: "AI-powered phishing detection tool for email systems",
      imageUrl: "https://images.unsplash.com/photo-1563986768494-4dee2763ff3f",
      githubUrl: "https://github.com/tracidavis/phishshield",
      projectUrl: "https://phishshield.example.com",
      technologies: ["Python", "TensorFlow", "Flask"],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const project2: PortfolioProject = {
      id: this.portfolioIdCounter++,
      userId: user.id,
      name: "CyberAlarmShield",
      description: "Real-time network intrusion detection system",
      imageUrl: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31",
      githubUrl: "https://github.com/tracidavis/cyberalarmshield",
      projectUrl: "https://cyberalarmshield.example.com",
      technologies: ["Node.js", "React", "MongoDB"],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.portfolioProjects.set(project1.id, project1);
    this.portfolioProjects.set(project2.id, project2);
    projectIds.push(project1.id, project2.id);
    
    // Create demo applications
    const statuses = ["applied", "screening", "interview", "offer"];
    
    const companies = [
      { name: "Acme Inc.", role: "Frontend Developer", location: "Remote" },
      { name: "TechCorp", role: "React Developer", location: "Hybrid" },
      { name: "StartupXYZ", role: "Full Stack Engineer", location: "Remote" },
      { name: "BigTech Inc.", role: "Software Engineer", location: "On-site" },
      { name: "TechGiant Co.", role: "Senior Developer", location: "Remote" }
    ];
    
    const now = new Date();
    const twoDaysAgo = new Date(now); 
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    
    const threeDaysAgo = new Date(now);
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    
    const oneWeekAgo = new Date(now);
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const twoWeeksAgo = new Date(now);
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
    
    const threeWeeksAgo = new Date(now);
    threeWeeksAgo.setDate(threeWeeksAgo.getDate() - 21);
    
    const dates = [twoDaysAgo, threeDaysAgo, oneWeekAgo, twoWeeksAgo, threeWeeksAgo];
    
    // Create applications with different statuses
    let appliedCount = 0;
    let screeningCount = 0;
    let interviewCount = 0;
    let offerCount = 0;
    
    for (let i = 0; i < 27; i++) {
      const statusIndex = i % statuses.length;
      const status = statuses[statusIndex];
      const companyIndex = i % companies.length;
      const dateIndex = i % dates.length;
      
      // Count applications per status
      switch (status) {
        case "applied":
          appliedCount++;
          break;
        case "screening":
          screeningCount++;
          break;
        case "interview":
          interviewCount++;
          break;
        case "offer":
          offerCount++;
          break;
      }
      
      const application: Application = {
        id: this.applicationIdCounter++,
        userId: user.id,
        role: companies[companyIndex].role,
        company: companies[companyIndex].name,
        description: `Job description for ${companies[companyIndex].role} position at ${companies[companyIndex].name}`,
        location: companies[companyIndex].location,
        salaryRange: "$90,000 - $120,000",
        status: status,
        link: `https://jobs.example.com/${companies[companyIndex].name.toLowerCase().replace(/\s/g, "-")}`,
        notes: "Applied via company website",
        createdAt: dates[dateIndex],
        updatedAt: dates[dateIndex],
        appliedAt: dates[dateIndex],
        responseAt: status !== "applied" ? new Date(dates[dateIndex].getTime() + 2 * 24 * 60 * 60 * 1000) : null,
      };
      
      this.applications.set(application.id, application);
    }
    
    // Create user stats
    const userStats: Stat = {
      id: this.statsIdCounter++,
      userId: user.id,
      timestamp: new Date(),
      totalApplications: 42,
      interviewRate: 24,
      avgResponseTime: 3,
      aiGeneratedDocs: 36
    };
    
    this.stats.set(userStats.id, userStats);
    
    // Create document templates
    const resumeTemplate: Document = {
      id: this.documentIdCounter++,
      userId: user.id,
      name: "Software Engineer Resume",
      type: "resume",
      content: "Professional resume template for software engineering positions",
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const coverLetterTemplate: Document = {
      id: this.documentIdCounter++,
      userId: user.id,
      name: "General Cover Letter",
      type: "cover_letter",
      content: "General cover letter template for software development positions",
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.documents.set(resumeTemplate.id, resumeTemplate);
    this.documents.set(coverLetterTemplate.id, coverLetterTemplate);
    
    // Create demo job search filters
    const softwareDevFilter: JobSearchFilter = {
      id: this.jobSearchFilterIdCounter++,
      userId: user.id,
      name: "Software Development Jobs",
      keywords: ["software developer", "software engineer", "full stack", "frontend", "backend"],
      locations: ["Remote", "New York", "San Francisco"],
      excludeKeywords: ["senior", "10+ years"],
      remoteOnly: true,
      experience: "0-3 years",
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const cyberSecurityFilter: JobSearchFilter = {
      id: this.jobSearchFilterIdCounter++,
      userId: user.id,
      name: "Cybersecurity Jobs",
      keywords: ["security engineer", "cybersecurity", "infosec", "security analyst"],
      locations: ["Remote", "Boston", "Chicago"],
      excludeKeywords: ["clearance", "secret", "TS/SCI"],
      remoteOnly: false,
      experience: "2-5 years",
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.jobSearchFilters.set(softwareDevFilter.id, softwareDevFilter);
    this.jobSearchFilters.set(cyberSecurityFilter.id, cyberSecurityFilter);
    
    // Create demo job listings
    const jobTitles = [
      "Frontend Developer", "React Engineer", "Full Stack Developer", 
      "Node.js Developer", "JavaScript Engineer", "Web Developer",
      "Backend Developer", "DevOps Engineer", "Software Engineer"
    ];
    
    const companyNames = [
      "TechStart Inc.", "InnovateCorp", "CodeGenius", "DataFlow Systems",
      "CloudNative Labs", "Quantum Software", "ByteWorks", "DigitalFusion",
      "AppNexus Solutions", "CyberSphere Technologies"
    ];
    
    const locations = ["Remote", "New York, NY", "San Francisco, CA", "Austin, TX", "Boston, MA"];
    const salaries = ["$80,000 - $100,000", "$90,000 - $120,000", "$100,000 - $130,000", "$110,000 - $140,000"];
    
    // LinkedIn listings
    for (let i = 0; i < 12; i++) {
      const titleIndex = i % jobTitles.length;
      const companyIndex = i % companyNames.length;
      const locationIndex = i % locations.length;
      const salaryIndex = i % salaries.length;
      
      const postedDate = new Date();
      postedDate.setDate(postedDate.getDate() - (i % 14)); // Random date within last 2 weeks
      
      const jobListing: JobListing = {
        id: this.jobListingIdCounter++,
        userId: user.id,
        source: "linkedin",
        externalId: `linkedin-${100000 + i}`,
        title: jobTitles[titleIndex],
        company: companyNames[companyIndex],
        location: locations[locationIndex],
        description: `We are looking for a talented ${jobTitles[titleIndex]} to join our team...`,
        salary: salaries[salaryIndex],
        url: `https://linkedin.com/jobs/view/${100000 + i}`,
        isRemote: locations[locationIndex] === "Remote",
        postedAt: postedDate,
        savedAt: new Date(),
        applied: i < 3, // First 3 are applied
        hidden: i > 10, // Last few are hidden
        details: { 
          applicants: Math.floor(Math.random() * 200) + 10,
          companySize: "51-200 employees",
          industry: "Software Development" 
        }
      };
      
      this.jobListings.set(jobListing.id, jobListing);
    }
    
    // Indeed listings
    for (let i = 0; i < 10; i++) {
      const titleIndex = i % jobTitles.length;
      const companyIndex = (i + 3) % companyNames.length;
      const locationIndex = i % locations.length;
      const salaryIndex = i % salaries.length;
      
      const postedDate = new Date();
      postedDate.setDate(postedDate.getDate() - (i % 10)); // Random date within last 10 days
      
      const jobListing: JobListing = {
        id: this.jobListingIdCounter++,
        userId: user.id,
        source: "indeed",
        externalId: `indeed-${200000 + i}`,
        title: jobTitles[titleIndex],
        company: companyNames[companyIndex],
        location: locations[locationIndex],
        description: `${companyNames[companyIndex]} is seeking a ${jobTitles[titleIndex]} to help us build amazing products...`,
        salary: salaries[salaryIndex],
        url: `https://indeed.com/viewjob?jk=${200000 + i}`,
        isRemote: locations[locationIndex] === "Remote",
        postedAt: postedDate,
        savedAt: new Date(),
        applied: i < 2, // First 2 are applied
        hidden: false,
        details: { 
          jobType: "Full-time",
          benefits: ["Health insurance", "401(k)", "Flexible schedule"],
          qualifications: ["Bachelor's degree", "2+ years of experience"]
        }
      };
      
      this.jobListings.set(jobListing.id, jobListing);
    }
  }
}

import { DatabaseStorage } from "./database-storage";

// Use database storage instead of memory storage
export const storage = new DatabaseStorage();
