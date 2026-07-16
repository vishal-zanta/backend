import { Router } from 'express';
import { DemographyController } from './demography.controller.js';
import { authProtect } from '../../middlewares/authMiddleware.js';
import { checkPermission } from '../../middlewares/permissionMiddleware.js';

const router = Router();

router.use(authProtect);

// Demography (District) Routes
router.post('/', checkPermission("ALL"), DemographyController.createDemography);
router.get('/', DemographyController.getDemographies);
router.put('/:id', checkPermission("ALL"), DemographyController.updateDemography);
router.delete('/:id', checkPermission("ALL"), DemographyController.deleteDemography);

// ULB Routes
router.post('/ulb', checkPermission("ALL"), DemographyController.createUlb);
router.get('/ulb', DemographyController.getUlbs);
router.put('/ulb/:id', checkPermission("ALL"), DemographyController.updateUlb);
router.delete('/ulb/:id', checkPermission("ALL"), DemographyController.deleteUlb);

export default router;
