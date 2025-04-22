import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";
import MemoryStore from "memorystore";

// Extend Express.User with our User type
declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

// Hash password with salt
async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

// Compare supplied password with stored hashed password
async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuth(app: Express) {
  const MemorySessionStore = MemoryStore(session);
  
  // Session configuration
  const sessionStore = new MemorySessionStore({
    checkPeriod: 86400000 // prune expired entries every 24h
  });
  
  // Configure session middleware
  const sessionOptions: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "ApplyArmor-Secret-Key", // Use env var in production
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    }
  };

  app.use(session(sessionOptions));
  app.use(passport.initialize());
  app.use(passport.session());

  // Configure passport local strategy
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        
        if (!user) {
          return done(null, false, { message: "Incorrect username" });
        }
        
        const isValid = await comparePasswords(password, user.password);
        
        if (!isValid) {
          return done(null, false, { message: "Incorrect password" });
        }
        
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    })
  );

  // Serialize user to the session
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  // Deserialize user from the session
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  // Login route
  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
      if (err) {
        return next(err);
      }
      
      if (!user) {
        return res.status(401).json({ message: info?.message || "Authentication failed" });
      }
      
      req.login(user, (err) => {
        if (err) {
          return next(err);
        }
        return res.json(user);
      });
    })(req, res, next);
  });

  // Register route
  app.post("/api/register", async (req, res, next) => {
    try {
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      // Hash password
      const hashedPassword = await hashPassword(req.body.password);
      
      // Create user with hashed password
      const user = await storage.createUser({
        ...req.body,
        password: hashedPassword,
        profileImageUrl: req.body.profileImageUrl || null
      });

      // Log the user in
      req.login(user, (err) => {
        if (err) {
          return next(err);
        }
        res.status(201).json(user);
      });
    } catch (error) {
      next(error);
    }
  });

  // Logout route
  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) {
        return next(err);
      }
      res.sendStatus(200);
    });
  });

  // Get current user route
  app.get("/api/me", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    res.json(req.user);
  });
}