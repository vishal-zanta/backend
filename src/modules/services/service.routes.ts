import { Router } from 'express';
import { ServiceController } from './service.controller.js';
import { authProtect } from '../../middlewares/authMiddleware.js';
import { checkPermission } from '../../middlewares/permissionMiddleware.js';

const router = Router();

router.get('/', ServiceController.getServices);
router.get('/sub', ServiceController.getSubServices);
router.use(authProtect);

// Service Routes
router.post('/', checkPermission("ALL"), ServiceController.createService);
router.put('/:id', checkPermission("ALL"), ServiceController.updateService);
router.delete('/:id', checkPermission("ALL"), ServiceController.deleteService);

// Sub-Service Routes
router.post('/sub', checkPermission("ALL"), ServiceController.createSubService);
router.put('/sub/:id', checkPermission("ALL"), ServiceController.updateSubService);
router.delete('/sub/:id', checkPermission("ALL"), ServiceController.deleteSubService);

export default router;
