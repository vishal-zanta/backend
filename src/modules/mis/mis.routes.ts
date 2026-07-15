import { Router } from "express";
import { authProtect } from "../../middlewares/authMiddleware.js";
import { MisController } from "./mis.controller.js";

const router = Router();

router.get("/stats", authProtect, MisController.getStats);
router.get("/reports", authProtect, MisController.getReport);

export default router;
