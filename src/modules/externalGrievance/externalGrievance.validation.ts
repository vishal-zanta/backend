import { z } from "zod";

export const createExternalGrievanceSchema = z.object({
  departmentCode: z.string({ message: "departmentCode is required" })
    .trim()
    .min(1, "departmentCode cannot be empty"),
  mobile: z.string({ message: "mobile is required" })
    .trim()
    .length(10, "mobile must be exactly 10 digits")
    .regex(/^[0-9]+$/, "mobile must contain only digits"),
  departmentPayload: z.record(z.string(), z.any(), { message: "departmentPayload is required" })
    .refine(data => Object.keys(data).length > 0, "departmentPayload cannot be empty"),
});

export const updateExternalGrievanceStatusSchema = z.object({
  status: z.string({ message: "status is required" })
    .trim()
    .min(1, "status cannot be empty"),
});
