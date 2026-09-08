import { Router } from 'express';
import { VisitorController } from './visitor.controller.js';

const router = Router();

// Public routes for visitors
router.get('/count', VisitorController.getVisitorCount);
router.post('/save', VisitorController.saveVisitor);

export const visitorRoutes = router;
