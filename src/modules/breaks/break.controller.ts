import { Request, Response } from 'express';
import { User } from '../users/user.model.js';
import { Break } from './break.model.js';
import { asyncHandler } from '../../middlewares/asyncHandler.js';
import { ApiError } from '../../middlewares/errorHandler.js';
import ApiResponse from '../../utils/apiResponse.js';

export class BreakController {
  
  static toggleBreak = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.user as any;
    const user = await User.findById(id);

    if (!user) {
      throw new ApiError({ status: 404, message: 'User not found' });
    }

    if (user.isBreak) {
      // User is currently on break, stop the break
      const activeBreak = await Break.findOne({ user: id, endTime: { $exists: false } }).sort({ startTime: -1 });
      if (activeBreak) {
        activeBreak.endTime = new Date();
        await activeBreak.save();
      }

      user.isBreak = false;
      await user.save();

      return new ApiResponse({
        res,
        status: 200,
        data: { isBreak: false },
        message: 'Break stopped successfully'
      });
    } else {
      // User is not on break, start a break
      await Break.create({
        user: id,
        startTime: new Date()
      });
     
      user.isBreak = true;
      await user.save();

      return new ApiResponse({
        res,
        status: 200,
        data: { isBreak: true },
        message: 'Break started successfully'
      });
    }
  });

  // API to get current break status
  static getStatus = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.user as any;
    const user = await User.findById(id).select('isBreak');

    
    if (!user) {
      throw new ApiError({ status: 404, message: 'User not found' });
    }
    const activeBreak = await Break.findOne({ user: id, endTime: { $exists: false } }).sort({ startTime: -1 });

    return new ApiResponse({
      res,
      status: 200,
      data: { isBreak: user.isBreak, activeBreak },
      message: 'Break status fetched successfully'
    });
  });

  // API to get my breaks list with pagination
  static getMyBreaks = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.user as any;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const breaks = await Break.find({ user: id })
      .sort({ startTime: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Break.countDocuments({ user: id });

    return new ApiResponse({
      res,
      status: 200,
      data: {
        breaks,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      },
      message: 'Breaks fetched successfully'
    });
  });

  // API for admin to get breaks of any user by ID with pagination
  static getUserBreaks = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.params.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const breaks = await Break.find({ user: userId })
      .sort({ startTime: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Break.countDocuments({ user: userId });

    return new ApiResponse({
      res,
      status: 200,
      data: {
        breaks,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      },
      message: 'User breaks fetched successfully'
    });
  });

}
