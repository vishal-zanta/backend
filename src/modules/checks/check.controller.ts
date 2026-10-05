import { Request, Response } from "express";
import { asyncHandler } from "../../middlewares/asyncHandler.js";
import ApiResponse from "../../utils/apiResponse.js";
import { CheckService } from "./check.service.js";

export class CheckController {
  /**
   * Get real-time monitoring status of all targets:
   * Current status, uptime calculation (0 if down), last down info, and recent history.
   * @route GET /api/v1/checks/monitoring
   */
  static getMonitoring = asyncHandler(async (_req: Request, res: Response) => {
    const data = await CheckService.getMonitoringSummary();

    return new ApiResponse({
      res,
      status: 200,
      data,
      message: "Monitoring status fetched successfully",
    });
  });

  /**
   * Get down documents (history of when services were down)
   * @route GET /api/v1/checks/down-docs
   */
  static getDownDocs = asyncHandler(async (req: Request, res: Response) => {
    const { name, page, limit } = req.query;

    const pageNum = page ? parseInt(page as string) : 1;
    const limitNum = limit ? parseInt(limit as string) : 20;
    const targetName = name ? (name as string).trim() : undefined;

    const data = await CheckService.getDownDocs({
      name: targetName,
      page: pageNum,
      limit: limitNum,
    });

    return new ApiResponse({
      res,
      status: 200,
      data,
      message: "Down documents fetched successfully",
    });
  });

  /**
   * Get all check logs with filters and pagination
   * @route GET /api/v1/checks/history
   */
  static getHistory = asyncHandler(async (req: Request, res: Response) => {
    const { name, status, page, limit } = req.query;

    const pageNum = page ? parseInt(page as string) : 1;
    const limitNum = limit ? parseInt(limit as string) : 50;

    const data = await CheckService.getHistory({
      name: name as string,
      status: status as string,
      page: pageNum,
      limit: limitNum,
    });

    return new ApiResponse({
      res,
      status: 200,
      data,
      message: "Check history fetched successfully",
    });
  });
}
