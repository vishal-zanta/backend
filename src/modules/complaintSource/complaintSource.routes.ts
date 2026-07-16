import { Router } from 'express';
import { ComplaintSourceController } from './complaintSource.controller.js';
import { authProtect } from '../../middlewares/authMiddleware.js';
import { checkPermission } from '../../middlewares/permissionMiddleware.js';

const router = Router();

router.get('/', ComplaintSourceController.getSources);

router.use(authProtect);
router.post('/', checkPermission("SOURCE_MANAGEMENT"), ComplaintSourceController.createSource);
router.put('/:id', checkPermission("SOURCE_MANAGEMENT"), ComplaintSourceController.updateSource);
router.delete('/:id', checkPermission("SOURCE_MANAGEMENT"), ComplaintSourceController.deleteSource);

export default router;
