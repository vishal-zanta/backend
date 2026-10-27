import config from "../../config/index.js";
import { Otp } from "./otp.model.js";
import { SmsService } from "../sms/sms.service.js";

export class OtpService {
  /**
   * Generate and store an OTP for the given identifier (like mobile number)
   */
  static async generateOtp(identifier: string): Promise<string> {
    // Generate a 6-digit OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const finalCode = config.nodeEnv === "production" ? code : "123456"; // Fixed OTP in non-prod if needed
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); 

    // Delete existing OTPs for this identifier to prevent spam
    await Otp.deleteMany({ identifier });

    await Otp.create({
      identifier,
      code: finalCode,
      expiresAt,
    });

    // Enqueue OTP into BullMQ high-priority queue without blocking the API response
    SmsService.sendOtp(identifier, finalCode).catch((err) => {
      console.error(`[OtpService] Error enqueuing OTP SMS to ${identifier}:`, err?.message);
    });

    console.log(`Generated OTP for ${identifier}: ${finalCode}`);
    
    return finalCode;
  }

  /**
   * Verify the OTP for the given identifier
   */
  static async verifyOtp(identifier: string, code: string): Promise<boolean> {
    const otpRecord = await Otp.findOne({ identifier, code, isUsed: false });

    if (!otpRecord) {
      throw new Error("Invalid or expired OTP");
    }

    if (otpRecord.expiresAt < new Date()) {
      throw new Error("OTP has expired");
    }

    // Mark as used to prevent reuse
    otpRecord.isUsed = true;
    await otpRecord.save();

    return true;
  }
}
