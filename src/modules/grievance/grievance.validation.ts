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

// Helpers to sanitize text inputs by trimming leading/trailing spaces 
// and replacing multiple consecutive spaces with a single space.
const requiredText = (msg: string) => 
  z.string({ message: msg })
   .trim()
   .min(1, msg)
   .transform(val => val.replace(/\s+/g, ' '));

const optionalText = z.string()
  .trim()
  .transform(val => val.replace(/\s+/g, ' '))
  .optional();

const addressSchema = z.object({
  addressLine: z.string().min(1, "Address details are required"),
  city: z.string().optional(),
  state: z.string().optional(),
  district: z.string().min(1, "District is required"),
  subdivision: z.string().min(1, "Block is required"),
  panchayat: z.string().min(1, "Panchayat is required"),
  thana: z.string().min(1, "Thana is required"),
  pincode: z.string().min(1, "Pincode is required"),
});

export const createGrievanceSchema = z.object({
  citizenInfo: z.object({
    fullName: z.string().optional(),
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
    email: z.string().email("Enter a valid email").optional().or(z.literal("")),
    preferredLanguage: z.string().min(1, "Preferred language is required"),
    address: addressSchema,
  }),
  classification: z.object({
    subService: z.string().min(1, "Sub-service is required"),
    nature: z.string().min(1, "Grievance type is required"),
    service: z.any(),
    department: z.any(),
  }),
  evidence: z.object({
    details: z.string().optional(),
  }),
  impact: z.object({
    affectedBeneficiary: z.string().min(1, "Affected beneficiary is required"),
    vulnerability: z.object({
      seniorCitizen: z.boolean().optional(),
      woman: z.boolean().optional(),
      personWithDisability: z.boolean().optional(),
      economicallyWeakerSection: z.boolean().optional(),
    }).optional(),
    publicImpact: z.string().optional(),
  }).optional(),
  communication: z.object({
    feedbackConsent: z.boolean().optional(),
  }).optional(),
  address: addressSchema,
  location: z.object({
    division: z.string().min(1, "Division is required"),
    district: z.string().min(1, "District is required"),
    subdivision: z.string().min(1, "Block is required"),
    block: z.string().min(1, "Block is required"),
    panchayat: z.string().min(1, "Panchayat is required"),
    pinCode: z
      .string()
      .min(1, "Pincode is required")
      .regex(/^8\d{5}$/, "Enter a valid pin code of Bihar"),
  }),
});

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
