import { Router } from 'express';
import { AuthController } from './auth.controller.js';
import { authProtect } from '../../middlewares/authMiddleware.js';

const router = Router();

// Unified login for all user types
router.post('/login', AuthController.login);
router.post('/forgot-password', AuthController.forgotPassword);

router.put("/user",authProtect,AuthController.updateProfile);
router.get("/profile", authProtect,AuthController.getProfile);

export default router;
