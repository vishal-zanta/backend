import { Router } from 'express';
import { AvayaController } from './avaya.controller.js';
import { authProtect } from '../../middlewares/authMiddleware.js';

const router = Router();

// Public — PBX posts events here
router.post('/webhook', AvayaController.handleWebhook);

// Authenticated Telephony Operations
router.use(authProtect);

// 1. Call Basic Controls
router.post('/call', AvayaController.makeCall);
router.post('/call/pickup', AvayaController.pickupCall);
router.post('/call/drop', AvayaController.dropCall);
router.post('/call/hold', AvayaController.holdCall);
router.post('/call/unhold', AvayaController.unholdCall);
router.post('/call/mute', AvayaController.muteCall);
router.post('/call/unmute', AvayaController.unmuteCall);

// 2. Transfer, Consult & Conference
router.post('/call/transfer', AvayaController.transferCall);
router.post('/call/consult', AvayaController.consultCall);
router.post('/call/consult/cancel', AvayaController.cancelConsultCall);
router.post('/call/conference', AvayaController.conferenceCall);

// 3. Status, Details, History & Transfer Targets
router.get('/call/details', AvayaController.getActiveCallDetails);
router.get('/call/history', AvayaController.getCallHistory);
router.get('/agent/status', AvayaController.getAgentStatus);
router.get('/transfer-targets', AvayaController.getTransferTargets);

export default router;
