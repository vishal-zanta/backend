import { Request, Response } from 'express';
import { asyncHandler } from '../../middlewares/asyncHandler.js';
import ApiResponse from '../../utils/apiResponse.js';
import { ApiError } from '../../middlewares/errorHandler.js';
import { Email } from './email.model.js';
import { buildPagination } from '../../utils/helpers.js';

export class EmailController {
  
  /**
   * Update the status of an Email (only REJECTED or CLOSED)
   */
  static updateStatus = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params; // This could be the _id or the emailId (e.g. INM-001)
    const { status, rejectionReason, closeReason } = req.body;

    if (!status || !['REJECTED', 'CLOSED'].includes(status)) {
      throw new ApiError({ status: 400, message: "Valid status is required. Can only be REJECTED or CLOSED." });
    }

    const emailDoc = await Email.findOne({
      $or: [{ _id: (id as string).match(/^[0-9a-fA-F]{24}$/) ? id : null }, { emailId: id }]
    });

    if (!emailDoc) {
      throw new ApiError({ status: 404, message: "Email not found" });
    }

    if (emailDoc.status === 'CONVERTED') {
      throw new ApiError({ status: 400, message: "Cannot change status of an already CONVERTED email." });
    }

    emailDoc.status = status;
    
    if (status === 'REJECTED' && rejectionReason) {
      emailDoc.rejectionReason = rejectionReason;
    }
    if (status === 'CLOSED' && closeReason) {
      emailDoc.closeReason = closeReason;
    }

    await emailDoc.save();

    return new ApiResponse({ 
      res, 
      status: 200, 
      data: emailDoc, 
      message: `Email status updated to ${status} successfully` 
    });
  });

  /**
   * Get paginated list of emails with search and short content
   */
  static getEmails = asyncHandler(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const query: any = {};

    if (req.query.status) {
      query.status = req.query.status;
    }

    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search as string, 'i');
      query.$or = [
        { emailId: searchRegex },
        { fromName: searchRegex },
        { fromEmail: searchRegex }
      ];
    }

    const totalCount = await Email.countDocuments(query);
    const pagination = buildPagination({ page, limit, totalCount });
    
    // Select only required fields, omitting large attachments or other heavy data
    const emails = await Email.find(query)
      .select('emailId fromName fromEmail subject body status receivedAt grievance')
      .populate({ path: 'grievance', select: 'grievanceId' })
      .sort({ receivedAt: -1 })
      .skip(pagination.offset)
      .limit(pagination.limit)
      .lean();

    // Shorten subject and body for the list view
    const formattedDocs = emails.map(email => ({
      ...email,
      subject: email.subject && email.subject.length > 60 
        ? email.subject.substring(0, 60) + '...' 
        : email.subject,
      body: email.body && email.body.length > 100 
        ? email.body.substring(0, 100) + '...' 
        : email.body
    }));

    return new ApiResponse({ 
      res, 
      status: 200, 
      data: {
        docs: formattedDocs,
        pagination
      }, 
      message: "Emails fetched successfully" 
    });
  });

  /**
   * Get email statistics (count per status + total)
   */
  static getEmailStats = asyncHandler(async (req: Request, res: Response) => {
    const stats = await Email.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);

    const counts: Record<string, number> = {
      total: 0,
      PENDING: 0,
      CONVERTED: 0,
      REJECTED: 0,
      CLOSED: 0
    };

    stats.forEach(stat => {
      if (stat._id) {
        counts[stat._id] = stat.count;
        counts.total += stat.count;
      }
    });

    return new ApiResponse({
      res,
      status: 200,
      data: counts,
      message: "Email statistics fetched successfully"
    });
  });

  /**
   * Get a single email by its _id, emailId, or complaintId
   */
  static getEmailById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const orConditions: any[] = [
      { _id: id },
      { grievance: id }
    ];

    if ((id as string).match(/^[0-9a-fA-F]{24}$/)) {
      orConditions.push({ _id: id });
    }

    const emailDoc = await Email.findOne({ $or: orConditions })
      .populate('grievance') // Populate full grievance details
      .lean();

    if (!emailDoc) {
      throw new ApiError({ status: 404, message: "Email not found" });
    }

    return new ApiResponse({
      res,
      status: 200,
      data: emailDoc,
      message: "Email details fetched successfully"
    });
  });
}