import rateLimit from "express-rate-limit";

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
  max: 5, 
  message: {
    success: false,
    message: "You have exceeded the maximum allowed submissions, please try again after 1 hour",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
