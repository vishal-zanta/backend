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

export const createGrievanceSchema = z.object({
  classification: z.object({
    subService: mongoId,
    scheme: optionalText,
    nature: mongoId,
    subject: optionalText,
  }, { message: "classification is required" }),
  evidence: z.object({
    details: optionalText,
    occurrenceDate: z.string().or(z.date()).optional(), 
    frequency: mongoId,
  }, { message: "evidence is required" }),
  impact: z.object({
    affectedBeneficiary: mongoId,
    vulnerability: z.object({
      seniorCitizen: optionalBoolean,
      woman: optionalBoolean,
      personWithDisability: optionalBoolean,
      economicallyWeakerSection: optionalBoolean,
    }).optional(),
    publicImpact: mongoId.optional(),
  }).optional(),
  communication: z.object({
    preferredMode: mongoId.optional(),
    feedbackConsent: optionalBoolean,
    satisfactionSurveyConsent: optionalBoolean,
  }).optional(),
  address: z.object({
    state: optionalText,
    district: mongoId,
    subdivision: optionalText,
    villageOrWard: optionalText,
    pinCode: optionalText,
    landmark: optionalText,
  }).optional(),
  citizenInfo: z.object({
    fullName: optionalText,
    mobile: z.string().trim().optional(),
    alternateMobile: z.string().trim().optional(),
    email: z.string().trim().email("Invalid email format").optional().or(z.literal("")),
    preferredLanguage: optionalText,
  }).optional(),
});

export const createGrievanceByAgentSchema = createGrievanceSchema.extend({
  citizenInfo: z.object({
    mobile: z.string({ message: "citizenInfo.mobile is required when creating a grievance on behalf of a citizen." })
      .trim()
      .length(10, "Mobile number must be exactly 10 digits")
      .regex(/^[0-9]+$/, "Mobile number must contain only digits"),
    fullName: optionalText,
    alternateMobile: z.string().trim().optional(),
    email: z.email("Invalid email format").optional().or(z.literal("")),
    preferredLanguage: optionalText,
  })
});

export const submitFeedbackSchema = z.object({
  rating: z.coerce.number({ message: "A valid star rating between 1 and 5 is required." })
    .min(1, "A valid star rating between 1 and 5 is required.")
    .max(5, "A valid star rating between 1 and 5 is required."),
  feedbackText: optionalText,
});

export const reopenGrievanceSchema = z.object({
  reOpenReason: requiredText("Reason for reopening is strictly mandatory and cannot be empty spaces."),
});
