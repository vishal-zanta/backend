import { Router } from "express";
import healthRoutes from "./system.routes.js";
import authRoutes from "../auth/auth.routes.js";
import userRoutes from "../users/user.routes.js";
import roleRoutes from "../roles/role.routes.js";

const router = Router();

router.use("/", healthRoutes);
router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/roles", roleRoutes);

export default router;
