import { Request, Response } from 'express';
import { SlaConfig } from './slaConfig.model.js';
import { SubService } from '../services/subService.model.js';
import { Service } from '../services/service.model.js';
import { Role } from '../roles/role.model.js';
import { asyncHandler } from '../../middlewares/asyncHandler.js';
import { ApiError } from '../../middlewares/errorHandler.js';
import ApiResponse from '../../utils/apiResponse.js';
import { validateRequestFields } from '../../utils/helpers.js';

export class SlaConfigController {
  static createConfig = asyncHandler(async (req: Request, res: Response) => {
    validateRequestFields(["subService", "escalations"], req.body);
    
    const { subService, escalations } = req.body;

    const existingConfig = await SlaConfig.findOne({ subService });
    if (existingConfig && existingConfig.active) {
      throw new ApiError({ status: 400, message: 'SLA config for this Sub-Service already exists' });
    }

    const subServiceData = await SubService.findById(subService);
    if (!subServiceData) {
      throw new ApiError({ status: 404, message: 'Sub-Service not found' });
    }

    // Validate escalations
    let totalSlaHours = 0;
    for (const esc of escalations) {
      totalSlaHours += esc.slaHours;
      const roleExists = await Role.findById(esc.role);
      if (!roleExists) {
        throw new ApiError({ status: 404, message: `Role not found for escalation id: ${esc.role}` });
      }
    }

    if (totalSlaHours > subServiceData.sla) {
      throw new ApiError({ 
        status: 400, 
        message: `Total escalation time (${totalSlaHours}h) cannot be greater than Sub-Service SLA (${subServiceData.sla}h)` 
      });
    }

    if (existingConfig && !existingConfig.active) {
      existingConfig.escalations = escalations;
      existingConfig.active = true;
      if (req.body.officer !== undefined) existingConfig.officer = req.body.officer;
      await existingConfig.save();
      return new ApiResponse({ res, status: 201, data: existingConfig, message: 'SLA Config created successfully' });
    }

    const slaConfig = await SlaConfig.create(req.body);
    return new ApiResponse({ res, status: 201, data: slaConfig, message: 'SLA Config created successfully' });
  });

  static getConfigs = asyncHandler(async (req: Request, res: Response) => {
    const { subServiceId } = req.query;
    const department = req.query.department as string;

    const query: any = { active: true };
    
    if (subServiceId) {
      query.subService = subServiceId;
    } else if (department) {
      const services = await Service.find({ department }).select('_id');
      const serviceIds = services.map(s => s._id);
      
      const subServices = await SubService.find({ service: { $in: serviceIds } }).select('_id');
      const subServiceIds = subServices.map(s => s._id);
      
      query.subService = { $in: subServiceIds };
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const configs = await SlaConfig.find(query)
      .populate('subService')
      .populate('escalations.role')
      .skip(skip)
      .limit(limit);
      
    const total = await SlaConfig.countDocuments(query);

    return new ApiResponse({ 
      res, 
      status: 200, 
      data: { docs: configs, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } }, 
      message: 'SLA Configs fetched successfully' 
    });
  });

  static updateConfig = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { escalations, active, officer } = req.body;
    
    const config = await SlaConfig.findById(id);
    if (!config) {
      throw new ApiError({ status: 404, message: 'SLA Config not found' });
    }

    if (escalations) {
      const subServiceData = await SubService.findById(config.subService);
      if (subServiceData) {
        let totalSlaHours = 0;
        for (const esc of escalations) {
          totalSlaHours += esc.slaHours;
          const roleExists = await Role.findById(esc.role);
          if (!roleExists) {
            throw new ApiError({ status: 404, message: `Role not found for escalation id: ${esc.role}` });
          }
        }
        
        if (totalSlaHours > subServiceData.sla) {
          throw new ApiError({ 
            status: 400, 
            message: `Total escalation time (${totalSlaHours}h) cannot be greater than Sub-Service SLA (${subServiceData.sla}h)` 
          });
        }
      }
      config.escalations = escalations;
    }

    if (active !== undefined) {
      config.active = active;
    }

    if (officer !== undefined) {
      config.officer = officer;
    }

    await config.save();
    
    return new ApiResponse({ res, status: 200, data: config, message: 'SLA Config updated successfully' });
  });

  static deleteConfig = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const config = await SlaConfig.findByIdAndUpdate(id, { active: false }, { new: true });
    
    if (!config) {
      throw new ApiError({ status: 404, message: 'SLA Config not found' });
    }
    return new ApiResponse({ res, status: 200, message: 'SLA Config deleted successfully' });
  });
}
