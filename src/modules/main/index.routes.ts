import { Router } from "express";
import healthRoutes from "./system.routes.js";
import authRoutes from "../auth/auth.routes.js";
import userRoutes from "../users/user.routes.js";
import roleRoutes from "../roles/role.routes.js";
import complaintSourceRoutes from "../complaintSource/complaintSource.routes.js";
import serviceRoutes from "../services/service.routes.js";
import demographyRoutes from "../demography/demography.routes.js";
import slaConfigRoutes from "../slaConfig/slaConfig.routes.js";
import officerTaggingRoutes from "../officerTagging/officerTagging.routes.js";
import workflowLevelRoutes from "../workflowLevel/workflowLevel.routes.js";
import captchaRoutes from "../captcha/captcha.routes.js";
import citizenRoutes from "../citizen/citizen.routes.js";
import grievanceRoutes from "../grievance/grievance.routes.js";
import optionsRoutes from "../options/option.routes.js";
import fieldVisitRoutes from "../fieldVisit/fieldVisit.routes.js";

const router = Router();

router.use("/", healthRoutes);
router.use("/captcha", captchaRoutes);
router.use("/citizen", citizenRoutes);
router.use("/auth", authRoutes);
router.use("/options", optionsRoutes);
router.use("/users", userRoutes);
router.use("/roles", roleRoutes);
router.use("/complaint-sources", complaintSourceRoutes);
router.use("/services", serviceRoutes);
router.use("/demography", demographyRoutes);
router.use("/sla-configs", slaConfigRoutes);
router.use("/officer-taggings", officerTaggingRoutes);
router.use("/workflow-levels", workflowLevelRoutes);
router.use("/grievances", grievanceRoutes);
router.use("/visits", fieldVisitRoutes);

export default router;
