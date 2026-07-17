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
      const existCitizen = await CitizenService.getCitizen(email);
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

    const aggregation = await Grievance.aggregate([
      { $match: { $or: baseConditions } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);

    let totalComplaints = 0;
    let inProgress = 0;
    let resolved = 0;
    let escalated = 0;

    aggregation.forEach(item => {
      totalComplaints += item.count;
      if (item._id === "IN_PROGRESS") inProgress = item.count;
      if (item._id === "RESOLVED") resolved = item.count;
      if (item._id === "ESCALATED") escalated = item.count;
    });

    return new ApiResponse({
      res,
      status: 200,
      data: {
        totalComplaints,
        inProgress,
        resolved,
        escalated
      },
      message: "Dashboard analytics retrieved successfully"
    });
  });
}
