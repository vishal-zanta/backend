import { Router } from 'express';
import { OfficerTaggingController } from './officerTagging.controller.js';
import { authProtect } from '../../middlewares/authMiddleware.js';
import { rbacMiddlewareForAdmin } from '../../middlewares/rbacMiddleware.js';

const router = Router();

router.use(authProtect);

router.post('/', rbacMiddlewareForAdmin, OfficerTaggingController.createTagging);
router.get('/', OfficerTaggingController.getTaggings);
router.put('/:id', rbacMiddlewareForAdmin, OfficerTaggingController.updateTagging);
router.delete('/:id', rbacMiddlewareForAdmin, OfficerTaggingController.deleteTagging);

export default router;
