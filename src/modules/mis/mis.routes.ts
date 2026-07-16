import { Router } from "express";
import { authProtect } from "../../middlewares/authMiddleware.js";
import { MisController } from "./mis.controller.js";
import { checkPermission } from "../../middlewares/permissionMiddleware.js";

const router = Router();

router.get("/stats", authProtect,checkPermission("MIS_REPORT"), MisController.getStats);
router.get("/reports", authProtect,checkPermission("MIS_REPORT"), MisController.getReport);

export default router;
