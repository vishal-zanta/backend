import { Router } from 'express';
import { RoleController } from './role.controller.js';
import { authProtect } from '../../middlewares/authMiddleware.js';
import { checkPermission } from '../../middlewares/permissionMiddleware.js';

const router = Router();

router.use(authProtect);

router.post('/', checkPermission("ROLE_MANAGEMENT"), RoleController.createRole);
router.get('/', RoleController.getRoles);
router.put('/:id', checkPermission("ROLE_MANAGEMENT"), RoleController.updateRole);
router.delete('/:id', checkPermission("ROLE_MANAGEMENT"), RoleController.deleteRole);

export default router;
