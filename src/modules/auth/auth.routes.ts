import { Router } from 'express';
import { AuthController } from './auth.controller.js';
import { authProtect } from '../../middlewares/authMiddleware.js';
import { authLimiter } from '../../middlewares/rateLimiter.js';

const router = Router();

// Unified login for all user types
router.post('/login', authLimiter, AuthController.login);
router.post('/forgot-password', authLimiter, AuthController.forgotPassword);

router.put("/user",authProtect,AuthController.updateProfile);
router.get("/profile", authProtect,AuthController.getProfile);
router.post("/logout", authProtect, AuthController.logout);

export default router;
