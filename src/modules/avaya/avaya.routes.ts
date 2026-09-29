import { Router } from 'express';
import { AvayaController } from './avaya.controller.js';
import { authProtect } from '../../middlewares/authMiddleware.js';

const router = Router();

// Public Webhook endpoint for Avaya to post events to
router.post('/webhook', AvayaController.handleWebhook);

// Require authentication for telephony operations
router.use(authProtect);

// 1. System
// router.post('/system/connect', AvayaController.connectSystem);

// 2. Call
router.post('/call', AvayaController.makeCall);
router.post('/call/answer', AvayaController.answerCall);
router.get('/call/history', AvayaController.getCallHistory);
router.get('/call/:extension/details', AvayaController.getActiveCallDetails);

// 4. Agent
router.get('/agent/:agentId/status', AvayaController.getAgentStatus);

// 5. Queue
router.get('/queue/:queue/agents', AvayaController.getQueueAgents);

export default router;
