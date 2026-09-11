import { Request, Response } from 'express';
import { OfficerTagging } from './officerTagging.model.js';
import { User } from '../users/user.model.js';
import { Service } from '../services/service.model.js';
import { asyncHandler } from '../../middlewares/asyncHandler.js';
import { ApiError } from '../../middlewares/errorHandler.js';
import ApiResponse from '../../utils/apiResponse.js';
import { validateRequestFields } from '../../utils/helpers.js';
import { Role } from '../roles/role.model.js';

export class OfficerTaggingController {
  static createTagging = asyncHandler(async (req: Request, res: Response) => {
    validateRequestFields(["officer", "services", "subdivisions", "divisions"], req.body);
    
    const { officer, services, subdivisions, divisions } = req.body;

    const userExists = await User.findById(officer);
    if (!userExists) {
      throw new ApiError({ status: 404, message: 'Officer (User) not found' });
    }

    // Verify subservices
    if (services && services.length > 0) {
      const validServices = await Service.find({ _id: { $in: services } });
      if (validServices.length !== services.length) {
        throw new ApiError({ status: 400, message: 'One or more provided Sub-Services are invalid' });
      }
    }

    const existingTagging = await OfficerTagging.findOne({ officer });
    if (existingTagging) {
      if (!existingTagging.active) {
        existingTagging.services = services;
        existingTagging.subdivisions = subdivisions;
        existingTagging.divisions = divisions;
        existingTagging.active = true;
        await existingTagging.save();
        return new ApiResponse({ res, status: 201, data: existingTagging, message: 'Officer Tagging created successfully' });
      }
      throw new ApiError({ status: 400, message: 'Tagging for this officer already exists' });
    }

    const tagging = await OfficerTagging.create(req.body);
    return new ApiResponse({ res, status: 201, data: tagging, message: 'Officer Tagging created successfully' });
  });

  static getTaggings = asyncHandler(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const department = req.query.department as string;

    const query: any = { active: true };

    if (department) {
      const roles = await Role.find({ department });
      const roleIds = roles.map(r => r._id);

      const users = await User.find({ roles: { $in: roleIds } });
      const userIds = users.map(u => u._id);

      query.officer = { $in: userIds };
    }

    const taggings = await OfficerTagging.find(query)
      .populate({
        path: 'officer',
        select: 'name roles',
        populate: {
          path: 'roles',
          select: 'designationEnglish designationHindi'
        }
      })
      .populate('services', 'title titleHindi')
      
      .populate('divisions', 'name_en name_local')
      .populate('subdivisions', 'name_en name_local')
      .skip(skip)
      .limit(limit);
      
    const total = await OfficerTagging.countDocuments(query);

    return new ApiResponse({ 
      res, 
      status: 200, 
      data: { docs: taggings, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } }, 
      message: 'Officer Taggings fetched successfully' 
    });
  });

  static updateTagging = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { services, subdivisions, divisions } = req.body;
    
    const tagging = await OfficerTagging.findById(id);
    if (!tagging) {
      throw new ApiError({ status: 404, message: 'Officer Tagging not found' });
    }

    if (services) {
      const validServices = await Service.find({ _id: { $in: services } });
      if (validServices.length !== services.length) {
        throw new ApiError({ status: 400, message: 'One or more provided Sub-Services are invalid' });
      }
      tagging.services = services;
    }

    if (subdivisions) {
      tagging.subdivisions = subdivisions;
    }

    if (divisions) {
      tagging.divisions = divisions;
    }

    await tagging.save();
    
    return new ApiResponse({ res, status: 200, data: tagging, message: 'Officer Tagging updated successfully' });
  });

  static deleteTagging = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const tagging = await OfficerTagging.findByIdAndUpdate(id, { active: false }, { new: true });
    
    if (!tagging) {
      throw new ApiError({ status: 404, message: 'Officer Tagging not found' });
    }
    return new ApiResponse({ res, status: 200, message: 'Officer Tagging deleted successfully' });
  });
}
