import { Router } from 'express';
import { RoleController } from './role.controller.js';
import { authProtect } from '../../middlewares/authMiddleware.js';
import {  rbacMiddlewareForAdmin } from '../../middlewares/rbacMiddleware.js';

const router = Router();

router.use(authProtect);

router.post('/', rbacMiddlewareForAdmin, RoleController.createRole);
router.get('/', RoleController.getRoles);
router.put('/:id', rbacMiddlewareForAdmin, RoleController.updateRole);
router.delete('/:id', rbacMiddlewareForAdmin, RoleController.deleteRole);

export default router;
