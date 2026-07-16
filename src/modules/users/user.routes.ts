import { Router } from 'express';
import { UserController } from './user.controller.js';
import { authProtect } from '../../middlewares/authMiddleware.js';
import { checkPermission } from '../../middlewares/permissionMiddleware.js';

const router = Router();

router.use(authProtect);

router.post('/', checkPermission("USER_MANAGEMENT"), UserController.createUser);
router.get('/',  UserController.getUsers);
router.put('/:id', checkPermission("USER_MANAGEMENT"), UserController.updateUser);
router.delete('/:id', checkPermission("USER_MANAGEMENT"), UserController.deleteUser);

export default router;
