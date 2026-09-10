import { Request, Response } from 'express';
import { Service } from './service.model.js';
import { asyncHandler } from '../../middlewares/asyncHandler.js';
import { ApiError } from '../../middlewares/errorHandler.js';
import ApiResponse from '../../utils/apiResponse.js';
import { validateRequestFields } from '../../utils/helpers.js';

export class ServiceController {
  // Service Methods
  
  static createService = asyncHandler(async (req: Request, res: Response) => {
    validateRequestFields(["title", "titleHindi", "department", "sla"], req.body);
    
    // Explicitly parse booleans in case they are sent as strings
    const geoTagged = req.body.geoTagged === 'true' || req.body.geoTagged === true;
    const fieldVisit = req.body.fieldVisit === 'true' || req.body.fieldVisit === true;
    
    const servicePayload = {
      ...req.body,
      geoTagged,
      fieldVisit
    };

    const existingService = await Service.findOne({ title: req.body.title });
    if (existingService) {
      if (existingService.active) {
        throw new ApiError({ status: 400, message: 'Service with this title already exists' });
      } else {
        Object.assign(existingService, servicePayload, { active: true });
        await existingService.save();
        return new ApiResponse({ res, status: 201, data: existingService, message: 'Service created successfully' });
      }
    }

    const service = await Service.create(servicePayload);
    return new ApiResponse({ res, status: 201, data: service, message: 'Service created successfully' });
  });


  static getServices = asyncHandler(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const query: any = { active: true };
    const department = req.query.department as string;
    if (department) {
      query.department = department;
    }

    const services = await Service.find(query).populate('department').sort({ createdAt: -1 }).skip(skip).limit(limit);
    const total = await Service.countDocuments(query);

    return new ApiResponse({ 
      res, 
      status: 200, 
      data: { docs: services, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } }, 
      message: 'Services fetched successfully' 
    });
  });

  
  static updateService = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    
    const updatePayload = { ...req.body };
    if (req.body.geoTagged !== undefined) {
      updatePayload.geoTagged = req.body.geoTagged === 'true' || req.body.geoTagged === true;
    }
    if (req.body.fieldVisit !== undefined) {
      updatePayload.fieldVisit = req.body.fieldVisit === 'true' || req.body.fieldVisit === true;
    }

    const service = await Service.findByIdAndUpdate(id, updatePayload, { new: true });

    
    if (!service) {
      throw new ApiError({ status: 404, message: 'Service not found' });
    }
    
    return new ApiResponse({ res, status: 200, data: service, message: 'Service updated successfully' });
  });

  static deleteService = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const service = await Service.findByIdAndUpdate(id, { active: false }, { new: true });
    
    if (!service) {
      throw new ApiError({ status: 404, message: 'Service not found' });
    }

    

    return new ApiResponse({ res, status: 200, message: 'Service and its sub-services deleted successfully' });
  });

  }