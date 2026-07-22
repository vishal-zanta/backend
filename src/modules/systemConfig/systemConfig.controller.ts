import { Request, Response } from 'express';
import { SystemConfig } from './systemConfig.model.js';
import { asyncHandler } from '../../middlewares/asyncHandler.js';
import ApiResponse from '../../utils/apiResponse.js';

export class SystemConfigController {
  
  static getConfig = asyncHandler(async (req: Request, res: Response) => {
    let config = await SystemConfig.findOne();
    if (!config) {
      config = await SystemConfig.create({});
    }
    
    return new ApiResponse({ res, status: 200, data: config, message: 'Config fetched successfully' });
  });

  static updateConfig = asyncHandler(async (req: Request, res: Response) => {
    const { defaultMaxUploadSizeMB, grievanceMaxUploadSizeMB, fieldVisitMaxUploadSizeMB, chatMaxUploadSizeMB } = req.body;
    
    let config = await SystemConfig.findOne();
    if (!config) {
      config = new SystemConfig();
    }
    
    if (defaultMaxUploadSizeMB !== undefined) config.defaultMaxUploadSizeMB = defaultMaxUploadSizeMB;
    if (grievanceMaxUploadSizeMB !== undefined) config.grievanceMaxUploadSizeMB = grievanceMaxUploadSizeMB;
    if (fieldVisitMaxUploadSizeMB !== undefined) config.fieldVisitMaxUploadSizeMB = fieldVisitMaxUploadSizeMB;
    if (chatMaxUploadSizeMB !== undefined) config.chatMaxUploadSizeMB = chatMaxUploadSizeMB;
    
    await config.save();
    
    return new ApiResponse({ res, status: 200, data: config, message: 'Config updated successfully' });
  });
}
