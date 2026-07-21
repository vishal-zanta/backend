import { Router } from 'express';
import { DepartmentController } from './department.controller.js';
import { authProtect } from '../../middlewares/authMiddleware.js';
import { checkPermission } from '../../middlewares/permissionMiddleware.js';

const router = Router();

router.use(authProtect);

router.post('/',checkPermission("DEPARTMENT_MANAGEMENT"), DepartmentController.createDepartment);
router.get('/', DepartmentController.getDepartments);
router.put('/:id',checkPermission("DEPARTMENT_MANAGEMENT"), DepartmentController.updateDepartment);
router.delete('/:id',checkPermission("DEPARTMENT_MANAGEMENT"), DepartmentController.deleteDepartment);

export default router;
