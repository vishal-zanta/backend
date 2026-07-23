import { z } from "zod";

const mobileSchema = z.string({ message: "mobile is required" })
  .min(10, "Mobile number must be at least 10 digits")
  .max(15, "Mobile number must not exceed 15 digits")
  .regex(/^\+?[0-9]+$/, "Mobile number must contain only digits and optional + prefix for country code");

export const sendOtpSchema = z.object({
  mobile: mobileSchema,
  captchaId: z.string({ message: "captchaId is required" }).min(1, "captchaId cannot be empty"),
  captchaValue: z.string({ message: "captchaValue is required" }).min(1, "captchaValue cannot be empty"),
});

export const loginSchema = z.object({
  mobile: mobileSchema,
  otp: z.string({ message: "otp is required" })
    .length(6, "OTP must be exactly 6 digits")
    .regex(/^[0-9]+$/, "OTP must contain only digits"),
});

export const updateProfileSchema = z.object({
  fullName: z.string().min(3, "Name cannot be empty or less than 3 length").optional(),
  email:z.string().nullable().optional().refine((val) => !val || z.email().safeParse(val).success, {
      message: "Invalid email address",
    }),
  preferredLanguage: z.string().optional(),
});
