import { Router } from 'express';
import { AddressController } from './address.controller.js';

const router = Router();

router.get('/districts', AddressController.getDistricts);
router.get('/districts/:districtId/blocks', AddressController.getBlocksByDistrict);
router.get('/blocks/:blockId/panchayats', AddressController.getPanchayatsByBlock);
router.get('/blocks/:blockId/thanas', AddressController.getThanasByBlock);

export default router;
