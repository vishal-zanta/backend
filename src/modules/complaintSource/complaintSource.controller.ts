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
      if (existingSource.active) {
        throw new ApiError({ status: 400, message: 'Complaint source with this title already exists' });
      } else {
        existingSource.title = req.body.title;
        existingSource.active = true;
        await existingSource.save();
        return new ApiResponse({ res, status: 201, data: existingSource, message: 'Complaint source created successfully' });
      }
    }

    const source = await ComplaintSource.create(req.body);
    return new ApiResponse({ res, status: 201, data: source, message: 'Complaint source created successfully' });
  });

  static getSources = asyncHandler(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const query = { active: true };
    const sources = await ComplaintSource.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit);
    const total = await ComplaintSource.countDocuments(query);

    return new ApiResponse({ 
      res, 
      status: 200, 
      data: { docs: sources, pagination: { total, page, limit, totalPages: Math.ceil(total / limit) } }, 
      message: 'Complaint sources fetched successfully' 
    });
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
