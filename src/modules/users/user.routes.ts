import { Router } from 'express';
import { UserController } from './user.controller.js';
import { authProtect } from '../../middlewares/authMiddleware.js';

const router = Router();

router.use(authProtect);

router.post('/', UserController.createUser);
router.get('/', UserController.getUsers);
router.put('/:id', UserController.updateUser);
router.delete('/:id', UserController.deleteUser);

export default router;
