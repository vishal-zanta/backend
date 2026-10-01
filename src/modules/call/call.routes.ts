import { Router } from 'express';
import { CallController } from './call.controller.js';
import { authProtect } from '../../middlewares/authMiddleware.js';
import { checkPermission } from '../../middlewares/permissionMiddleware.js';

const router = Router();

// Protect all routes with auth
router.use(authProtect);

// Get paginated call history with RBAC
router.get('/', CallController.getCalls);

// Mark call as evidence
router.patch('/:id/evidence', CallController.markAsEvidence);

export default router;
