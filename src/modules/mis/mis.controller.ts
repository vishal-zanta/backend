import { Request, Response } from "express";
import { asyncHandler } from "../../middlewares/asyncHandler.js";
import { ApiError } from "../../middlewares/errorHandler.js";
import ApiResponse from "../../utils/apiResponse.js";
import {
  MisService,
  VALID_REPORTS,
  type ReportType,
} from "./mis.service.js";

export class MisController {
  /**
   * KPI tiles for Admin MIS page (independent of report filters).
   * GET /api/v1/mis/stats
   */
  static getStats = asyncHandler(async (_req: Request, res: Response) => {
    try {
      const data = await MisService.getStats();

      return new ApiResponse({
        res,
        status: 200,
        message: "MIS stats fetched successfully",
        data,
      });
    } catch (err) {
      console.error("MIS stats error:", err);
      throw new ApiError({ status: 500, message: "Failed to fetch MIS stats" });
    }
  });

  /**
   * Single MIS reports endpoint.
   * Query: report (required), district, dateRange, fromDate, toDate
   */
  static getReport = asyncHandler(async (req: Request, res: Response) => {
    const report = String(req.query.report || "").trim().toLowerCase() as ReportType;
    const district = String(req.query.district || "all").trim() || "all";
    const dateRange = String(req.query.dateRange || "fy").trim().toLowerCase() || "fy";
    const fromDate = req.query.fromDate
      ? String(req.query.fromDate).trim()
      : undefined;
    const toDate = req.query.toDate
      ? String(req.query.toDate).trim()
      : undefined;

    if (!report) {
      throw new ApiError({ status: 400, message: "Invalid report type" });
    }

    if (!VALID_REPORTS.includes(report)) {
      throw new ApiError({ status: 400, message: "Invalid report type" });
    }

    if (!["cy", "fy", "custom"].includes(dateRange)) {
      throw new ApiError({
        status: 400,
        message: "dateRange must be one of: cy, fy, custom",
      });
    }

    const data = await MisService.getReport({
      report,
      district,
      dateRange,
      fromDate,
      toDate,
    });

    return new ApiResponse({
      res,
      status: 200,
      message: "MIS report fetched successfully",
      data,
    });
  });
}
