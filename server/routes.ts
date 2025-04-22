import { type Express, type Request, type Response, type NextFunction, Router, static as expressStatic } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import multer from "multer";
import path from "path";
import fs from "fs";
import { setupAuth } from "./auth";
import {
  insertApplicationSchema,
  insertDocumentSchema,
  insertPortfolioProjectSchema,
  insertUserSchema,
  insertJobListingSchema,
  insertJobSearchFilterSchema,
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication
  setupAuth(app);
  const apiRouter = Router();
  app.use("/api", apiRouter);
  
  // Setup public directory to serve static files (including profile images)
  app.use(expressStatic("public"));
  
  // Configure multer for file uploads
  const multerStorage = multer.diskStorage({
    destination: (req, file, cb) => {
      // Create the directory if it doesn't exist
      const uploadDir = path.join(process.cwd(), "public", "assets", "uploads");
      fs.mkdirSync(uploadDir, { recursive: true });
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      // Create unique filename with timestamp and original extension
      const fileExt = path.extname(file.originalname);
      const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${fileExt}`;
      cb(null, uniqueName);
    }
  });
  
  const upload = multer({ 
    storage: multerStorage,
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB limit
    },
    fileFilter: (req, file, cb) => {
      // Accept only image files
      const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('Invalid file type. Only JPEG, PNG, GIF and WebP images are allowed.'));
      }
    }
  });

  // Users
  apiRouter.get("/users/:id", async (req, res) => {
    const userId = parseInt(req.params.id);
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Don't return the password
    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  });

  apiRouter.post("/users", async (req, res) => {
    try {
      const validatedUser = insertUserSchema.parse(req.body);
      const user = await storage.createUser(validatedUser);
      const { password, ...userWithoutPassword } = user;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Failed to create user" });
    }
  });
  
  // Update user
  apiRouter.put("/users/:id", async (req, res) => {
    const userId = parseInt(req.params.id);
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    try {
      // Check if user exists
      const existingUser = await storage.getUser(userId);
      if (!existingUser) {
        return res.status(404).json({ message: "User not found" });
      }

      const updatedUser = await storage.updateUser(userId, req.body);
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      // Don't return the password
      const { password, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Failed to update user" });
    }
  });
  
  // Upload profile image
  apiRouter.post("/users/:id/profile-image", upload.single('profileImage'), async (req, res) => {
    const userId = parseInt(req.params.id);
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    
    try {
      // Check if user exists
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Check if file was uploaded successfully
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      
      // Generate the public URL path to the uploaded file
      const relativePath = `/assets/uploads/${req.file.filename}`;
      
      // Update user's profile image URL in the database
      const updatedUser = await storage.updateUser(userId, {
        profileImageUrl: relativePath
      });
      
      if (!updatedUser) {
        return res.status(500).json({ message: "Failed to update user profile image" });
      }
      
      // Don't return the password
      const { password, ...userWithoutPassword } = updatedUser;
      res.status(200).json({ 
        message: "Profile image updated successfully",
        user: userWithoutPassword
      });
    } catch (error) {
      console.error("Profile image upload error:", error);
      res.status(500).json({ message: "Failed to upload profile image" });
    }
  });

  // Applications
  apiRouter.get("/applications", async (req, res) => {
    const userId = parseInt(req.query.userId as string);
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const status = req.query.status as string | undefined;
    
    let applications;
    if (status) {
      applications = await storage.getApplicationsByStatus(userId, status);
    } else {
      applications = await storage.getApplications(userId);
    }
    
    res.json(applications);
  });

  apiRouter.get("/applications/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid application ID" });
    }

    const application = await storage.getApplication(id);
    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    res.json(application);
  });

  apiRouter.post("/applications", async (req, res) => {
    try {
      const validatedApplication = insertApplicationSchema.parse(req.body);
      const application = await storage.createApplication(validatedApplication);
      res.status(201).json(application);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Failed to create application" });
    }
  });

  apiRouter.put("/applications/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid application ID" });
    }

    try {
      const application = await storage.updateApplication(id, req.body);
      if (!application) {
        return res.status(404).json({ message: "Application not found" });
      }
      res.json(application);
    } catch (error) {
      res.status(500).json({ message: "Failed to update application" });
    }
  });

  apiRouter.delete("/applications/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid application ID" });
    }

    const success = await storage.deleteApplication(id);
    if (!success) {
      return res.status(404).json({ message: "Application not found" });
    }

    res.status(204).end();
  });

  // Documents
  apiRouter.get("/documents", async (req, res) => {
    const userId = parseInt(req.query.userId as string);
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const type = req.query.type as string | undefined;
    
    let documents;
    if (type) {
      documents = await storage.getDocumentsByType(userId, type);
    } else {
      documents = await storage.getDocuments(userId);
    }
    
    res.json(documents);
  });

  apiRouter.get("/documents/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid document ID" });
    }

    const document = await storage.getDocument(id);
    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    res.json(document);
  });

  apiRouter.post("/documents", async (req, res) => {
    try {
      const validatedDocument = insertDocumentSchema.parse(req.body);
      const document = await storage.createDocument(validatedDocument);
      res.status(201).json(document);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Failed to create document" });
    }
  });

  apiRouter.put("/documents/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid document ID" });
    }

    try {
      const document = await storage.updateDocument(id, req.body);
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }
      res.json(document);
    } catch (error) {
      res.status(500).json({ message: "Failed to update document" });
    }
  });

  apiRouter.delete("/documents/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid document ID" });
    }

    const success = await storage.deleteDocument(id);
    if (!success) {
      return res.status(404).json({ message: "Document not found" });
    }

    res.status(204).end();
  });

  // Portfolio projects
  apiRouter.get("/portfolio-projects", async (req, res) => {
    const userId = parseInt(req.query.userId as string);
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const projects = await storage.getPortfolioProjects(userId);
    res.json(projects);
  });

  apiRouter.get("/portfolio-projects/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid project ID" });
    }

    const project = await storage.getPortfolioProject(id);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.json(project);
  });

  apiRouter.post("/portfolio-projects", async (req, res) => {
    try {
      const validatedProject = insertPortfolioProjectSchema.parse(req.body);
      const project = await storage.createPortfolioProject(validatedProject);
      res.status(201).json(project);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Failed to create project" });
    }
  });

  apiRouter.put("/portfolio-projects/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid project ID" });
    }

    try {
      const project = await storage.updatePortfolioProject(id, req.body);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      res.json(project);
    } catch (error) {
      res.status(500).json({ message: "Failed to update project" });
    }
  });

  apiRouter.delete("/portfolio-projects/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid project ID" });
    }

    const success = await storage.deletePortfolioProject(id);
    if (!success) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.status(204).end();
  });

  // Stats
  apiRouter.get("/stats", async (req, res) => {
    const userId = parseInt(req.query.userId as string);
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const stats = await storage.getUserStats(userId);
    if (!stats) {
      return res.status(404).json({ message: "Stats not found" });
    }

    res.json(stats);
  });

  // Generate document with OpenAI
  apiRouter.post("/generate-document", async (req, res) => {
    const { userId, type, role, company, details } = req.body;
    
    if (!userId || !type || !role) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    
    try {
      // In a real implementation, this would call OpenAI API
      // For the demo, we'll just return a mock document
      const documentContent = `This is a generated ${type} for the ${role} position at ${company || "the company"}.\n\n${details || ""}`;
      
      const document = await storage.createDocument({
        userId,
        name: `${type.charAt(0).toUpperCase() + type.slice(1)} for ${role} at ${company || "Company"}`,
        type,
        content: documentContent
      });
      
      // Update the AI generated docs count in stats
      const stats = await storage.getUserStats(userId);
      if (stats) {
        await storage.updateUserStats(stats.id, {
          aiGeneratedDocs: stats.aiGeneratedDocs + 1
        });
      }
      
      res.status(201).json(document);
    } catch (error) {
      res.status(500).json({ message: "Failed to generate document" });
    }
  });
  
  // Job Listings
  apiRouter.get("/job-listings", async (req, res) => {
    const userId = parseInt(req.query.userId as string);
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const source = req.query.source as string | undefined;
    
    let jobListings;
    if (source) {
      jobListings = await storage.getJobListingsBySource(userId, source);
    } else {
      jobListings = await storage.getJobListings(userId);
    }
    
    res.json(jobListings);
  });

  apiRouter.get("/job-listings/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid job listing ID" });
    }

    const jobListing = await storage.getJobListing(id);
    if (!jobListing) {
      return res.status(404).json({ message: "Job listing not found" });
    }

    res.json(jobListing);
  });

  apiRouter.post("/job-listings", async (req, res) => {
    try {
      const validatedJobListing = insertJobListingSchema.parse(req.body);
      const jobListing = await storage.createJobListing(validatedJobListing);
      res.status(201).json(jobListing);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Failed to create job listing" });
    }
  });

  apiRouter.put("/job-listings/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid job listing ID" });
    }

    try {
      const jobListing = await storage.updateJobListing(id, req.body);
      if (!jobListing) {
        return res.status(404).json({ message: "Job listing not found" });
      }
      res.json(jobListing);
    } catch (error) {
      res.status(500).json({ message: "Failed to update job listing" });
    }
  });

  apiRouter.delete("/job-listings/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid job listing ID" });
    }

    const success = await storage.deleteJobListing(id);
    if (!success) {
      return res.status(404).json({ message: "Job listing not found" });
    }

    res.status(204).end();
  });
  
  apiRouter.post("/job-listings/:id/apply", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid job listing ID" });
    }
    
    try {
      const jobListing = await storage.markJobListingAsApplied(id);
      if (!jobListing) {
        return res.status(404).json({ message: "Job listing not found" });
      }
      
      // Create an application record
      const { userId, title, company, description, location, salary, url } = jobListing;
      
      await storage.createApplication({
        userId,
        role: title,
        company,
        description: description || "",
        location: location || "",
        salaryRange: salary || "",
        status: "applied",
        link: url,
        appliedAt: new Date(),
        notes: `Applied via job listing from ${jobListing.source}`
      });
      
      res.json(jobListing);
    } catch (error) {
      res.status(500).json({ message: "Failed to mark job listing as applied" });
    }
  });
  
  apiRouter.post("/job-listings/:id/hide", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid job listing ID" });
    }
    
    try {
      const jobListing = await storage.hideJobListing(id);
      if (!jobListing) {
        return res.status(404).json({ message: "Job listing not found" });
      }
      res.json(jobListing);
    } catch (error) {
      res.status(500).json({ message: "Failed to hide job listing" });
    }
  });
  
  // Job Search Filters
  apiRouter.get("/job-search-filters", async (req, res) => {
    const userId = parseInt(req.query.userId as string);
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const filters = await storage.getJobSearchFilters(userId);
    res.json(filters);
  });

  apiRouter.get("/job-search-filters/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid filter ID" });
    }

    const filter = await storage.getJobSearchFilter(id);
    if (!filter) {
      return res.status(404).json({ message: "Filter not found" });
    }

    res.json(filter);
  });

  apiRouter.post("/job-search-filters", async (req, res) => {
    try {
      const validatedFilter = insertJobSearchFilterSchema.parse(req.body);
      const filter = await storage.createJobSearchFilter(validatedFilter);
      res.status(201).json(filter);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Failed to create filter" });
    }
  });

  apiRouter.put("/job-search-filters/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid filter ID" });
    }

    try {
      const filter = await storage.updateJobSearchFilter(id, req.body);
      if (!filter) {
        return res.status(404).json({ message: "Filter not found" });
      }
      res.json(filter);
    } catch (error) {
      res.status(500).json({ message: "Failed to update filter" });
    }
  });

  apiRouter.delete("/job-search-filters/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid filter ID" });
    }

    const success = await storage.deleteJobSearchFilter(id);
    if (!success) {
      return res.status(404).json({ message: "Filter not found" });
    }

    res.status(204).end();
  });
  
  // LinkedIn and Indeed API Integration
  apiRouter.post("/sync-jobs", async (req, res) => {
    const { userId, source, filterId } = req.body;
    
    if (!userId || !source) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    
    try {
      // In a real app, this would call the external APIs
      // For the demo, we'll return a success message
      res.json({ 
        success: true, 
        message: `Successfully synchronized jobs from ${source}`,
        syncedJobs: Math.floor(Math.random() * 10) + 5 // Random number of synced jobs
      });
    } catch (error) {
      res.status(500).json({ message: `Failed to sync jobs from ${source}` });
    }
  });

  // Job Platform Integration
  apiRouter.post("/job-platform/credentials", async (req, res) => {
    try {
      const { userId, platform, credentials } = req.body;
      
      if (!userId || !platform || !credentials) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Update the appropriate credentials field based on platform
      if (platform.toLowerCase() === 'linkedin') {
        await storage.updateUser(userId, {
          linkedinCredentials: credentials
        });
      } else if (platform.toLowerCase() === 'indeed') {
        await storage.updateUser(userId, {
          indeedCredentials: credentials
        });
      } else {
        return res.status(400).json({ message: "Unsupported platform" });
      }
      
      res.status(200).json({ message: `${platform} credentials saved successfully` });
    } catch (error) {
      console.error(`Error saving ${req.body.platform} credentials:`, error);
      res.status(500).json({ message: "Failed to save credentials" });
    }
  });
  
  apiRouter.get("/job-platform/search", async (req, res) => {
    try {
      const userId = parseInt(req.query.userId as string);
      const platform = req.query.platform as string;
      
      if (isNaN(userId) || !platform) {
        return res.status(400).json({ message: "Missing required parameters" });
      }
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Get credentials for the specified platform
      let credentials;
      if (platform.toLowerCase() === 'linkedin') {
        credentials = user.linkedinCredentials;
      } else if (platform.toLowerCase() === 'indeed') {
        credentials = user.indeedCredentials;
      } else {
        return res.status(400).json({ message: "Unsupported platform" });
      }
      
      if (!credentials) {
        return res.status(400).json({ 
          message: `No ${platform} credentials found. Please add your credentials in Settings.` 
        });
      }
      
      // Add userId to credentials for services to use
      const credentialsWithUserId = typeof credentials === "string" ? { ...JSON.parse(credentials || "{}"), userId } : { ...credentials, userId };
      
      // Import and use the job service factory
      const { JobServiceFactory } = require('./services/job-service-factory');
      const service = JobServiceFactory.getService(platform);
      
      if (!service) {
        return res.status(400).json({ message: "Unsupported platform" });
      }
      
      if (!service.hasValidCredentials(credentialsWithUserId)) {
        return res.status(401).json({ 
          message: `Invalid or expired ${platform} credentials. Please update your credentials in Settings.` 
        });
      }
      
      // Build search parameters from query
      const searchParams = {
        keywords: req.query.keywords ? (req.query.keywords as string).split(',') : undefined,
        locations: req.query.locations ? (req.query.locations as string).split(',') : undefined,
        remote: req.query.remote === 'true',
        excludeKeywords: req.query.excludeKeywords ? (req.query.excludeKeywords as string).split(',') : undefined,
        experience: req.query.experience as string,
        page: req.query.page ? parseInt(req.query.page as string) : 0,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
        userId
      };
      
      // Search for jobs
      const result = await service.searchJobs(credentialsWithUserId, searchParams);
      
      // Save job listings to database
      const savedJobs = [];
      for (const job of result.jobs) {
        try {
          // Check if job already exists by externalId
          const existingJob = await storage.getJobListingByExternalId(userId, job.externalId);
          if (!existingJob) {
            const savedJob = await storage.createJobListing(job);
            savedJobs.push(savedJob);
          } else {
            savedJobs.push(existingJob);
          }
        } catch (e) {
          console.error("Error saving job listing:", e);
        }
      }
      
      res.json({
        jobs: savedJobs,
        hasMore: result.hasMore,
        total: result.total
      });
    } catch (error) {
      console.error("Error searching jobs:", error);
      res.status(500).json({ message: "Failed to search jobs" });
    }
  });
  
  apiRouter.get("/job-platform/job-details", async (req, res) => {
    try {
      const userId = parseInt(req.query.userId as string);
      const platform = req.query.platform as string;
      const externalId = req.query.externalId as string;
      
      if (isNaN(userId) || !platform || !externalId) {
        return res.status(400).json({ message: "Missing required parameters" });
      }
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Get credentials for the specified platform
      let credentials: any = {};
      if (platform.toLowerCase() === 'linkedin') {
        credentials = user.linkedinCredentials;
      } else if (platform.toLowerCase() === 'indeed') {
        credentials = user.indeedCredentials;
      } else {
        return res.status(400).json({ message: "Unsupported platform" });
      }
      
      if (!credentials) {
        return res.status(400).json({ 
          message: `No ${platform} credentials found. Please add your credentials in Settings.` 
        });
      }
      
      // Add userId to credentials for services to use
      const credentialsWithUserId = typeof credentials === "string" ? { ...JSON.parse(credentials || "{}"), userId } : { ...credentials, userId };
      
      // Import and use the job service factory
      const { JobServiceFactory } = require('./services/job-service-factory');
      const service = JobServiceFactory.getService(platform);
      
      if (!service) {
        return res.status(400).json({ message: "Unsupported platform" });
      }
      
      if (!service.hasValidCredentials(credentialsWithUserId)) {
        return res.status(401).json({ 
          message: `Invalid or expired ${platform} credentials. Please update your credentials in Settings.` 
        });
      }
      
      // Check if job already exists in our database
      let jobListing = await storage.getJobListingByExternalId(userId, externalId);
      
      // If not, fetch it from the platform API
      if (!jobListing) {
        const jobDetails = await service.getJobDetails(credentialsWithUserId, externalId);
        
        if (!jobDetails) {
          return res.status(404).json({ message: "Job not found on platform" });
        }
        
        // Save to database
        jobListing = await storage.createJobListing(jobDetails);
      }
      
      res.json(jobListing);
    } catch (error) {
      console.error("Error fetching job details:", error);
      res.status(500).json({ message: "Failed to fetch job details" });
    }
  });

  apiRouter.post("/job-platform/apply", async (req, res) => {
    try {
      const { userId, platform, jobId, resumeId, coverId, customMessage } = req.body;
      
      if (!userId || !platform || !jobId) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Get credentials for the specified platform
      let credentials;
      if (platform.toLowerCase() === 'linkedin') {
        credentials = user.linkedinCredentials;
      } else if (platform.toLowerCase() === 'indeed') {
        credentials = user.indeedCredentials;
      } else {
        return res.status(400).json({ message: "Unsupported platform" });
      }
      
      if (!credentials) {
        return res.status(400).json({ 
          message: `No ${platform} credentials found. Please add your credentials in Settings.` 
        });
      }
      
      // Add userId to credentials for services to use
      const credentialsWithUserId = typeof credentials === "string" ? { ...JSON.parse(credentials || "{}"), userId } : { ...credentials, userId };
      
      // Get the job listing to apply to
      const jobListing = await storage.getJobListing(jobId);
      if (!jobListing) {
        return res.status(404).json({ message: "Job listing not found" });
      }
      
      // Import and use the job service factory
      const { JobServiceFactory } = require('./services/job-service-factory');
      const service = JobServiceFactory.getService(platform);
      
      if (!service || !service.applyToJob) {
        return res.status(400).json({ 
          message: `Job application is not supported for ${platform} or the platform is not supported` 
        });
      }
      
      if (!service.hasValidCredentials(credentialsWithUserId)) {
        return res.status(401).json({ 
          message: `Invalid or expired ${platform} credentials. Please update your credentials in Settings.` 
        });
      }
      
      // Apply to the job
      const result = await service.applyToJob(credentialsWithUserId, jobListing.externalId, {
        resumeId,
        coverId,
        customMessage
      });
      
      if (result.success) {
        // Mark the job as applied in the database
        await storage.markJobListingAsApplied(jobId);
        
        // Create a new application record
        const application = await storage.createApplication({
          userId,
          role: jobListing.title,
          company: jobListing.company,
          description: jobListing.description,
          location: jobListing.location,
          status: "applied",
          link: jobListing.url,
          appliedAt: new Date(),
        });
        
        // Update user stats
        const stats = await storage.getUserStats(userId);
        if (stats) {
          await storage.updateUserStats(stats.id, {
            totalApplications: stats.totalApplications + 1
          });
        }
        
        res.json({ 
          success: true, 
          message: result.message || "Application submitted successfully",
          application
        });
      } else {
        res.status(400).json({ 
          success: false, 
          message: result.message || "Failed to submit application"
        });
      }
    } catch (error) {
      console.error("Error applying to job:", error);
      res.status(500).json({ message: "Failed to apply to job" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
