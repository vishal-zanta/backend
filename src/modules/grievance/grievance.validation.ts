import { z } from "zod";

const mongoId = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid MongoDB ID format");

const optionalBoolean = z.preprocess(
  (val) => {
    if (val === undefined || val === null || val === "") return undefined;
    if (typeof val === "string") return val.toLowerCase() === "true";
    return Boolean(val);
  },
  z.boolean().optional()
);

// Helpers to sanitize text inputs
const requiredText = (msg: string) => 
  z.string({ message: msg })
   .trim()
   .min(1, msg)
   .transform(val => val.replace(/\s+/g, ' '));

const optionalText = z.string()
  .trim()
  .transform(val => val.replace(/\s+/g, ' '))
  .optional();

const locationOrPermanentAddress = z.object({
  isUrban: optionalBoolean.default(false),
  addressLine: z
    .string()
    .min(1, "Field is required")
    .max(50, "Address details cannot exceed 50 characters"),
    
  district: mongoId,

  //rural
  block: mongoId.optional().or(z.literal("")),
  panchayat: mongoId.optional().or(z.literal("")),
  thana:
    z.string()
    .max(50, "Thana cannot exceed 50 characters")
    .optional()
    .or(z.literal("")),
  village: mongoId.optional().or(z.literal("")),

  pincode: z
    .string()
    .max(6, "Pincode cannot exceed 6 characters")
    .optional()
    .or(z.literal("")),

  // urban
  urbanPanchayat: mongoId.optional().or(z.literal("")),
  ward: mongoId.optional().or(z.literal("")),
    
  // common
  landmark: z
    .string()
    .max(50, "Landmark cannot exceed 50 characters")
    .optional()
    .or(z.literal("")),
    
  state: z
    .string()
    .max(50, "State cannot exceed 50 characters")
    .optional()
    .or(z.literal("")),
  city: z
    .string()
    .max(50, "City cannot exceed 50 characters")
    .optional()
    .or(z.literal("")),
});

const finalAddressSchema = z.object({
  isUrban: optionalBoolean,
  addressLine: z
    .string()
    .max(50, "Address details cannot exceed 50 characters")
    .optional()
    .or(z.literal("")),
  // .min(1, "Address details are required")
  district: z
    .string()
    .max(50, "District cannot exceed 50 characters")
    .optional()
    .or(z.literal("")),
  // .min(1, "District is required")
  block: z
    .string()
    .max(50, "Block cannot exceed 50 characters")
    .optional()
    .or(z.literal("")),
  panchayat: z
    .string()
    .max(50, "Panchayat cannot exceed 50 characters")
    .optional()
    .or(z.literal("")),
  thana: z
    .string()
    .max(50, "Thana cannot exceed 50 characters")
    .optional()
    .or(z.literal("")),
  village: z
    .string()
    .max(50, "Village cannot exceed 50 characters")
    .optional()
    .or(z.literal("")),
  pincode: z
    .string()
    .max(6, "Pincode cannot exceed 6 characters")
    .optional()
    .or(z.literal("")),

  // urban
  urbanPanchayat: z
    .string()
    .max(
      50,
      "Municipal corporation/municipal council/nagar panchayat cannot exceed 50 characters",
    )
    .optional()
    .or(z.literal("")),
  ward: z
    .string()
    .max(50, "Ward cannot exceed 50 characters")
    .optional()
    .or(z.literal("")),
  // correspondance
  state: z
    .string()
    .max(50, "State cannot exceed 50 characters")
    .optional()
    .or(z.literal("")),
  city: z
    .string()
    .max(50, "City cannot exceed 50 characters")
    .optional()
    .or(z.literal("")),
  addressLine2: z
    .string()
    .max(50, "Address details cannot exceed 50 characters")
    .optional()
    .or(z.literal("")),
});

const addressSchema = locationOrPermanentAddress.superRefine((data, ctx) => {
  if (!!data.isUrban) {
    const requiredKeys = ["urbanPanchayat", "ward"] as const;
    requiredKeys.forEach((key) => {
      if (!data[key] || data[key].trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Field is required",
          path: [key],
        });
      }
    });
  } else {
    const requiredKeys = ["block", "panchayat"] as const;
    requiredKeys.forEach((key) => {
      if (!data[key] || data[key].trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Field is required",
          path: [key],
        });
      }
    });
  }
});

const correspondenceAddressSchema = finalAddressSchema.superRefine(
  (data, ctx) => {
    if (!data.state || data.state.trim() === "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Field is required",
        path: ["state"],
      });
    }

    if (data.state === "Bihar") {
      // Logic handled
    } else {
      const requiredKeys = ["addressLine", "city"] as const;
      requiredKeys.forEach((key) => {
        if (!data[key] || data[key].trim() === "") {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Field is required",
            path: [key],
          });
        }
      });
    }
  },
);

export const grievanceSchema = z.object({
  citizenInfo: z.object({
    fullName: z
      .string()
      .min(1, "Name is required")
      .max(50, "Full name cannot exceed 50 characters"),
    mobile: z
      .string()
      .min(13, "Mobile number must be at least 10 digits")
      .max(13, "Mobile number cannot exceed 10 digits"),
    alternateMobile: z
      .string()
      .min(13, "Mobile number must be at least 10 digits")
      .max(13, "Mobile number cannot exceed 10 digits")
      .optional()
      .or(z.literal("")),
    email: z
      .string()
      .email("Enter a valid email")
      .max(50, "Email cannot exceed 50 characters")
      .optional()
      .or(z.literal("")),
    address: addressSchema,
  }),
  classification: z.object({
    nature: z.string().min(1, "Grievance type is required"),
    service: mongoId,
    department: mongoId,
  }),
  evidence: z.object({
    details: z
      .string()
      .min(1, "Brief description is required")
      .max(1000, "Brief description cannot exceed 1000 characters"),
  }),
  impact: z.object({
    affectedBeneficiary: z.string().min(1, "Affected beneficiary is required"),
    vulnerability: z.object({
      seniorCitizen: optionalBoolean,
      woman: optionalBoolean,
      personWithDisability: optionalBoolean,
      economicallyWeakerSection: optionalBoolean,
      general: optionalBoolean,
    }).optional(),
  }),
  communication: z.object({
    feedbackConsent: optionalBoolean,
  }).optional(),
  isCrpEqualPerAdd: optionalBoolean,
  address: correspondenceAddressSchema.optional(),
  location: addressSchema,
});

export const createGrievanceSchema = grievanceSchema;
export const createGrievanceByAgentSchema = createGrievanceSchema;

export const submitFeedbackSchema = z.object({
  rating: z.coerce.number({ message: "A valid star rating between 1 and 5 is required." })
    .min(1, "A valid star rating between 1 and 5 is required.")
    .max(5, "A valid star rating between 1 and 5 is required."),
  feedbackText: optionalText,
});

export const reopenGrievanceSchema = z.object({
  reOpenReason: requiredText("Reason for reopening is strictly mandatory and cannot be empty spaces."),
});
