import { Router } from 'express';
import { DemographyController } from './demography.controller.js';
import { authProtect } from '../../middlewares/authMiddleware.js';
import { rbacMiddlewareForAdmin } from '../../middlewares/rbacMiddleware.js';

const router = Router();

router.use(authProtect);

// Demography (District) Routes
router.post('/', rbacMiddlewareForAdmin, DemographyController.createDemography);
router.get('/', DemographyController.getDemographies);
router.put('/:id', rbacMiddlewareForAdmin, DemographyController.updateDemography);
router.delete('/:id', rbacMiddlewareForAdmin, DemographyController.deleteDemography);

// ULB Routes
router.post('/ulb', rbacMiddlewareForAdmin, DemographyController.createUlb);
router.get('/ulb', DemographyController.getUlbs);
router.put('/ulb/:id', rbacMiddlewareForAdmin, DemographyController.updateUlb);
router.delete('/ulb/:id', rbacMiddlewareForAdmin, DemographyController.deleteUlb);

export default router;
