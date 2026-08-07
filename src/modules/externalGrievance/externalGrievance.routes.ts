import { Router } from 'express';
import { ExternalGrievanceController } from './externalGrievance.controller.js';
import { authProtect } from '../../middlewares/authMiddleware.js';

const router = Router();

// Protect routes - assuming only authenticated internal agents use these
router.use(authProtect);

router.post('/', ExternalGrievanceController.createGrievance);
router.get('/', ExternalGrievanceController.getGrievances);
router.get('/master-data/:departmentCode', ExternalGrievanceController.getMasterData);
router.get('/district-data/:departmentCode', ExternalGrievanceController.getDistrictData);
router.get('/:id', ExternalGrievanceController.getGrievanceById);

export default router;
