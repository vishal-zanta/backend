import { Router } from 'express';
import { ChatController } from './chat.controller.js';
import { authProtect } from '../../middlewares/authMiddleware.js';

const router = Router();

router.use(authProtect);

import { upload } from '../../middlewares/uploadMiddleware.js';

// Conversations
router.post('/conversation', ChatController.getOrCreateConversation);
router.get('/conversations', ChatController.getConversations);

// Status
router.get('/status/:userId', ChatController.getUserStatus);

// Messages
router.post('/message', upload.single('file'), ChatController.sendMessage);
router.get('/messages/:conversationId', ChatController.getMessages);
router.put('/messages/:conversationId/read', ChatController.markAsRead);

export default router;
