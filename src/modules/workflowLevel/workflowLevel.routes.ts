import { Router } from 'express';
import { WorkflowLevelController } from './workflowLevel.controller.js';
import { authProtect } from '../../middlewares/authMiddleware.js';
import { rbacMiddlewareForAdmin } from '../../middlewares/rbacMiddleware.js';

const router = Router();

router.use(authProtect);

router.post('/bulk-order', rbacMiddlewareForAdmin, WorkflowLevelController.bulkUpdateOrder);
router.post('/', rbacMiddlewareForAdmin, WorkflowLevelController.createLevel);
router.get('/', WorkflowLevelController.getLevels);
router.put('/:id', rbacMiddlewareForAdmin, WorkflowLevelController.updateLevel);
router.delete('/:id', rbacMiddlewareForAdmin, WorkflowLevelController.deleteLevel);

export default router;
