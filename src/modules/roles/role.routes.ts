import { Router } from 'express';
import { RoleController } from './role.controller.js';
import { authProtect } from '../../middlewares/authMiddleware.js';
import { checkPermission } from '../../middlewares/permissionMiddleware.js';

const router = Router();

router.use(authProtect);

router.post('/', checkPermission("ALL"), RoleController.createRole);
router.get('/', RoleController.getRoles);
router.put('/:id', checkPermission("ALL"), RoleController.updateRole);
router.delete('/:id', checkPermission("ALL"), RoleController.deleteRole);

export default router;
