import { Request, Response } from 'express';
import { WorkflowLevel } from './workflowLevel.model.js';
import { Role } from '../roles/role.model.js';
import { asyncHandler } from '../../middlewares/asyncHandler.js';
import { ApiError } from '../../middlewares/errorHandler.js';
import ApiResponse from '../../utils/apiResponse.js';
import { validateRequestFields } from '../../utils/helpers.js';

export class WorkflowLevelController {
  static saveWorkflow = asyncHandler(async (req: Request, res: Response) => {
    validateRequestFields(["department", "levels"], req.body);
    
    const { department, levels } = req.body;

    if (!Array.isArray(levels)) {
      throw new ApiError({ status: 400, message: 'Levels must be an array' });
    }

    // Validate roles belong to the department
    for (const level of levels) {
      if (!level.role || level.order === undefined) {
        throw new ApiError({ status: 400, message: 'Each level must have a role and an order' });
      }
      const roleExists = await Role.findOne({ _id: level.role, department });
      if (!roleExists) {
        throw new ApiError({ status: 400, message: `Role ${level.role} not found or does not belong to department` });
      }
    }

    let workflow = await WorkflowLevel.findOne({ department });
    
    if (workflow) {
      workflow.levels = levels;
      workflow.active = true;
      await workflow.save();
    } else {
      workflow = await WorkflowLevel.create({ department, levels });
    }

    return new ApiResponse({ res, status: 200, data: workflow, message: 'Workflow saved successfully' });
  });

  static getWorkflows = asyncHandler(async (req: Request, res: Response) => {
    const departmentId = req.query.department as string;

    const query: any = { active: true };
    if (departmentId) {
      query.department = departmentId;
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const workflows = await WorkflowLevel.find(query)
      .populate('department')
      .populate('levels.role')
      .skip(skip)
      .limit(limit);
      
    const total = await WorkflowLevel.countDocuments(query);

    return new ApiResponse({ 
      res, 
      status: 200, 
      data: { docs: workflows, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } }, 
      message: 'Workflows fetched successfully' 
    });
  });

  static getWorkflowById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const workflow = await WorkflowLevel.findById(id).populate('department').populate('levels.role');
    
    if (!workflow) {
      throw new ApiError({ status: 404, message: 'Workflow not found' });
    }

    return new ApiResponse({ res, status: 200, data: workflow, message: 'Workflow fetched successfully' });
  });

  static deleteWorkflow = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const workflow = await WorkflowLevel.findByIdAndUpdate(id, { active: false }, { new: true });
    
    if (!workflow) {
      throw new ApiError({ status: 404, message: 'Workflow not found' });
    }

    return new ApiResponse({ res, status: 200, message: 'Workflow deleted successfully' });
  });
}
