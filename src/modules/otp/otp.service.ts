import config from "../../config/index.js";
import { Otp } from "./otp.model.js";

export class OtpService {
  /**
   * Generate and store an OTP for the given identifier (like mobile number)
   */
  static async generateOtp(identifier: string): Promise<string> {
    // Generate a 6-digit OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); 

    // Delete existing OTPs for this identifier to prevent spam
    await Otp.deleteMany({ identifier });

    await Otp.create({
      identifier,
      code:config.nodeEnv === "production" ? code : "123456", //TODO: Use a fixed OTP in non-production environments for testing ,remove at prod
      expiresAt,
    });

    // TODO: Integrate with an SMS service to send the OTP to the user's mobile number
    console.log(`Generated OTP for ${identifier}: ${code}`);
    
    return code;
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
