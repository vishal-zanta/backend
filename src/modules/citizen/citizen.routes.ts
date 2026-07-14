import { Router } from "express";
import { CitizenController } from "./citizen.controller.js";
import { citizenAuthProtect } from "../../middlewares/citizen.middleware.js";

const router = Router();

// Public routes
router.post("/send-otp", CitizenController.sendOtp);
router.post("/login", CitizenController.login);

// Protected routes (requires JWT)
router.get("/profile", citizenAuthProtect, CitizenController.getProfile);
router.put("/profile", citizenAuthProtect, CitizenController.updateProfile);
router.get("/dashboard-analytics", citizenAuthProtect, CitizenController.getDashboardAnalytics);

export default router;
