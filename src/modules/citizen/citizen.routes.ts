import { Router } from "express";
import { CitizenController } from "./citizen.controller.js";
import { citizenAuthProtect } from "../../middlewares/citizen.middleware.js";
import { authLimiter, otpLimiter } from "../../middlewares/rateLimiter.js";

const router = Router();

// Public routes
router.post("/send-otp", otpLimiter, CitizenController.sendOtp);
router.post("/login", authLimiter, CitizenController.login);

// Protected routes (requires JWT)
router.get("/profile", citizenAuthProtect, CitizenController.getProfile);
router.put("/profile", citizenAuthProtect, CitizenController.updateProfile);
router.get("/dashboard-analytics", citizenAuthProtect, CitizenController.getDashboardAnalytics);

export default router;
