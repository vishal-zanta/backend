import { Router } from "express";
import { CaptchaController } from "./captcha.controller.js";

const router = Router();

router.get("/", CaptchaController.getCaptcha);

export default router;
