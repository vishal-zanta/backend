import { Router } from 'express';
import { WorkflowLevelController } from './workflowLevel.controller.js';
import { authProtect } from '../../middlewares/authMiddleware.js';
import { checkPermission } from '../../middlewares/permissionMiddleware.js';

const router = Router();

router.use(authProtect);

router.post('/bulk-order', checkPermission("WORKFLOW_MANAGEMENT"), WorkflowLevelController.bulkUpdateOrder);
router.post('/', checkPermission("WORKFLOW_MANAGEMENT"), WorkflowLevelController.createLevel);
router.get('/', WorkflowLevelController.getLevels);
router.put('/:id', checkPermission("WORKFLOW_MANAGEMENT"), WorkflowLevelController.updateLevel);
router.delete('/:id', checkPermission("WORKFLOW_MANAGEMENT"), WorkflowLevelController.deleteLevel);

export default router;
