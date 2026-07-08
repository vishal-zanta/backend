import { Router } from 'express';
import { ComplaintSourceController } from './complaintSource.controller.js';
import { authProtect } from '../../middlewares/authMiddleware.js';
import { rbacMiddlewareForAdmin } from '../../middlewares/rbacMiddleware.js';

const router = Router();

router.use(authProtect);

router.post('/', rbacMiddlewareForAdmin, ComplaintSourceController.createSource);
router.get('/', ComplaintSourceController.getSources);
router.put('/:id', rbacMiddlewareForAdmin, ComplaintSourceController.updateSource);
router.delete('/:id', rbacMiddlewareForAdmin, ComplaintSourceController.deleteSource);

export default router;
