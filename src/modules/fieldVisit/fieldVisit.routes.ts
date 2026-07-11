import { Router } from "express";
import { FieldVisitController } from "./fieldVisit.controller.js";
import { authProtect } from "../../middlewares/authMiddleware.js";

const router = Router();

// Get field visits assigned to the logged-in officer
router.get("/", authProtect, FieldVisitController.getVisits);

// Update a specific field visit (status, schedule)
router.put("/:id", authProtect, FieldVisitController.updateVisit);

export default router;
