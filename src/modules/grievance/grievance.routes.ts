import { Router } from "express";
import { GrievanceController } from "./grievance.controller.js";
import { upload } from "../../middlewares/uploadMiddleware.js";
import { citizenAuthProtect } from "../../middlewares/citizen.middleware.js";
import { authProtect } from "../../middlewares/authMiddleware.js";
import { checkPermission } from "../../middlewares/permissionMiddleware.js";
import { createLimiter } from "../../middlewares/rateLimiter.js";

const router = Router();


router.post("/citizen",  citizenAuthProtect, createLimiter, upload.any('grievance'),  GrievanceController.createGrievance);

// Get all grievances for the logged-in citizen
router.get("/citizen", citizenAuthProtect, GrievanceController.getCitizenGrievances);

// Get single grievance details for the logged-in citizen
router.get("/citizen/:id", citizenAuthProtect, GrievanceController.getCitizenGrievanceById);

// Submit feedback for a resolved grievance
router.post("/citizen/:id/feedback", citizenAuthProtect, GrievanceController.submitFeedback);

// Reopen a resolved/closed grievance
router.post("/citizen/:id/reopen", citizenAuthProtect, GrievanceController.reopenGrievance);

// Get all grievances (for agents/admins)
router.get("/all", authProtect,checkPermission("ALL_GRIEVANCE"), GrievanceController.getAllGrievances);

// Get single grievance details for admin/general
router.get("/all/:id", authProtect,checkPermission("ALL_GRIEVANCE"), GrievanceController.getAdminGrievanceById);

// Get admin dashboard analytics
router.get("/admin/dashboard-analytics", authProtect,checkPermission("ADMIN_DASHBOARD"), GrievanceController.getAdminDashboardAnalytics);

// Get officer dashboard analytics
router.get("/officer/dashboard-analytics", authProtect,checkPermission("OFFICER_DASHBOARD"), GrievanceController.getOfficerDashboardAnalytics);

// Get all grievances assigned to the logged-in officer
router.get("/officer", authProtect,checkPermission("MY_COMPLAINT"), GrievanceController.getOfficerGrievances);

// Get single grievance details for logged-in officer
router.get(
  "/officer/detail/:id",
  authProtect,
  GrievanceController.getOfficerGrievanceById,
);

// Create a grievance by an officer on behalf of a citizen
router.post("/officer/create",  authProtect,checkPermission("CREATE_GRIEVANCE"), upload.any('grievance'),  GrievanceController.createGrievanceByAgent);

// Update entire grievance details by an officer
router.put("/officer/:id", authProtect,checkPermission("UPDATE_GRIEVANCE"), GrievanceController.updateGrievanceByOfficer);

// Transfer grievance to another officer
router.patch("/officer/:id/transfer", authProtect,checkPermission("ASSIGN_GRIEVANCE"), GrievanceController.transferGrievance);

// Update grievance status
router.patch("/officer/:id/status", authProtect, GrievanceController.updateGrievanceStatus);

// Update grievance priority
router.patch("/officer/:id/priority", authProtect, GrievanceController.updateGrievancePriority);

// Upload geotagged images for a grievance by an officer
router.post(
  "/officer/:id/geotagged-images",
  authProtect,
  upload.any('fieldVisit'), // allow any field names to avoid 'unexpected field'
  GrievanceController.uploadGeotaggedImages,
);

export default router;
