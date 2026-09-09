import rateLimit from "express-rate-limit";
import { Request, Response, NextFunction } from "express";

// Global limiter: 1000 requests per 15 minutes
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 1000, 
  message: {
    success: false,
    message: "Too many requests from this IP, please try again after 15 minutes",
  },
  standardHeaders: true, 
  legacyHeaders: false, 
});

// Auth limiter: 10 requests per 15 minutes (for login, forgot-password)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    message: "Too many authentication attempts, please try again after 15 minutes",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// OTP limiter: 5 requests per 15 minutes (for send-otp)
export const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    message: "Too many OTP requests, please try again after 15 minutes",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// API sensitive operation limiter (e.g. creating grievances)
export const createLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50,
  message: {
    success: false,
    message: "You have exceeded the maximum allowed submissions, please try again after 1 hour",
  },
  standardHeaders: true,
  legacyHeaders: false,
});


// Public Status limiter: 10 unique complaints per 1 hour
interface RateLimitEntry {
  uniqueIds: Set<string>;
  resetTime: number;
}

const publicStatusStore = new Map<string, RateLimitEntry>();

// Cleanup interval to prevent memory leaks
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of publicStatusStore.entries()) {
    if (now > entry.resetTime) {
      publicStatusStore.delete(ip);
    }
  }
}, 60 * 60 * 1000);

export const publicStatusLimiter = (req: Request, res: Response, next: NextFunction) => {
  const ip = req.ip || req.connection?.remoteAddress || 'unknown';
  const grievanceId = String(req.params.id);

  const now = Date.now();
  const windowMs = 60 * 60 * 1000; // 1 hour

  let entry = publicStatusStore.get(ip);

  if (!entry || now > entry.resetTime) {
    entry = {
      uniqueIds: new Set<string>(),
      resetTime: now + windowMs,
    };
    publicStatusStore.set(ip, entry);
  }

  // If this ID is not in the set, and the set already has 10 IDs, block.
  if (!entry.uniqueIds.has(grievanceId) && entry.uniqueIds.size >= 10) {
    res.status(429).json({
      success: false,
      message: "You have exceeded the maximum allowed unique status checks (10) for this hour. Please try again later.",
    });
    return;
  }

  // Otherwise, add the ID to the set and allow the request
  entry.uniqueIds.add(grievanceId);
  next();
};

