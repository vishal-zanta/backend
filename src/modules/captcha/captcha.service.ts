import svgCaptcha from "svg-captcha";
import crypto from "crypto";
import { Captcha } from "./captcha.model.js";

export class CaptchaService {
  /**
   * Generates a new captcha, saves it to the database, and returns the SVG data and ID.
   */
  static async generateCaptcha() {
    const captcha = svgCaptcha.create({
      size: 6,
      noise: 2,
      color: true,
      background: "#f0f0f0",
    });

    // Generate a small UUID (8 characters hex)
    const captchaId = crypto.randomBytes(4).toString("hex");

    // Expires in 5 minutes
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await Captcha.create({
      captchaId,
      text: captcha.text,
      expiresAt,
    });

    return {
      captchaId,
      svg: captcha.data,
    };
  }

  /**
   * Verifies a captcha given its ID and user-provided value.
   * Returns true if valid, false if invalid.
   * Throws an error if expired or used.
   */
  static async verifyCaptcha(captchaId: string, value: string): Promise<boolean> {
    const captcha = await Captcha.findOne({ captchaId });

    if (!captcha) {
      throw new Error("error expired captcha");
    }

    if (captcha.isUsed) {
      throw new Error("error expired captcha");
    }

    if (captcha.expiresAt < new Date()) {
      throw new Error("error expired captcha");
    }

    // Mark as used regardless of success/failure so it can't be brute-forced
    captcha.isUsed = true;
    await captcha.save();

    // Verify text (case-insensitive)
    if (captcha.text.toLowerCase() === value.toLowerCase()) {
      return true;
    }

    return false;
  }
}
