import { Router } from 'express';
import { SlaConfigController } from './slaConfig.controller.js';
import { authProtect } from '../../middlewares/authMiddleware.js';
import { rbacMiddlewareForAdmin } from '../../middlewares/rbacMiddleware.js';

const router = Router();

router.use(authProtect);

router.post('/', rbacMiddlewareForAdmin, SlaConfigController.createConfig);
router.get('/', SlaConfigController.getConfigs);
router.put('/:id', rbacMiddlewareForAdmin, SlaConfigController.updateConfig);
router.delete('/:id', rbacMiddlewareForAdmin, SlaConfigController.deleteConfig);

export default router;
