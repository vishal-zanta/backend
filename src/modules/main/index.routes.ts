import { Router } from "express";
import healthRoutes from "./system.routes.js";
import authRoutes from "../auth/auth.routes.js";
import userRoutes from "../users/user.routes.js";
import roleRoutes from "../roles/role.routes.js";
import complaintSourceRoutes from "../complaintSource/complaintSource.routes.js";
import serviceRoutes from "../services/service.routes.js";
import demographyRoutes from "../demography/demography.routes.js";
import slaConfigRoutes from "../slaConfig/slaConfig.routes.js";

const router = Router();

router.use("/", healthRoutes);
router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/roles", roleRoutes);
router.use("/complaint-sources", complaintSourceRoutes);
router.use("/services", serviceRoutes);
router.use("/demography", demographyRoutes);
router.use("/sla-configs", slaConfigRoutes);

export default router;
