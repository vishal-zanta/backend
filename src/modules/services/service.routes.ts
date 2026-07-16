import { Router } from 'express';
import { ServiceController } from './service.controller.js';
import { authProtect } from '../../middlewares/authMiddleware.js';
import { checkPermission } from '../../middlewares/permissionMiddleware.js';

const router = Router();

router.get('/', ServiceController.getServices);
router.get('/sub', ServiceController.getSubServices);
router.use(authProtect);

// Service Routes
router.post('/', checkPermission("SERVICE_MANAGEMENT"), ServiceController.createService);
router.put('/:id', checkPermission("SERVICE_MANAGEMENT"), ServiceController.updateService);
router.delete('/:id', checkPermission("SERVICE_MANAGEMENT"), ServiceController.deleteService);

// Sub-Service Routes
router.post('/sub', checkPermission("SERVICE_MANAGEMENT"), ServiceController.createSubService);
router.put('/sub/:id', checkPermission("SERVICE_MANAGEMENT"), ServiceController.updateSubService);
router.delete('/sub/:id', checkPermission("SERVICE_MANAGEMENT"), ServiceController.deleteSubService);

export default router;
