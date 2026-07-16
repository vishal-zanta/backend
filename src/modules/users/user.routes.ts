import { Router } from 'express';
import { UserController } from './user.controller.js';
import { authProtect } from '../../middlewares/authMiddleware.js';
import { checkPermission } from '../../middlewares/permissionMiddleware.js';

const router = Router();

router.use(authProtect);

router.post('/', checkPermission("ALL"), UserController.createUser);
router.get('/', checkPermission("ALL"), UserController.getUsers);
router.put('/:id', checkPermission("ALL"), UserController.updateUser);
router.delete('/:id', checkPermission("ALL"), UserController.deleteUser);

export default router;
