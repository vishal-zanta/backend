import { Router } from 'express';
import { ThirdPartyGrievanceController } from './thirdPartyGrievance.controller.js';
import { apiKeyAuthMiddleware } from '../../middlewares/apiKeyMiddleware.js';

import { upload } from '../../middlewares/uploadMiddleware.js';

import { OptionController } from '../options/option.controller.js';
import { ComplaintSourceController } from '../complaintSource/complaintSource.controller.js';
import { DemographyController } from '../demography/demography.controller.js';
import { DepartmentController } from '../departments/department.controller.js';
import { ServiceController } from '../services/service.controller.js';

const router = Router();

// Protect all third-party routes with the API Key middleware
router.use(apiKeyAuthMiddleware);

router.get('/metadata/options', OptionController.getOptions);
router.get('/metadata/complaint-sources', ComplaintSourceController.getSources);
router.get('/metadata/demographics', DemographyController.getDemographies);
router.get('/metadata/departments', DepartmentController.getDepartments);
router.get('/metadata/services', ServiceController.getServices);
router.get('/metadata/sub-services', ServiceController.getSubServices);

router.post('/', upload.array('files', 5, 'grievance'), ThirdPartyGrievanceController.registerGrievance);
router.get('/track', ThirdPartyGrievanceController.trackGrievances);
router.get('/:id', ThirdPartyGrievanceController.getGrievanceById);
router.patch('/:id', ThirdPartyGrievanceController.updateGrievanceStatus);
router.patch('/:id/priority', ThirdPartyGrievanceController.updateGrievancePriority);

export default router;
