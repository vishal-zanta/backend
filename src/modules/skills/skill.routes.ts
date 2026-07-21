import { Router } from 'express';
import { SkillController } from './skill.controller.js';
import { authProtect } from '../../middlewares/authMiddleware.js';
import { checkPermission } from '../../middlewares/permissionMiddleware.js';

const router = Router();

router.use(authProtect);

// Only admins with USER_MANAGEMENT permission can manage skills
router.post('/', checkPermission("USER_MANAGEMENT"), SkillController.createSkill);
router.get('/', SkillController.getSkills);
router.put('/:id', checkPermission("USER_MANAGEMENT"), SkillController.updateSkill);
router.delete('/:id', checkPermission("USER_MANAGEMENT"), SkillController.deleteSkill);

export default router;
