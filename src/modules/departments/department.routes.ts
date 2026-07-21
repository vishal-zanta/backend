import { Router } from 'express';
import { DepartmentController } from './department.controller.js';
import { authProtect } from '../../middlewares/authMiddleware.js';

const router = Router();

router.use(authProtect);

router.post('/', DepartmentController.createDepartment);
router.get('/', DepartmentController.getDepartments);
router.put('/:id', DepartmentController.updateDepartment);
router.delete('/:id', DepartmentController.deleteDepartment);

export default router;
