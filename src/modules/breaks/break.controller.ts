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

 
}
