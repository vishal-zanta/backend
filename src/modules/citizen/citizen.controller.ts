import { Request, Response } from "express";
import { sendOtpSchema, loginSchema, updateProfileSchema } from "./citizen.validation.js";
import { CitizenService } from "./citizen.service.js";
import { CaptchaService } from "../captcha/captcha.service.js";
import { OtpService } from "../otp/otp.service.js";
import { asyncHandler } from "../../middlewares/asyncHandler.js";
import { ApiError } from "../../middlewares/errorHandler.js";
import ApiResponse from "../../utils/apiResponse.js";
import { PasswordHelper } from "../../utils/passwordHelper.js";
import { Grievance } from "../grievance/grievance.model.js";
import { GrievanceAnalyticLog } from "../grievance/grievanceAnalyticLog.model.js";
import { ExternalGrievance } from "../externalGrievance/externalGrievance.model.js";
export class CitizenController {
  /**
   * Validates Captcha and sends an OTP to the citizen's mobile number.
   */
  static sendOtp = asyncHandler(async (req: Request, res: Response) => {
    const validation = sendOtpSchema.safeParse(req.body);
    if (!validation.success) {
      throw new ApiError({ status: 400, message: validation.error.issues.map((e: any) => e.message).join(", ") });
    }
    const { mobile, captchaId, captchaValue } = validation.data;

    // Verify Captcha
    try {
      const isValid = await CaptchaService.verifyCaptcha(captchaId, captchaValue);
      if (!isValid) {
        throw new Error("Invalid Captcha");
      }
    } catch (error: any) {
      throw new ApiError({ status: 400, message: error.message || "Invalid Captcha" });
    }

    // Generate OTP
    const otp = await OtpService.generateOtp(mobile);

    // Normally don't send OTP in response in production!
    return new ApiResponse({
      res,
      status: 200,
      data: null, 
      message: "OTP sent successfully to mobile",
    });
  });

  /**
   * Validates OTP and logs in or registers the citizen.
   * Returns a JWT token valid for 1 day.
   */
  static login = asyncHandler(async (req: Request, res: Response) => {
    const validation = loginSchema.safeParse(req.body);
    if (!validation.success) {
      throw new ApiError({ status: 400, message: validation.error.issues.map((e: any) => e.message).join(", ") });
    }
    const { mobile, otp } = validation.data;

    // Verify OTP (throws error if invalid)
    try {
      await OtpService.verifyOtp(mobile, otp);
    } catch (error: any) {
      throw new ApiError({ status: 400, message: error.message || "Invalid OTP" });
    }

    // Get or Create Citizen using mobile only
    const citizen = await CitizenService.getOrCreateCitizen(mobile, { mobile });

    // Create standardized response payload using PasswordHelper
    const payload = PasswordHelper.createCitizenPayload(citizen);

    return new ApiResponse({
      res,
      status: 200,
      data: payload,
      message: "Citizen logged in successfully",
    });
  });

  /**
   * Retrieves the currently logged-in citizen's profile.
   */
  static getProfile = asyncHandler(async (req: Request, res: Response) => {
    // req.citizen is set by the citizenAuthProtect middleware
    return new ApiResponse({
      res,
      status: 200,
      data: req.citizen,
      message: "Profile retrieved successfully",
    });
  });

  /**
   * Updates the logged-in citizen's name, email, and preferredLanguage.
   */
  static updateProfile = asyncHandler(async (req: Request, res: Response) => {
    const validation = updateProfileSchema.safeParse(req.body);
    if (!validation.success) {
      throw new ApiError({ status: 400, message: validation.error.issues.map((e: any) => e.message).join(", ") });
    }
    const { fullName, email, preferredLanguage } = validation.data;
    const citizen = req.citizen!;

    if (fullName !== undefined) {
      citizen.fullName = fullName;
    }
    if (email !== undefined) {
      const existCitizen = await CitizenService.getCitizen(email as string);
      if (existCitizen && existCitizen.id !== citizen?._id.toString()) {
        throw new ApiError({ status: 409, message: "Email already in use" });
      }
      
      citizen.email = email;
    }
    if (preferredLanguage !== undefined) {
      citizen.preferredLanguage = preferredLanguage;
    }

    await citizen.save();

    return new ApiResponse({
      res,
      status: 200,
      data: citizen,
      message: "Profile updated successfully",
    });
  });

  /**
   * Retrieves dashboard analytics for the logged-in citizen.
   */
  static getDashboardAnalytics = asyncHandler(async (req: Request, res: Response) => {
    const citizen = req.citizen;

    if (!citizen) {
      throw new ApiError({ status: 401, message: "Unauthorized" });
    }

    const baseConditions: any[] = [
      { citizen: citizen._id },
      { "citizenInfo.mobile": citizen.mobile },
    ];
    if (citizen.alternateMobile) {
      baseConditions.push({ "citizenInfo.mobile": citizen.alternateMobile });
    }

    const internalAgg = await Grievance.aggregate([
      { $match: { $or: baseConditions } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);

    // External Grievances matching
    const externalMobiles = [citizen.mobile.slice(-10)];
    if (citizen.alternateMobile) {
      externalMobiles.push(citizen.alternateMobile.slice(-10));
    }
    const extMobileRegex = new RegExp(`(${externalMobiles.join("|")})$`);

    const externalAgg = await ExternalGrievance.aggregate([
      { $match: { mobile: extMobileRegex } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);

    // Calculate internal complaints escalated count
    const citizenGrievanceIds = await Grievance.find({ $or: baseConditions }).distinct("_id");
    const loggedEscalatedIds = citizenGrievanceIds.length > 0
      ? await GrievanceAnalyticLog.distinct("grievance", {
          grievance: { $in: citizenGrievanceIds },
          action: "ESCALATED",
        })
      : [];

    const escalatedCount = await Grievance.countDocuments({
      $and: [
        { $or: baseConditions },
        {
          $or: [
            { status: "ESCALATED" },
            { escalationLevel: { $gt: 0 } },
            ...(loggedEscalatedIds.length > 0 ? [{ _id: { $in: loggedEscalatedIds } }] : []),
          ],
        },
      ],
    });

    const existingEscalatedIndex = internalAgg.findIndex(
      (item: any) => String(item._id).toUpperCase() === "ESCALATED"
    );
    if (existingEscalatedIndex !== -1) {
      internalAgg[existingEscalatedIndex].count = Math.max(
        internalAgg[existingEscalatedIndex].count,
        escalatedCount
      );
    } else {
      internalAgg.push({ _id: "ESCALATED", count: escalatedCount });
    }

    return new ApiResponse({
      res,
      status: 200,
      data: {
        externalAgg,
        internalAgg,
      },
      message: "Dashboard analytics retrieved successfully"
    });
  });
}
