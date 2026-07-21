import { Router } from 'express';
import { WorkflowLevelController } from './workflowLevel.controller.js';
import { authProtect } from '../../middlewares/authMiddleware.js';
import { checkPermission } from '../../middlewares/permissionMiddleware.js';

const router = Router();

router.use(authProtect);

router.post('/', checkPermission("WORKFLOW_MANAGEMENT"), WorkflowLevelController.saveWorkflow);
router.get('/', WorkflowLevelController.getWorkflows);
router.get('/department/:departmentId', WorkflowLevelController.getWorkflowByDepartment);
router.get('/:id', WorkflowLevelController.getWorkflowById);
router.delete('/:id', checkPermission("WORKFLOW_MANAGEMENT"), WorkflowLevelController.deleteWorkflow);

export default router;
