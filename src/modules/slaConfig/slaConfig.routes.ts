import { Router } from 'express';
import { SlaConfigController } from './slaConfig.controller.js';
import { authProtect } from '../../middlewares/authMiddleware.js';
import { checkPermission } from '../../middlewares/permissionMiddleware.js';

const router = Router();

router.use(authProtect);

router.post('/', checkPermission("SLA_CONFIGURATION"), SlaConfigController.createConfig);
router.get('/', SlaConfigController.getConfigs);
router.put('/:id', checkPermission("SLA_CONFIGURATION"), SlaConfigController.updateConfig);
router.delete('/:id', checkPermission("SLA_CONFIGURATION"), SlaConfigController.deleteConfig);

export default router;
