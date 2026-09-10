import { Router } from 'express';
import { ServiceController } from './service.controller.js';
import { authProtect } from '../../middlewares/authMiddleware.js';
import { checkPermission } from '../../middlewares/permissionMiddleware.js';

const router = Router();

router.get('/', ServiceController.getServices);
router.use(authProtect);

// Service Routes
router.post('/', checkPermission("SERVICE_MANAGEMENT"), ServiceController.createService);
router.put('/:id', checkPermission("SERVICE_MANAGEMENT"), ServiceController.updateService);
router.delete('/:id', checkPermission("SERVICE_MANAGEMENT"), ServiceController.deleteService);

export default router;
