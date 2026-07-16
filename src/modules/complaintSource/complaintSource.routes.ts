import { Router } from 'express';
import { ComplaintSourceController } from './complaintSource.controller.js';
import { authProtect } from '../../middlewares/authMiddleware.js';
import { checkPermission } from '../../middlewares/permissionMiddleware.js';

const router = Router();

router.get('/', ComplaintSourceController.getSources);

router.use(authProtect);
router.post('/', checkPermission("ALL"), ComplaintSourceController.createSource);
router.put('/:id', checkPermission("ALL"), ComplaintSourceController.updateSource);
router.delete('/:id', checkPermission("ALL"), ComplaintSourceController.deleteSource);

export default router;
