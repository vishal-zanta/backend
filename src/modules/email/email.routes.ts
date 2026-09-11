import { Router } from 'express';
import { EmailController } from './email.controller.js';
import { authProtect } from '../../middlewares/authMiddleware.js';

const router = Router();

// Retrieve email statistics
router.get('/stats', authProtect, EmailController.getEmailStats);

// Retrieve all emails (for internal dashboard view)
router.get('/', authProtect, EmailController.getEmails);

// Update status to REJECTED or CLOSED
router.patch('/:id/status', authProtect, EmailController.updateStatus);


// Retrieve a single email by ID (emailId, complaintId, or _id)
router.get('/:id', authProtect, EmailController.getEmailById);

export default router;
