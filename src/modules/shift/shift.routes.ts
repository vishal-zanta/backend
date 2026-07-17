import { Router } from 'express';
import { ShiftController } from './shift.controller.js';
import { authProtect } from '../../middlewares/authMiddleware.js';
import { authorizeRoles } from '../../middlewares/rbacMiddleware.js';
import { ROLES } from '../../config/roles.config.js';

const router = Router();

// Apply auth middleware
router.use(authProtect);

// Get users with their shifts
router.get('/', ShiftController.getUsersWithShifts);

// Assign a shift (Only Admin and Supervisor can do this)
router.post('/assign', authorizeRoles(ROLES.ADMIN, ROLES.SUPERVISOR), ShiftController.assignShift);

export default router;
