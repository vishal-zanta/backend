import { Request, Response } from "express";
import { CaptchaService } from "./captcha.service.js";
import { asyncHandler } from "../../middlewares/asyncHandler.js";

export class CaptchaController {
  /**
   * Generates a captcha and returns it directly as an SVG image.
   * The captcha ID is sent in the custom header 'x-captcha-id'.
   */
  static getCaptcha = asyncHandler(async (req: Request, res: Response) => {
    const { captchaId, svg } = await CaptchaService.generateCaptcha();

    // Send the SVG image directly and set the captchaId in headers
    res.type("svg");
    res.setHeader("x-captcha-id", captchaId);
    res.setHeader("Access-Control-Expose-Headers", "x-captcha-id");
    
    res.status(200).send(svg);
  });
}
