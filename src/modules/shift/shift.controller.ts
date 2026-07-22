import { Request, Response } from 'express';
import { Shift } from './shift.model.js';
import { User } from '../users/user.model.js';
import { Role } from '../roles/role.model.js';
import { asyncHandler } from '../../middlewares/asyncHandler.js';
import ApiResponse from '../../utils/apiResponse.js';
import { ApiError } from '../../middlewares/errorHandler.js';
import { buildPagination } from '../../utils/helpers.js';

export class ShiftController {
  
  static getUsersWithShifts = asyncHandler(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    // Find roles CCE and Supervisor
    const roles = await Role.find({ level: { $in: ['CCE', 'Supervisor'] } });
    const roleIds = roles.map(r => r._id);


    const query: any = { role: { $in: roleIds }, status: 'ACTIVE' };
    const totalCount = await User.countDocuments(query);
    const pagination = buildPagination({ page, limit, totalCount });

    const users = await User.find(query)
      .populate('role', 'designationEnglish designationHindi level')
      .select('name userCode email role')
      .skip(pagination.offset)
      .limit(pagination.limit);

    // Get all shifts for these users
    const userIds = users.map(u => u._id);
    const shifts = await Shift.find({
      user: { $in: userIds }
    });

    // Map shifts to users
    const result = users.map(user => {
      const userShift = shifts.find(s => s.user.toString() === user._id.toString());
      return {
        ...user.toObject(),
        shift: userShift ? userShift : null
      };
    });

    // Find the currently logged-in user's shift for this date
    const currentUserId = (req as any).user?._id || (req as any).user?.id;
    let myShift = null;
    if (currentUserId) {
      myShift = await Shift.findOne({
        user: currentUserId
      });
    }

    return new ApiResponse({
      res,
      status: 200,
      data: { docs: result, pagination, myShift },
      message: 'Users and their shifts retrieved successfully'
    });
  });

  static assignShift = asyncHandler(async (req: Request, res: Response) => {
    const { userId, date, time } = req.body;

    if (!userId || !date || !time) {
      throw new ApiError({ status: 400, message: "userId, date, and time are required" });
    }

    // Verify target user is CCE or Supervisor
    const targetUser = await User.findById(userId).populate('role');
    if (!targetUser) {
      throw new ApiError({ status: 404, message: "User not found" });
    }

    const targetUserRole = (targetUser as any).role?.level;
    if (targetUserRole !== 'CCE' && targetUserRole !== 'Supervisor') {
      throw new ApiError({ status: 400, message: "Shifts can only be assigned to CCE or Supervisor roles." });
    }

    const shiftDate = new Date(date);
    shiftDate.setHours(0, 0, 0, 0);

    // Update or create shift
    const shift = await Shift.findOneAndUpdate(
      { user: userId },
      { time, date: shiftDate },
      { new: true, upsert: true, runValidators: true }
    );

    return new ApiResponse({
      res,
      status: 200,
      data: shift,
      message: 'Shift assigned successfully'
    });
  });
}
