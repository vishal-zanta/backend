import { Request, Response } from 'express';
import { Role } from './role.model.js';
import { asyncHandler } from '../../middlewares/asyncHandler.js';
import { ApiError } from '../../middlewares/errorHandler.js';
import ApiResponse from '../../utils/apiResponse.js';
import { validateRequestFields } from '../../utils/helpers.js';

export class RoleController {
  static createRole = asyncHandler(async (req: Request, res: Response) => {
    validateRequestFields(["designationEnglish", "designationHindi", "level"], req.body);
    
    const existingRole = await Role.findOne({ designationEnglish: req.body.designationEnglish });
    if (existingRole) {
      if (existingRole.active) {
        throw new ApiError({ status: 400, message: 'Role with this designation already exists' });
      } else {
        Object.assign(existingRole, req.body, { active: true });
        await existingRole.save();
        return new ApiResponse({ res, status: 201, data: existingRole, message: 'Role created successfully' });
      }
    }

    const role = await Role.create(req.body);
    return new ApiResponse({ res, status: 201, data: role, message: 'Role created successfully' });
  });

  static getRoles = asyncHandler(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const query = { active: true };
    const roles = await Role.find(query).skip(skip).limit(limit);
    const total = await Role.countDocuments(query);

    return new ApiResponse({ 
      res, 
      status: 200, 
      data: { docs: roles, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } }, 
      message: 'Roles fetched successfully' 
    });
  });

  static updateRole = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const role = await Role.findByIdAndUpdate(id, req.body, { new: true });
    
    if (!role) {
      throw new ApiError({ status: 404, message: 'Role not found' });
    }
    
    return new ApiResponse({ res, status: 200, data: role, message: 'Role updated successfully' });
  });

  static deleteRole = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const role = await Role.findByIdAndUpdate(id, { active: false }, { new: true });
    
    if (!role) {
      throw new ApiError({ status: 404, message: 'Role not found' });
    }

    return new ApiResponse({ res, status: 200, message: 'Role deleted successfully' });
  });
}
