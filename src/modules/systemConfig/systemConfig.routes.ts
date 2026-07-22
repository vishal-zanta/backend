import { Router } from 'express';
import { SystemConfigController } from './systemConfig.controller.js';
import { authProtect } from '../../middlewares/authMiddleware.js';
import { checkPermission } from '../../middlewares/permissionMiddleware.js';

const router = Router();

// Get config
router.get('/', SystemConfigController.getConfig);
router.use(authProtect);


// Update config (admin only, maybe check permission like SYSTEM_CONFIG)
router.put('/', checkPermission("FILE_MANAGEMENT"), SystemConfigController.updateConfig); // Using USER_MANAGEMENT for now, or you can use another generic permission

export default router;
