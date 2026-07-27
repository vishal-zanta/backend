import { Request, Response } from 'express';
import { Role } from './role.model.js';
import { asyncHandler } from '../../middlewares/asyncHandler.js';
import { ApiError } from '../../middlewares/errorHandler.js';
import ApiResponse from '../../utils/apiResponse.js';
import { validateRequestFields } from '../../utils/helpers.js';
import { SYSTEM_ROLE_LEVELS } from '../../config/roles.config.js';
import { WorkflowLevel } from '../workflowLevel/workflowLevel.model.js';
import { SlaConfig } from '../slaConfig/slaConfig.model.js';

export class RoleController {
  static createRole = asyncHandler(async (req: Request, res: Response) => {
    validateRequestFields(["designationEnglish", "designationHindi", "level", "department"], req.body);
    
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

    const departmentId = req.query.department as string;

    const query: any = { active: true };
    if (departmentId) {
      query.department = departmentId;
    }
    const roles = await Role.find(query).populate('department').sort({ createdAt: -1 }).skip(skip).limit(limit);
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

    const existingRole = await Role.findById(id);
    if (!existingRole) {
      throw new ApiError({ status: 404, message: 'Role not found' });
    }

    // System roles — only permissions and designations (English/Hindi) can be edited
    if (SYSTEM_ROLE_LEVELS.includes(existingRole.level)) {
      const allowedFields = ['permissions', 'designationEnglish', 'designationHindi'];
      const disallowedFields = Object.keys(req.body).filter(f => !allowedFields.includes(f));
      if (disallowedFields.length > 0) {
        throw new ApiError({
          status: 403,
          message: `System role cannot be fully edited. Only permissions and designations can be updated.`
        });
      }

      Object.assign(existingRole, req.body);
      await existingRole.save();
      return new ApiResponse({ res, status: 200, data: existingRole, message: 'Role updated successfully' });
    }

    const newDepartment = req.body.department;
    
    if (newDepartment && newDepartment.toString() !== existingRole.department.toString()) {
      // Role department has changed, remove from workflow and SLA configs
     
      await WorkflowLevel.updateMany(
        { "levels.role": existingRole._id },
        { $pull: { levels: { role: existingRole._id } } }
      );
      
      await SlaConfig.updateMany(
        { "escalations.role": existingRole._id },
        { $pull: { escalations: { role: existingRole._id } } }
      );
    }

    const role = await Role.findByIdAndUpdate(id, req.body, { new: true });
    
    return new ApiResponse({ res, status: 200, data: role, message: 'Role updated successfully' });
  });

  static deleteRole = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const existingRole = await Role.findById(id);
    if (!existingRole) {
      throw new ApiError({ status: 404, message: 'Role not found' });
    }

    // System roles cannot be deleted
    if (SYSTEM_ROLE_LEVELS.includes(existingRole.level)) {
      throw new ApiError({
        status: 403,
        message: `System role "${existingRole.designationEnglish}" cannot be deleted`
      });
    }

    existingRole.active = false;
    await existingRole.save();

    // Remove from workflow and SLA configs since it's deleted
    await WorkflowLevel.updateMany(
      { "levels.role": existingRole._id },
      { $pull: { levels: { role: existingRole._id } } }
    );

    await SlaConfig.updateMany(
      { "escalations.role": existingRole._id },
      { $pull: { escalations: { role: existingRole._id } } }
    );

    return new ApiResponse({ res, status: 200, message: 'Role deleted successfully' });
  });
}
