import { Router } from "express";
import { GrievanceController } from "./grievance.controller.js";
import { upload } from "../../middlewares/uploadMiddleware.js";
import { citizenAuthProtect } from "../../middlewares/citizen.middleware.js";

const router = Router();


router.post("/citizen",  citizenAuthProtect,  upload.array("attachments", 5),  GrievanceController.createGrievance);

// Get all grievances for the logged-in citizen
router.get("/citizen", citizenAuthProtect, GrievanceController.getCitizenGrievances);

export default router;
