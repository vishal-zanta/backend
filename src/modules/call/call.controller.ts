import { Request, Response } from 'express';
import { asyncHandler } from '../../middlewares/asyncHandler.js';
import ApiResponse from '../../utils/apiResponse.js';
import { ApiError } from '../../middlewares/errorHandler.js';
import { Call } from './call.model.js';
import { User } from '../users/user.model.js';
import { buildPagination } from '../../utils/helpers.js';
import mongoose from 'mongoose';

export class CallController {
  
  /**
   * Get all calls based on role
   * Admin: all calls
   * Supervisor: calls assigned to their CCEs
   * CCE: their own calls
   */
  static getCalls = asyncHandler(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const userRoles = (req as any).user?.roles || [];
    const userId = (req as any).user?._id || (req as any).user?.id;
    
    const isAdmin = userRoles.some((r: any) => r.level === 'Admin');
    const isSupervisor = userRoles.some((r: any) => r.level === 'Supervisor');
    const isCCE = userRoles.some((r: any) => r.level === 'CCE');

    const query: any = {};

    if (!isAdmin) {
      if (isSupervisor) {
        // Find all CCEs managed by this supervisor
        const cces = await User.find({ supervisor: userId }).select('_id');
        const cceIds = cces.map(cce => cce._id);
        // Include supervisor's own calls if any, and their CCEs' calls
        query.agent = { $in: [...cceIds, userId] };
      } else if (isCCE) {
        // Only own calls
        query.agent = userId;
      } else {
        // Fallback for other roles: only see own
        query.agent = userId;
      }
    }

    // Apply filters
    if (req.query.status) {
      query.status = req.query.status;
    }
    if (req.query.callType) {
      query.callType = req.query.callType;
    }
    if (req.query.evidenceTagged) {
      query.evidenceTagged = req.query.evidenceTagged === 'true';
    }
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search as string, 'i');
      query.$or = [
        { callId: searchRegex },
        { complaintIdString: searchRegex },
        { citizenMobile: searchRegex }
      ];
    }

    const totalCount = await Call.countDocuments(query);
    const pagination = buildPagination({ page, limit, totalCount });

    const calls = await Call.find(query)
      .populate('agent', 'name userCode')
      .populate('taggedBy', 'name userCode')
      .populate('complaintId', 'grievanceId status')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    return new ApiResponse({
      res,
      status: 200,
      data: {
        docs: calls,
        pagination
      },
      message: 'Calls fetched successfully'
    });
  });

  /**
   * Mark a call as evidence
   */
  static markAsEvidence = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { evidenceReason } = req.body;
    const userId = (req as any).user?._id || (req as any).user?.id;

   

    // Check if valid ObjectId or CallId string
    const query = mongoose.isValidObjectId(id) 
      ? { _id: id } 
      : { callId: id };

    const callDoc = await Call.findOne(query);

    if (!callDoc) {
      throw new ApiError({ status: 404, message: "Call not found" });
    }

    callDoc.evidenceTagged = true;
    callDoc.evidenceReason = evidenceReason||"";
    callDoc.taggedBy = userId;
    callDoc.taggedDate = new Date();

    await callDoc.save();

    return new ApiResponse({
      res,
      status: 200,
      data: callDoc,
      message: "Call successfully marked as evidence"
    });
  });
}
