import { Router } from 'express';
import { BreakController } from './break.controller.js';
import { authProtect } from '../../middlewares/authMiddleware.js';

const router = Router();

router.use(authProtect);

router.post('/toggle', BreakController.toggleBreak);
router.get('/status', BreakController.getStatus);

export default router;
