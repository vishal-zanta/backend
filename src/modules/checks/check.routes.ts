import { Router } from "express";
import { CheckController } from "./check.controller.js";

const router = Router();

// Publicly accessible monitoring endpoints (read-only)
router.get("/monitoring", CheckController.getMonitoring);
router.get("/down-docs", CheckController.getDownDocs);
router.get("/history", CheckController.getHistory);

export default router;
