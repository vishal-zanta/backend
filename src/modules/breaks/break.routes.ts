import { Router } from 'express';
import { BreakController } from './break.controller.js';
import { authProtect } from '../../middlewares/authMiddleware.js';
import { authorizeRoles } from '../../middlewares/rbacMiddleware.js';
import { ROLES } from '../../config/roles.config.js';

const router = Router();

router.use(authProtect);

router.post('/toggle', BreakController.toggleBreak);
router.get('/status', BreakController.getStatus);
router.get('/my-breaks', BreakController.getMyBreaks);
router.get('/user/:id', authorizeRoles(ROLES.ADMIN), BreakController.getUserBreaks);

export default router;
