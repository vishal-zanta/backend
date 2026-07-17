import { Request, Response } from 'express';
import { WorkflowLevel } from './workflowLevel.model.js';
import { Role } from '../roles/role.model.js';
import { asyncHandler } from '../../middlewares/asyncHandler.js';
import { ApiError } from '../../middlewares/errorHandler.js';
import ApiResponse from '../../utils/apiResponse.js';
import { validateRequestFields } from '../../utils/helpers.js';

export class WorkflowLevelController {
  static createLevel = asyncHandler(async (req: Request, res: Response) => {
    validateRequestFields(["role"], req.body);
    
    const { role, description } = req.body;

    const existingRole = await Role.findById(role);
    if (!existingRole) {
      throw new ApiError({ status: 404, message: 'Role not found' });
    }

    const lastLevel = await WorkflowLevel.findOne().sort({ order: -1 });
    const finalOrder = lastLevel ? lastLevel.order + 1 : 1;

    const existingLevelForRole = await WorkflowLevel.findOne({ role });
    if (existingLevelForRole) {
      if (existingLevelForRole.active) {
         throw new ApiError({ status: 400, message: 'Workflow level for this role already exists' });
      } else {
         existingLevelForRole.description = description;
         existingLevelForRole.active = true;
         existingLevelForRole.order = finalOrder;
         await existingLevelForRole.save();
         return new ApiResponse({ res, status: 201, data: existingLevelForRole, message: 'Workflow level created successfully' });
      }
    }

    const level = await WorkflowLevel.create({
      role,
      description,
      order: finalOrder
    });
    
    return new ApiResponse({ res, status: 201, data: level, message: 'Workflow level created successfully' });
  });

  static getLevels = asyncHandler(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const query = { active: true };
    const levels = await WorkflowLevel.find(query)
      .sort({ order: 1 })
      .populate('role')
      .skip(skip)
      .limit(limit);
      
    const total = await WorkflowLevel.countDocuments(query);

    return new ApiResponse({ 
      res, 
      status: 200, 
      data: { docs: levels, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } }, 
      message: 'Workflow levels fetched successfully' 
    });
  });

  static updateLevel = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { role, description } = req.body;
    
    const level = await WorkflowLevel.findById(id);
    if (!level) {
      throw new ApiError({ status: 404, message: 'Workflow level not found' });
    }

    if (role) {
      const roleExists = await Role.findById(role);
      if (!roleExists) {
        throw new ApiError({ status: 404, message: 'Role not found' });
      }
      level.role = role;
    }

    if (description) level.description = description;

    await level.save();
    
    return new ApiResponse({ res, status: 200, data: level, message: 'Workflow level updated successfully' });
  });

  static deleteLevel = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const level = await WorkflowLevel.findByIdAndUpdate(id, { active: false }, { new: true });
    
    if (!level) {
      throw new ApiError({ status: 404, message: 'Workflow level not found' });
    }

    return new ApiResponse({ res, status: 200, message: 'Workflow level deleted successfully' });
  });

  static bulkUpdateOrder = asyncHandler(async (req: Request, res: Response) => {
    const { updates } = req.body; // Expects [{ id: '...', order: 1 }, { id: '...', order: 2 }]
    
    if (!Array.isArray(updates)) {
      throw new ApiError({ status: 400, message: 'Updates must be an array of objects with id and order' });
    }

    const bulkOps = updates.map(update => ({
      updateOne: {
        filter: { _id: update.id },
        update: { $set: { order: update.order } }
      }
    }));

    if (bulkOps.length > 0) {
      await WorkflowLevel.bulkWrite(bulkOps);
    }
    
    return new ApiResponse({ res, status: 200, message: 'Workflow level orders updated successfully' });
  });
}
