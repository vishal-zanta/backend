import { Router } from 'express';
import { NotificationController } from './notification.controller.js';
import { authProtect } from '../../middlewares/authMiddleware.js';

const router = Router();

// All notification routes require the user to be logged in
router.use(authProtect);

router.get('/', NotificationController.getMyNotifications);
router.put('/read-all', NotificationController.markAllAsRead);
router.put('/:id/read', NotificationController.markAsRead);

export default router;
