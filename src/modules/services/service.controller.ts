import { Request, Response } from 'express';
import { Service } from './service.model.js';
import { SubService } from './subService.model.js';
import { asyncHandler } from '../../middlewares/asyncHandler.js';
import { ApiError } from '../../middlewares/errorHandler.js';
import ApiResponse from '../../utils/apiResponse.js';
import { validateRequestFields } from '../../utils/helpers.js';

export class ServiceController {
  // Service Methods
  static createService = asyncHandler(async (req: Request, res: Response) => {
    validateRequestFields(["title", "titleHindi", "department"], req.body);
    
    const existingService = await Service.findOne({ title: req.body.title });
    if (existingService) {
      if (existingService.active) {
        throw new ApiError({ status: 400, message: 'Service with this title already exists' });
      } else {
        Object.assign(existingService, req.body, { active: true });
        await existingService.save();
        return new ApiResponse({ res, status: 201, data: existingService, message: 'Service created successfully' });
      }
    }

    const service = await Service.create(req.body);
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

    const services = await Service.find(query).populate('department').populate('subservices').sort({ createdAt: -1 }).skip(skip).limit(limit);
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
    const service = await Service.findByIdAndUpdate(id, req.body, { new: true });
    
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

    // Cascade deactivate all sub-services related to this service
    await SubService.updateMany({ service: id }, { active: false });

    return new ApiResponse({ res, status: 200, message: 'Service and its sub-services deleted successfully' });
  });

  // SubService Methods
  static createSubService = asyncHandler(async (req: Request, res: Response) => {
    validateRequestFields(["title", "titleHindi", "sla", "service"], req.body);
    
    // Optional check: Ensure the service exists
    const existingService = await Service.findById(req.body.service);
    if (!existingService) {
      throw new ApiError({ status: 404, message: 'Main service not found' });
    }

    const subService = await SubService.create(req.body);
    return new ApiResponse({ res, status: 201, data: subService, message: 'Sub-Service created successfully' });
  });

  static getSubServices = asyncHandler(async (req: Request, res: Response) => {
    // Optionally filter by service if provided in query params
    const serviceId = req.query.serviceId as string;
    const department = req.query.department as string;
    const query: any = { active: true };
    
    if (serviceId) {
      query.service = { $in: serviceId.split(',') };
    } else if (department) {
      const services = await Service.find({ department }).select('_id');
      const serviceIds = services.map(s => s._id);
      query.service = { $in: serviceIds };
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const subServices = await SubService.find(query).populate('service').skip(skip).limit(limit);
    const total = await SubService.countDocuments(query);

    return new ApiResponse({ 
      res, 
      status: 200, 
      data: { docs: subServices, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } }, 
      message: 'Sub-Services fetched successfully' 
    });
  });

  static updateSubService = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const subService = await SubService.findByIdAndUpdate(id, req.body, { new: true });
    
    if (!subService) {
      throw new ApiError({ status: 404, message: 'Sub-Service not found' });
    }
    
    return new ApiResponse({ res, status: 200, data: subService, message: 'Sub-Service updated successfully' });
  });

  static deleteSubService = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const subService = await SubService.findByIdAndUpdate(id, { active: false }, { new: true });
    
    if (!subService) {
      throw new ApiError({ status: 404, message: 'Sub-Service not found' });
    }
    return new ApiResponse({ res, status: 200, message: 'Sub-Service deleted successfully' });
  });
}
