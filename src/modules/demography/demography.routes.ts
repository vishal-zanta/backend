import { Router } from 'express';
import { DemographyController } from './demography.controller.js';
import { authProtect } from '../../middlewares/authMiddleware.js';
import { checkPermission } from '../../middlewares/permissionMiddleware.js';

const router = Router();

router.get('/', DemographyController.getDemographies);
router.use(authProtect);

// Demography (District) Routes
router.post('/', checkPermission("DEMOGRAPHY_MANAGEMENT"), DemographyController.createDemography);
router.put('/:id', checkPermission("DEMOGRAPHY_MANAGEMENT"), DemographyController.updateDemography);
router.delete('/:id', checkPermission("DEMOGRAPHY_MANAGEMENT"), DemographyController.deleteDemography);

// ULB Routes
router.post('/ulb', checkPermission("DEMOGRAPHY_MANAGEMENT"), DemographyController.createUlb);
router.get('/ulb', DemographyController.getUlbs);
router.put('/ulb/:id', checkPermission("DEMOGRAPHY_MANAGEMENT"), DemographyController.updateUlb);
router.delete('/ulb/:id', checkPermission("DEMOGRAPHY_MANAGEMENT"), DemographyController.deleteUlb);

export default router;
