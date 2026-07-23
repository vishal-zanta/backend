import { Request, Response } from 'express';
import { ApiKey } from './apiKey.model.js';
import { asyncHandler } from '../../middlewares/asyncHandler.js';
import ApiResponse from '../../utils/apiResponse.js';
import { ApiError } from '../../middlewares/errorHandler.js';

export class ApiKeyController {
  
  static createApiKey = asyncHandler(async (req: Request, res: Response) => {
    const { name } = req.body;
    if (!name) {
      throw new ApiError({ status: 400, message: "Name is required for API Key" });
    }

    const createdBy = (req as any).user.id || (req as any).user._id;

    const existing = await ApiKey.findOne({ name });
    if (existing) {
      throw new ApiError({ status: 400, message: "API Key with this name already exists" });
    }

    const apiKey = await ApiKey.create({ name, createdBy });

    return new ApiResponse({
      res,
      status: 201,
      data: apiKey,
      message: "API Key generated successfully"
    });
  });

  static getApiKeys = asyncHandler(async (req: Request, res: Response) => {
    const keys = await ApiKey.find().sort({ createdAt: -1 }).populate('createdBy', 'name email userCode');

    return new ApiResponse({
      res,
      status: 200,
      data: keys,
      message: "API Keys fetched successfully"
    });
  });

  static toggleApiKeyStatus = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const apiKey = await ApiKey.findById(id);

    if (!apiKey) {
      throw new ApiError({ status: 404, message: "API Key not found" });
    }

    apiKey.active = !apiKey.active;
    await apiKey.save();

    return new ApiResponse({
      res,
      status: 200,
      data: apiKey,
      message: `API Key ${apiKey.active ? 'enabled' : 'disabled'} successfully`
    });
  });

  static deleteApiKey = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const apiKey = await ApiKey.findByIdAndDelete(id);

    if (!apiKey) {
      throw new ApiError({ status: 404, message: "API Key not found" });
    }

    return new ApiResponse({
      res,
      status: 200,
      data: {},
      message: "API Key deleted successfully"
    });
  });
}
