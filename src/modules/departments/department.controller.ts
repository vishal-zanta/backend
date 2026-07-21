import { Request, Response } from 'express';
import { Department } from './department.model.js';
import { asyncHandler } from '../../middlewares/asyncHandler.js';
import { ApiError } from '../../middlewares/errorHandler.js';
import ApiResponse from '../../utils/apiResponse.js';
import { validateRequestFields } from '../../utils/helpers.js';

export class DepartmentController {
  static createDepartment = asyncHandler(async (req: Request, res: Response) => {
    validateRequestFields(["title"], req.body);
    
    const existingDept = await Department.findOne({ title: req.body.title });
    if (existingDept) {
      if (existingDept.active) {
        throw new ApiError({ status: 400, message: 'Department with this title already exists' });
      } else {
        Object.assign(existingDept, req.body, { active: true });
        await existingDept.save();
        return new ApiResponse({ res, status: 201, data: existingDept, message: 'Department created successfully' });
      }
    }

    const department = await Department.create(req.body);
    return new ApiResponse({ res, status: 201, data: department, message: 'Department created successfully' });
  });

  static getDepartments = asyncHandler(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const query = { active: true };
    const departments = await Department.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit);
    const total = await Department.countDocuments(query);

    return new ApiResponse({ 
      res, 
      status: 200, 
      data: { docs: departments, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } }, 
      message: 'Departments fetched successfully' 
    });
  });

  static updateDepartment = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const department = await Department.findByIdAndUpdate(id, req.body, { new: true });
    
    if (!department) {
      throw new ApiError({ status: 404, message: 'Department not found' });
    }
    
    return new ApiResponse({ res, status: 200, data: department, message: 'Department updated successfully' });
  });

  static deleteDepartment = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const department = await Department.findByIdAndUpdate(id, { active: false }, { new: true });
    
    if (!department) {
      throw new ApiError({ status: 404, message: 'Department not found' });
    }

    return new ApiResponse({ res, status: 200, message: 'Department deleted successfully' });
  });
}
