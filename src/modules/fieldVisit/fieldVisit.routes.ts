import { Router } from "express";
import { FieldVisitController } from "./fieldVisit.controller.js";
import { authProtect } from "../../middlewares/authMiddleware.js";
import { checkPermission } from "../../middlewares/permissionMiddleware.js";

const router = Router();

// Get field visit stats for the logged-in officer
router.get("/stats", authProtect, checkPermission("FIELD_VISIT"), FieldVisitController.getVisitStats);

router.get("/line-graph", authProtect, checkPermission(["FIELD_VISIT", "OFFICER_DASHBOARD", "ADMIN_DASHBOARD", "ALL_GRIEVANCE"]), FieldVisitController.getVisitTrend);

// Fetch field visits on a specific date (or date range) with connected complaint & assigned officer details
router.get("/by-date", authProtect, checkPermission(["FIELD_VISIT", "OFFICER_DASHBOARD", "ADMIN_DASHBOARD", "ALL_GRIEVANCE"]), FieldVisitController.getVisitsByDate);

// Get field visits assigned to the logged-in officer
router.get("/", authProtect,checkPermission("FIELD_VISIT"), FieldVisitController.getVisits);

// Update a specific field visit (status, schedule)
router.put("/:id", authProtect, checkPermission("FIELD_VISIT"),FieldVisitController.updateVisit);

export default router;
