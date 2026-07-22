import svgCaptcha from "svg-captcha";
import crypto from "crypto";
import { Captcha } from "./captcha.model.js";
import config from "../../config/index.js";

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
      charPreset: "abcdefghijklmnopqrstuvwxyz0123456789"
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

  /**
   * Verifies a Google reCAPTCHA v3 token by calling the Google API and checking the score.
   * Returns true if valid and score >= minScore, false otherwise.
   */
  static async verifyGoogleCapcha(token: string, minScore: number = 0.8): Promise<boolean> {
    if (!token) {
      throw new Error("Missing Google reCAPTCHA token");
    }

    const secret = config.googleRecaptchaSecret;

    if (!secret) {
      console.warn("GOOGLE_RECAPTCHA_SECRET is not configured in .env");
      throw new Error("reCAPTCHA is not configured on the server");
    }

    try {
      const response = await fetch("https://www.google.com/recaptcha/api/siteverify", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: `secret=${secret}&response=${token}`,
      });

      const data = await response.json();
      console.log(data," Google reCAPTCHA verification response");

      // For reCAPTCHA v3, we check both success and the score.
      if (data.success && data.score !== undefined) {
        if (data.score >= minScore) {
          return true;
        } else {
          console.warn(`reCAPTCHA v3 score too low: ${data.score} (Requires >= ${minScore})`);
          return false;
        }
      
      } else {
        console.error("Google reCAPTCHA verification failed:", data["error-codes"]);
        return false;
      }
    } catch (error) {
      console.error("Failed to reach Google reCAPTCHA API:", error);
      throw new Error("Failed to verify reCAPTCHA");
    }
  }
}
