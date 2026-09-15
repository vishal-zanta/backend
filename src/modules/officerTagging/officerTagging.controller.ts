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
    // Note: We don't strictly require all these new fields, just allow them
    validateRequestFields(["officer", "services"], req.body);
    
    const { officer, services, blocks, panchayats, urbanPanchayats, wards, areaType, districts } = req.body;

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
        if (blocks) existingTagging.blocks = blocks;
        if (panchayats) existingTagging.panchayats = panchayats;
        if (urbanPanchayats) existingTagging.urbanPanchayats = urbanPanchayats;
        if (wards) existingTagging.wards = wards;
        if (areaType) existingTagging.areaType = areaType;
        if (districts) existingTagging.districts = districts;
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
    const district = req.query.district as string;
    const block = req.query.block as string;
    const panchayat = req.query.panchayat as string;
    const urbanPanchayat = req.query.urbanPanchayat as string;
    const ward = req.query.ward as string;
    const areaType = req.query.areaType as string;

    const query: any = { active: true };

    if (department) {
      const roles = await Role.find({ department });
      const roleIds = roles.map(r => r._id);

      const users = await User.find({ roles: { $in: roleIds } });
      const userIds = users.map(u => u._id);

      query.officer = { $in: userIds };
    }

    if (district) query.districts = district;
    if (block) query.blocks = block;
    if (panchayat) query.panchayats = panchayat;
    if (urbanPanchayat) query.urbanPanchayats = urbanPanchayat;
    if (ward) query.wards = ward;
    if (areaType) query.areaType = areaType;

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
      .populate('districts', 'name_en name_local')
      .populate('blocks', 'name_en name_local')
      .populate('panchayats', 'name_en name_local')
      .populate('urbanPanchayats', 'name_en name_local')
      .populate('wards', 'name_en name_local ward_number')
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
    const { services, blocks, panchayats, urbanPanchayats, wards, areaType, districts } = req.body;
    
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

    if (blocks !== undefined) tagging.blocks = blocks;
    if (panchayats !== undefined) tagging.panchayats = panchayats;
    if (urbanPanchayats !== undefined) tagging.urbanPanchayats = urbanPanchayats;
    if (wards !== undefined) tagging.wards = wards;
    if (areaType !== undefined) tagging.areaType = areaType;
    if (districts !== undefined) tagging.districts = districts;

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
