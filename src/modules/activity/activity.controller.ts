import { Request, Response } from 'express';
import { ActivityService } from './activity.service.js';
import { User } from '../users/user.model.js';
import { asyncHandler } from '../../middlewares/asyncHandler.js';
import { ApiError } from '../../middlewares/errorHandler.js';
import ApiResponse from '../../utils/apiResponse.js';

export class ActivityController {
 
  static pulse = asyncHandler(async (req: Request, res: Response) => {
    const user = req.user as any;
    
    if (user.roles && Array.isArray(user.roles) && user.roles.length > 0) {
      user.roles.forEach((r: any) => {
        const roleLevel = r.level || 'unknown';
        ActivityService.recordPulse(user.id, String(roleLevel));
      });
    } else {
      ActivityService.recordPulse(user.id, 'unknown');
    }

    return new ApiResponse({
      res,
      status: 200,
      message: 'Pulse recorded successfully for all active roles',
    });
  });


  static getActiveUsers = asyncHandler(async (req: Request, res: Response) => {
    const { roleLevel, countOnly } = req.query;
    
    const result = ActivityService.getActiveUsers(roleLevel as string);

    // If countOnly is true, return just the count
    if (countOnly === 'true') {
      return new ApiResponse({
        res,
        status: 200,
        data: { count: result.count },
        message: 'Active users count fetched successfully',
      });
    }

    return new ApiResponse({
      res,
      status: 200,
      data: result,
      message: 'Active users fetched successfully',
    });
  });

  /**
   * Admin endpoint to force logout a user
   */
  static adminLogoutUser = asyncHandler(async (req: Request, res: Response) => {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError({ status: 404, message: 'User not found' });
    }

    user.adminLogout = new Date();
    await user.save();

    return new ApiResponse({
      res,
      status: 200,
      message: `User ${user.name} logged out successfully.`,
    });
  });
}
