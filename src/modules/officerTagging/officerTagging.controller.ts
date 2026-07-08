import { Request, Response } from 'express';
import { OfficerTagging } from './officerTagging.model.js';
import { User } from '../users/user.model.js';
import { SubService } from '../services/subService.model.js';
import { asyncHandler } from '../../middlewares/asyncHandler.js';
import { ApiError } from '../../middlewares/errorHandler.js';
import ApiResponse from '../../utils/apiResponse.js';
import { validateRequestFields } from '../../utils/helpers.js';

export class OfficerTaggingController {
  static createTagging = asyncHandler(async (req: Request, res: Response) => {
    validateRequestFields(["officer", "services", "wards"], req.body);
    
    const { officer, services, wards } = req.body;

    const userExists = await User.findById(officer);
    if (!userExists) {
      throw new ApiError({ status: 404, message: 'Officer (User) not found' });
    }

    // Verify subservices
    if (services && services.length > 0) {
      const validServices = await SubService.find({ _id: { $in: services } });
      if (validServices.length !== services.length) {
        throw new ApiError({ status: 400, message: 'One or more provided Sub-Services are invalid' });
      }
    }

    const existingTagging = await OfficerTagging.findOne({ officer });
    if (existingTagging) {
      if (!existingTagging.active) {
        existingTagging.services = services;
        existingTagging.wards = wards;
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

    const query = { active: true };
    const taggings = await OfficerTagging.find(query)
      .populate({
        path: 'officer',
        select: 'name role',
        populate: {
          path: 'role',
          select: 'designationEnglish designationHindi'
        }
      })
      .populate('services', 'title titleHindi')
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
    const { services, wards } = req.body;
    
    const tagging = await OfficerTagging.findById(id);
    if (!tagging) {
      throw new ApiError({ status: 404, message: 'Officer Tagging not found' });
    }

    if (services) {
      const validServices = await SubService.find({ _id: { $in: services } });
      if (validServices.length !== services.length) {
        throw new ApiError({ status: 400, message: 'One or more provided Sub-Services are invalid' });
      }
      tagging.services = services;
    }

    if (wards) {
      tagging.wards = wards;
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
