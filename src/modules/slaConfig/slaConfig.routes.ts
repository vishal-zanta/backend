import { Router } from 'express';
import { SlaConfigController } from './slaConfig.controller.js';
import { authProtect } from '../../middlewares/authMiddleware.js';
import { checkPermission } from '../../middlewares/permissionMiddleware.js';

const router = Router();

router.use(authProtect);

router.post('/', checkPermission("ALL"), SlaConfigController.createConfig);
router.get('/', SlaConfigController.getConfigs);
router.put('/:id', checkPermission("ALL"), SlaConfigController.updateConfig);
router.delete('/:id', checkPermission("ALL"), SlaConfigController.deleteConfig);

export default router;
