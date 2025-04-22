import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";
import { z } from "zod";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  title: text("title").notNull(),
  email: text("email").notNull(),
  profileImageUrl: text("profile_image_url"),
  linkedinCredentials: jsonb("linkedin_credentials"),
  indeedCredentials: jsonb("indeed_credentials"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  name: true,
  title: true,
  email: true,
  profileImageUrl: true,
  linkedinCredentials: true,
  indeedCredentials: true,
});

// Job application schema
export const applications = pgTable("applications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  role: text("role").notNull(),
  company: text("company").notNull(),
  description: text("description"),
  location: text("location"),
  salaryRange: text("salary_range"),
  status: text("status").notNull().default("applied"),
  link: text("link"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  appliedAt: timestamp("applied_at"),
  responseAt: timestamp("response_at"),
});

export const insertApplicationSchema = createInsertSchema(applications).pick({
  userId: true,
  role: true,
  company: true,
  description: true,
  location: true,
  salaryRange: true,
  status: true,
  link: true,
  notes: true,
  appliedAt: true,
  responseAt: true,
});

// Document templates schema
export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  type: text("type").notNull(), // resume, cover_letter, follow_up
  content: text("content").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertDocumentSchema = createInsertSchema(documents).pick({
  userId: true,
  name: true,
  type: true,
  content: true,
});

// Portfolio projects schema
export const portfolioProjects = pgTable("portfolio_projects", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url"),
  githubUrl: text("github_url"),
  projectUrl: text("project_url"),
  technologies: text("technologies").array(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertPortfolioProjectSchema = createInsertSchema(portfolioProjects).pick({
  userId: true,
  name: true,
  description: true,
  imageUrl: true,
  githubUrl: true,
  projectUrl: true,
  technologies: true,
});

// Job listings schema (from external sources)
export const jobListings = pgTable("job_listings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  source: text("source").notNull(), // linkedin, indeed, etc.
  externalId: text("external_id").notNull(),
  title: text("title").notNull(),
  company: text("company").notNull(),
  location: text("location"),
  description: text("description"),
  salary: text("salary"),
  url: text("url").notNull(),
  isRemote: boolean("is_remote"),
  postedAt: timestamp("posted_at"),
  savedAt: timestamp("saved_at").notNull().defaultNow(),
  applied: boolean("applied").default(false),
  hidden: boolean("hidden").default(false),
  details: jsonb("details"), // additional data from the source
});

export const insertJobListingSchema = createInsertSchema(jobListings).pick({
  userId: true,
  source: true,
  externalId: true,
  title: true,
  company: true,
  location: true,
  description: true,
  salary: true,
  url: true,
  isRemote: true,
  postedAt: true,
  applied: true,
  hidden: true,
  details: true,
});

// Job search filters schema
export const jobSearchFilters = pgTable("job_search_filters", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  keywords: text("keywords").array(),
  locations: text("locations").array(),
  remoteOnly: boolean("remote_only").default(false),
  excludeKeywords: text("exclude_keywords").array(),
  experience: text("experience"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertJobSearchFilterSchema = createInsertSchema(jobSearchFilters).pick({
  userId: true,
  name: true,
  keywords: true,
  locations: true,
  remoteOnly: true,
  excludeKeywords: true,
  experience: true,
});

// Analytics stats schema
export const stats = pgTable("stats", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  totalApplications: integer("total_applications").notNull().default(0),
  interviewRate: integer("interview_rate").notNull().default(0),
  avgResponseTime: integer("avg_response_time").notNull().default(0),
  aiGeneratedDocs: integer("ai_generated_docs").notNull().default(0),
});

export const insertStatsSchema = createInsertSchema(stats).pick({
  userId: true,
  totalApplications: true,
  interviewRate: true,
  avgResponseTime: true,
  aiGeneratedDocs: true,
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  applications: many(applications),
  documents: many(documents),
  portfolioProjects: many(portfolioProjects),
  jobListings: many(jobListings),
  jobSearchFilters: many(jobSearchFilters),
  stats: many(stats),
}));

export const applicationsRelations = relations(applications, ({ one }) => ({
  user: one(users, {
    fields: [applications.userId],
    references: [users.id],
  }),
}));

export const documentsRelations = relations(documents, ({ one }) => ({
  user: one(users, {
    fields: [documents.userId],
    references: [users.id],
  }),
}));

export const portfolioProjectsRelations = relations(portfolioProjects, ({ one }) => ({
  user: one(users, {
    fields: [portfolioProjects.userId],
    references: [users.id],
  }),
}));

export const jobListingsRelations = relations(jobListings, ({ one }) => ({
  user: one(users, {
    fields: [jobListings.userId],
    references: [users.id],
  }),
}));

export const jobSearchFiltersRelations = relations(jobSearchFilters, ({ one }) => ({
  user: one(users, {
    fields: [jobSearchFilters.userId],
    references: [users.id],
  }),
}));

export const statsRelations = relations(stats, ({ one }) => ({
  user: one(users, {
    fields: [stats.userId],
    references: [users.id],
  }),
}));

// Type exports
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Application = typeof applications.$inferSelect;
export type InsertApplication = z.infer<typeof insertApplicationSchema>;

export type Document = typeof documents.$inferSelect;
export type InsertDocument = z.infer<typeof insertDocumentSchema>;

export type PortfolioProject = typeof portfolioProjects.$inferSelect;
export type InsertPortfolioProject = z.infer<typeof insertPortfolioProjectSchema>;

export type JobListing = typeof jobListings.$inferSelect;
export type InsertJobListing = z.infer<typeof insertJobListingSchema>;

export type JobSearchFilter = typeof jobSearchFilters.$inferSelect;
export type InsertJobSearchFilter = z.infer<typeof insertJobSearchFilterSchema>;

export type Stat = typeof stats.$inferSelect;
export type InsertStat = z.infer<typeof insertStatsSchema>;
