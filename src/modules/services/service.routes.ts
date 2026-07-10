import { Router } from 'express';
import { ServiceController } from './service.controller.js';
import { authProtect } from '../../middlewares/authMiddleware.js';
import { rbacMiddlewareForAdmin } from '../../middlewares/rbacMiddleware.js';

const router = Router();

router.get('/', ServiceController.getServices);
router.get('/sub', ServiceController.getSubServices);
router.use(authProtect);

// Service Routes
router.post('/', rbacMiddlewareForAdmin, ServiceController.createService);
router.put('/:id', rbacMiddlewareForAdmin, ServiceController.updateService);
router.delete('/:id', rbacMiddlewareForAdmin, ServiceController.deleteService);

// Sub-Service Routes
router.post('/sub', rbacMiddlewareForAdmin, ServiceController.createSubService);
router.put('/sub/:id', rbacMiddlewareForAdmin, ServiceController.updateSubService);
router.delete('/sub/:id', rbacMiddlewareForAdmin, ServiceController.deleteSubService);

export default router;
