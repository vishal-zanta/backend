import { Request, Response } from 'express';
import { Demography } from './demography.model.js';
import { Ulb } from './ulb.model.js';
import { asyncHandler } from '../../middlewares/asyncHandler.js';
import { ApiError } from '../../middlewares/errorHandler.js';
import ApiResponse from '../../utils/apiResponse.js';
import { validateRequestFields } from '../../utils/helpers.js';

export class DemographyController {
  // Demography (District) Methods
  static createDemography = asyncHandler(async (req: Request, res: Response) => {
    validateRequestFields(["name", "nameHindi", "division", "zone", "population", "urban"], req.body);
    
    const existing = await Demography.findOne({ name: req.body.name });
    if (existing) {
      if (existing.active) {
        throw new ApiError({ status: 400, message: 'District with this name already exists' });
      } else {
        Object.assign(existing, req.body, { active: true });
        await existing.save();
        return new ApiResponse({ res, status: 201, data: existing, message: 'Demography created successfully' });
      }
    }

    const demography = await Demography.create(req.body);
    return new ApiResponse({ res, status: 201, data: demography, message: 'Demography created successfully' });
  });

  static getDemographies = asyncHandler(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const query = { active: true };
    const demographies = await Demography.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit);
    const total = await Demography.countDocuments(query);

    return new ApiResponse({ 
      res, 
      status: 200, 
      data: { docs: demographies, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } }, 
      message: 'Demographies fetched successfully' 
    });
  });

  static updateDemography = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const demography = await Demography.findByIdAndUpdate(id, req.body, { new: true });
    
    if (!demography) {
      throw new ApiError({ status: 404, message: 'Demography not found' });
    }
    
    return new ApiResponse({ res, status: 200, data: demography, message: 'Demography updated successfully' });
  });

  static deleteDemography = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const demography = await Demography.findByIdAndUpdate(id, { active: false }, { new: true });
    
    if (!demography) {
      throw new ApiError({ status: 404, message: 'Demography not found' });
    }
    return new ApiResponse({ res, status: 200, message: 'Demography deleted successfully' });
  });

  // ULB Methods
  static createUlb = asyncHandler(async (req: Request, res: Response) => {
    validateRequestFields(["name", "nameHindi", "wards", "district"], req.body);
    
    const existingDistrict = await Demography.findById(req.body.district);
    if (!existingDistrict) {
      throw new ApiError({ status: 404, message: 'District not found' });
    }

    const ulb = await Ulb.create(req.body);
    return new ApiResponse({ res, status: 201, data: ulb, message: 'ULB created successfully' });
  });

  static getUlbs = asyncHandler(async (req: Request, res: Response) => {
    const { districtId } = req.query;
    const query: any = { active: true };
    if (districtId) {
      query.district = districtId;
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const ulbs = await Ulb.find(query).populate('district').sort({ createdAt: -1 }).skip(skip).limit(limit);
    const total = await Ulb.countDocuments(query);

    return new ApiResponse({ 
      res, 
      status: 200, 
      data: { docs: ulbs, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } }, 
      message: 'ULBs fetched successfully' 
    });
  });

  static updateUlb = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const ulb = await Ulb.findByIdAndUpdate(id, req.body, { new: true });
    
    if (!ulb) {
      throw new ApiError({ status: 404, message: 'ULB not found' });
    }
    
    return new ApiResponse({ res, status: 200, data: ulb, message: 'ULB updated successfully' });
  });

  static deleteUlb = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const ulb = await Ulb.findByIdAndUpdate(id, { active: false }, { new: true });
    
    if (!ulb) {
      throw new ApiError({ status: 404, message: 'ULB not found' });
    }
    return new ApiResponse({ res, status: 200, message: 'ULB deleted successfully' });
  });
}
