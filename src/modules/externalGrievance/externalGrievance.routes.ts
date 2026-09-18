import { Router } from 'express';
import { ExternalGrievanceController } from './externalGrievance.controller.js';
import { authProtect } from '../../middlewares/authMiddleware.js';
import { citizenAuthProtect } from '../../middlewares/citizen.middleware.js';
import { upload } from '../../middlewares/uploadMiddleware.js';

const router = Router();

// ==========================
// CITIZEN ROUTES
// ==========================
router.post('/citizen', citizenAuthProtect, ExternalGrievanceController.createGrievance);
router.get('/citizen/:id', citizenAuthProtect, ExternalGrievanceController.getCitizenGrievanceById);
router.post('/citizen/:id/files', citizenAuthProtect, upload.any(), ExternalGrievanceController.uploadFiles);
router.get('/citizen/master-data/:departmentCode', citizenAuthProtect, ExternalGrievanceController.getMasterData);
router.get('/citizen/district-data/:departmentCode', citizenAuthProtect, ExternalGrievanceController.getDistrictData);

// ==========================
// OFFICER ROUTES
// ==========================
router.post('/', authProtect, ExternalGrievanceController.createGrievance);
router.get('/', authProtect, ExternalGrievanceController.getGrievances);
router.get('/master-data/:departmentCode', authProtect, ExternalGrievanceController.getMasterData);
router.get('/district-data/:departmentCode', authProtect, ExternalGrievanceController.getDistrictData);
router.get('/:id', authProtect, ExternalGrievanceController.getGrievanceById);
router.post('/:id/files', authProtect, upload.any(), ExternalGrievanceController.uploadFiles);

export default router;
 