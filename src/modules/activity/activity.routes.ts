import { Router } from 'express';
import { ActivityController } from './activity.controller.js';
import { authProtect } from '../../middlewares/authMiddleware.js';

const router = Router();

// Endpoint for authenticated users to send a pulse
router.post('/pulse', authProtect, ActivityController.pulse);

// Endpoint for admins to get active users 
router.get('/active-users', authProtect, ActivityController.getActiveUsers);

// Endpoint for admins to logout a specific user
router.post('/admin-logout/:userId', authProtect, ActivityController.adminLogoutUser);

export default router;
