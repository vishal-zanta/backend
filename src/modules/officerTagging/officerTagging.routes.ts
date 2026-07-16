import { Router } from 'express';
import { OfficerTaggingController } from './officerTagging.controller.js';
import { authProtect } from '../../middlewares/authMiddleware.js';
import { checkPermission } from '../../middlewares/permissionMiddleware.js';

const router = Router();

router.use(authProtect);

router.post('/', checkPermission("ALL"), OfficerTaggingController.createTagging);
router.get('/', OfficerTaggingController.getTaggings);
router.put('/:id', checkPermission("ALL"), OfficerTaggingController.updateTagging);
router.delete('/:id', checkPermission("ALL"), OfficerTaggingController.deleteTagging);

export default router;
