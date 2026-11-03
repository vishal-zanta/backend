import { Router } from 'express';
import { AvayaController } from './avaya.controller.js';
import { authProtect } from '../../middlewares/authMiddleware.js';

const router = Router();

// Public — PBX posts events here
router.post('/webhook', AvayaController.handleWebhook);

// Authenticated
router.use(authProtect);

router.post('/call', AvayaController.makeCall);
router.post('/call/pickup', AvayaController.pickupCall);
router.get('/call/details', AvayaController.getActiveCallDetails);
router.get('/call/history', AvayaController.getCallHistory);
router.get('/agent/status', AvayaController.getAgentStatus);

export default router;
