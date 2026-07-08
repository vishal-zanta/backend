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
      throw new ApiError({ status: 400, message: 'Service with this title already exists' });
    }

    const service = await Service.create(req.body);
    return new ApiResponse({ res, status: 201, data: service, message: 'Service created successfully' });
  });

  static getServices = asyncHandler(async (req: Request, res: Response) => {
    const services = await Service.find({ active: true });
    return new ApiResponse({ res, status: 200, data: services, message: 'Services fetched successfully' });
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
    return new ApiResponse({ res, status: 200, message: 'Service deleted successfully' });
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
    const { serviceId } = req.query;
    const query: any = { active: true };
    if (serviceId) {
      query.service = serviceId;
    }

    const subServices = await SubService.find(query).populate('service');
    return new ApiResponse({ res, status: 200, data: subServices, message: 'Sub-Services fetched successfully' });
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
