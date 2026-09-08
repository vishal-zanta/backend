import { Request, Response } from 'express';
import { Visitor } from './visitor.model.js';
import { asyncHandler } from '../../middlewares/asyncHandler.js';
import ApiResponse from '../../utils/apiResponse.js';

export class VisitorController {
  /**
   * Get total visitor count
   */
  static getVisitorCount = asyncHandler(async (req: Request, res: Response) => {
    const count = await Visitor.countDocuments();
    return new ApiResponse({
      res,
      status: 200,
      data: { count },
      message: "Visitor count fetched successfully",
    });
  });

  /**
   * Save a visitor
   */
  static saveVisitor = asyncHandler(async (req: Request, res: Response) => {
    const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];
  

    const ipStr = typeof ipAddress === 'string' ? ipAddress : Array.isArray(ipAddress) ? ipAddress[0] : undefined;

    let visitor;
    if (ipStr) {
      // Upsert: Create if it doesn't exist, update if it does.
      visitor = await Visitor.findOneAndUpdate(
        { ipAddress: ipStr },
        { 
          $set: { 
            userAgent, 
            source: "website",
            visitedAt: new Date()
          } 
        },
        { upsert: true, new: true }
      );
    } else {
      // Fallback if no IP is detected
      visitor = await Visitor.create({
        userAgent,
        source: "website",
        visitedAt: new Date()
      });
    }

    const count = await Visitor.countDocuments();

    return new ApiResponse({
      res,
      status: 201,
      data: { visitor, count },
      message: "Visitor saved successfully",
    });
  });
}
