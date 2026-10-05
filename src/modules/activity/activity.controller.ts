import { Request, Response } from 'express';
import { ActivityService } from './activity.service.js';
import { User } from '../users/user.model.js';
import { asyncHandler } from '../../middlewares/asyncHandler.js';
import { ApiError } from '../../middlewares/errorHandler.js';
import ApiResponse from '../../utils/apiResponse.js';

export class ActivityController {
 
  static pulse = asyncHandler(async (req: Request, res: Response) => {
    const user = req.user as any;
    const { isActiveOnScreen = true, screenState } = req.body;
    const active = isActiveOnScreen !== false;
    
    if (user.roles && Array.isArray(user.roles) && user.roles.length > 0) {
      for (const r of user.roles) {
        const roleLevel = r.level || 'unknown';
        await ActivityService.recordPulse(user.id, String(roleLevel), active, screenState);
      }
    } else {
      await ActivityService.recordPulse(user.id, 'unknown', active, screenState);
    }

    return new ApiResponse({
      res,
      status: 200,
      data: {
        isOnline: true,
        isActiveOnScreen: active,
        screenState: screenState || (active ? 'ACTIVE' : 'BACKGROUND'),
      },
      message: 'Pulse recorded successfully for all active roles',
    });
  });

  static getActiveUsers = asyncHandler(async (req: Request, res: Response) => {
    const { roleLevel, countOnly } = req.query;
    
    const result = await ActivityService.getActiveUsers(roleLevel as string);

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
    user.isBreak = false;
    await user.save();

    // Remove user activity from Redis
    await ActivityService.removeUserActivity(user._id.toString());

    return new ApiResponse({
      res,
      status: 200,
      message: `User ${user.name} logged out successfully.`,
    });
  });
}
