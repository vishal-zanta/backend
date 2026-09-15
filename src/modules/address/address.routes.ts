import { Router } from 'express';
import { AddressController } from './address.controller.js';

const router = Router();

// Hierarchy Routes
router.get('/districts', AddressController.getDistricts);
router.get('/districts/:districtId/blocks', AddressController.getBlocksByDistrict);
router.get('/districts/:districtId/ulbs', AddressController.getUrbanLocalBodiesByDistrict);

router.get('/blocks/:blockId/panchayats', AddressController.getPanchayatsByBlock);
// router.get('/blocks/:blockId/thanas', AddressController.getThanasByBlock);

router.get('/panchayats/:panchayatId/villages', AddressController.getVillagesByPanchayat);

router.get('/ulbs/:ulbId/wards', AddressController.getWardsByUlb);

export default router;
