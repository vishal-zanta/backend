import { Router } from 'express';
import { WorkflowLevelController } from './workflowLevel.controller.js';
import { authProtect } from '../../middlewares/authMiddleware.js';
import { checkPermission } from '../../middlewares/permissionMiddleware.js';

const router = Router();

router.use(authProtect);

router.post('/bulk-order', checkPermission("ALL"), WorkflowLevelController.bulkUpdateOrder);
router.post('/', checkPermission("ALL"), WorkflowLevelController.createLevel);
router.get('/', WorkflowLevelController.getLevels);
router.put('/:id', checkPermission("ALL"), WorkflowLevelController.updateLevel);
router.delete('/:id', checkPermission("ALL"), WorkflowLevelController.deleteLevel);

export default router;
