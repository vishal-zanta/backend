import { Request, Response } from 'express';
import { ComplaintSource } from './complaintSource.model.js';
import { asyncHandler } from '../../middlewares/asyncHandler.js';
import { ApiError } from '../../middlewares/errorHandler.js';
import ApiResponse from '../../utils/apiResponse.js';
import { validateRequestFields } from '../../utils/helpers.js';

export class ComplaintSourceController {
  static createSource = asyncHandler(async (req: Request, res: Response) => {
    validateRequestFields(["title"], req.body);
    
    const existingSource = await ComplaintSource.findOne({ title: req.body.title });
    if (existingSource) {
      throw new ApiError({ status: 400, message: 'Complaint source with this title already exists' });
    }

    const source = await ComplaintSource.create(req.body);
    return new ApiResponse({ res, status: 201, data: source, message: 'Complaint source created successfully' });
  });

  static getSources = asyncHandler(async (req: Request, res: Response) => {
    const sources = await ComplaintSource.find({ active: true });
    return new ApiResponse({ res, status: 200, data: sources, message: 'Complaint sources fetched successfully' });
  });

  static updateSource = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const source = await ComplaintSource.findByIdAndUpdate(id, req.body, { new: true });
    
    if (!source) {
      throw new ApiError({ status: 404, message: 'Complaint source not found' });
    }
    
    return new ApiResponse({ res, status: 200, data: source, message: 'Complaint source updated successfully' });
  });

  static deleteSource = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const source = await ComplaintSource.findByIdAndUpdate(id, { active: false }, { new: true });
    
    if (!source) {
      throw new ApiError({ status: 404, message: 'Complaint source not found' });
    }

    return new ApiResponse({ res, status: 200, message: 'Complaint source deleted successfully' });
  });
}
