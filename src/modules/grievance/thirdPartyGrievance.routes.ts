import { Router } from 'express';
import { ThirdPartyGrievanceController } from './thirdPartyGrievance.controller.js';
import { apiKeyAuthMiddleware } from '../../middlewares/apiKeyMiddleware.js';

import { upload } from '../../middlewares/uploadMiddleware.js';

const router = Router();

// Protect all third-party routes with the API Key middleware
router.use(apiKeyAuthMiddleware);

router.post('/', upload.array('files', 5, 'grievance'), ThirdPartyGrievanceController.registerGrievance);
router.get('/track', ThirdPartyGrievanceController.trackGrievances);
router.get('/:id', ThirdPartyGrievanceController.getGrievanceById);
router.patch('/:id', ThirdPartyGrievanceController.updateGrievanceStatus);
router.patch('/:id/priority', ThirdPartyGrievanceController.updateGrievancePriority);

export default router;
