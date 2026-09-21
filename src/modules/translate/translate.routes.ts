import { Router } from 'express';
import { TranslateController } from './translate.controller.js';
import { authProtect } from '../../middlewares/authMiddleware.js';

const router = Router();

// Apply authProtect to the translation route
router.post('/', authProtect, TranslateController.translateText);

export default router;
