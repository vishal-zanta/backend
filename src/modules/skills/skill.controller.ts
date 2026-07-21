import { Request, Response } from 'express';
import { Skill } from './skill.model.js';
import { asyncHandler } from '../../middlewares/asyncHandler.js';
import { ApiError } from '../../middlewares/errorHandler.js';
import ApiResponse from '../../utils/apiResponse.js';
import { validateRequestFields } from '../../utils/helpers.js';

export class SkillController {
  
  static createSkill = asyncHandler(async (req: Request, res: Response) => {
    validateRequestFields(["name"], req.body);
    
    const { name } = req.body;
    
    const existingSkill = await Skill.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
    if (existingSkill) {
      throw new ApiError({ status: 400, message: 'Skill already exists' });
    }

    const skill = await Skill.create({ name });

    return new ApiResponse({ res, status: 201, data: skill, message: 'Skill created successfully' });
  });

  static getSkills = asyncHandler(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const query = { active: true };
    const skills = await Skill.find(query).sort({ name: 1 }).skip(skip).limit(limit);
    const total = await Skill.countDocuments(query);

    return new ApiResponse({ 
      res, 
      status: 200, 
      data: { docs: skills, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } }, 
      message: 'Skills fetched successfully' 
    });
  });

  static updateSkill = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name, active } = req.body;

    const skill = await Skill.findById(id);
    if (!skill) {
      throw new ApiError({ status: 404, message: 'Skill not found' });
    }

    if (name) {
      const existingSkill = await Skill.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') }, _id: { $ne: id } });
      if (existingSkill) {
        throw new ApiError({ status: 400, message: 'Skill already exists' });
      }
      skill.name = name;
    }
    
    if (active !== undefined) {
      skill.active = active;
    }

    await skill.save();
    
    return new ApiResponse({ res, status: 200, data: skill, message: 'Skill updated successfully' });
  });

  static deleteSkill = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const skill = await Skill.findByIdAndUpdate(id, { active: false }, { new: true });
    
    if (!skill) {
      throw new ApiError({ status: 404, message: 'Skill not found' });
    }

    return new ApiResponse({ res, status: 200, message: 'Skill deleted successfully' });
  });
}
