import { Router } from 'express';
import { ActivityController } from './activity.controller.js';
import { authProtect } from '../../middlewares/authMiddleware.js';
import { checkPermission } from '../../middlewares/permissionMiddleware.js';

const router = Router();

// Endpoint for authenticated users to send a pulse
router.post('/pulse', authProtect, ActivityController.pulse);

// Endpoint for admins to get active users 
router.get('/active-users', authProtect,checkPermission("VIEW_ACTIVE_USERS"), ActivityController.getActiveUsers);

// Endpoint for admins to logout a specific user
router.post('/admin-logout/:userId', authProtect,checkPermission("LOGOUT_USERS"), ActivityController.adminLogoutUser);

export default router;
