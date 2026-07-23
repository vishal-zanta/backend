import { Router } from 'express';
import { ApiKeyController } from './apiKey.controller.js';
import { authProtect } from '../../middlewares/authMiddleware.js';
import { authorizeRoles } from '../../middlewares/rbacMiddleware.js';
import { ROLES } from '../../config/roles.config.js';

const router = Router();

router.use(authProtect);
// Ensure only super admin or specific admin roles can manage API keys
router.use(authorizeRoles(ROLES.ADMIN));

router.post('/', ApiKeyController.createApiKey);
router.get('/', ApiKeyController.getApiKeys);
router.patch('/:id/toggle', ApiKeyController.toggleApiKeyStatus);
router.delete('/:id', ApiKeyController.deleteApiKey);

export default router;
