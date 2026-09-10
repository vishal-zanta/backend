import { Request, Response } from 'express';
import { SlaConfig } from './slaConfig.model.js';
import { Service } from '../services/service.model.js';
import { Role } from '../roles/role.model.js';
import { asyncHandler } from '../../middlewares/asyncHandler.js';
import { ApiError } from '../../middlewares/errorHandler.js';
import ApiResponse from '../../utils/apiResponse.js';
import { validateRequestFields } from '../../utils/helpers.js';

export class SlaConfigController {
  static createConfig = asyncHandler(async (req: Request, res: Response) => {
    validateRequestFields(["service", "escalations"], req.body);
    
    const { service, escalations } = req.body;

    const existingConfig = await SlaConfig.findOne({ service });
    if (existingConfig && existingConfig.active) {
      throw new ApiError({ status: 400, message: 'SLA config for this Service already exists' });
    }

    const serviceData = await Service.findById(service);
    if (!serviceData) {
      throw new ApiError({ status: 404, message: 'Service not found' });
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

    if (totalSlaHours > serviceData.sla) {
      throw new ApiError({ 
        status: 400, 
        message: `Total escalation time (${totalSlaHours}h) cannot be greater than Service SLA (${serviceData.sla}h)` 
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
    const { serviceId } = req.query;
    const department = req.query.department as string;

    const query: any = { active: true };
    
    if (serviceId) {
      query.service = serviceId;
    } else if (department) {
      const services = await Service.find({ department }).select('_id');
      const serviceIds = services.map(s => s._id);
      
      query.service = { $in: serviceIds };
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const configs = await SlaConfig.find(query)
      .populate({ path: "service", populate: { path: "department" } })
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
      const serviceData = await Service.findById(config.service);
      if (serviceData) {
        let totalSlaHours = 0;
        for (const esc of escalations) {
          totalSlaHours += esc.slaHours;
          const roleExists = await Role.findById(esc.role);
          if (!roleExists) {
            throw new ApiError({ status: 404, message: `Role not found for escalation id: ${esc.role}` });
          }
        }
        
        if (totalSlaHours > serviceData.sla) {
          throw new ApiError({ 
            status: 400, 
            message: `Total escalation time (${totalSlaHours}h) cannot be greater than Service SLA (${serviceData.sla}h)` 
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
