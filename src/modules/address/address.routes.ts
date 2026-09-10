import { Router } from 'express';
import { AddressController } from './address.controller.js';
import { checkPermission } from '../../middlewares/permissionMiddleware.js';

const router = Router();

// Hierarchy Routes
router.get('/divisions', AddressController.getDivisions);
router.get('/divisions/:divisionId/districts', AddressController.getDistrictsByDivision);
router.get('/districts', AddressController.getDistricts); // legacy
router.get('/districts/:districtId/subdivisions', AddressController.getSubdivisionsByDistrict);
router.get('/districts/:districtId/blocks', AddressController.getBlocksByDistrict); // legacy
router.get('/subdivisions/:subdivisionId/blocks', AddressController.getBlocksBySubdivision);
router.get('/blocks/:blockId/panchayats', AddressController.getPanchayatsByBlock);
router.get('/blocks/:blockId/thanas', AddressController.getThanasByBlock);


export default router;
