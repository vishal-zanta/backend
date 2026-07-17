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

export const createGrievanceSchema = z.object({
  classification: z.object({
    subService: mongoId,
    scheme: z.string().optional(),
    nature: mongoId,
    subject: z.string({ message: "classification.subject is required" }),
  }, { message: "classification is required" }),
  evidence: z.object({
    details: z.string().optional(),
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
    state: z.string().optional(),
    district: mongoId,
    subdivision: z.string().optional(),
    villageOrWard: z.string().optional(),
    pinCode: z.string().optional(),
    landmark: z.string().optional(),
  }).optional(),
  citizenInfo: z.object({
    fullName: z.string().optional(),
    mobile: z.string().optional(),
    alternateMobile: z.string().optional(),
    email: z.email("Invalid email format").optional().or(z.literal("")),
    preferredLanguage: z.string().optional(),
  }).optional(),
});

export const createGrievanceByAgentSchema = createGrievanceSchema.extend({
  citizenInfo: z.object({
    mobile: z.string({ message: "citizenInfo.mobile is required when creating a grievance on behalf of a citizen." })
      .length(10, "Mobile number must be exactly 10 digits")
      .regex(/^[0-9]+$/, "Mobile number must contain only digits"),
    fullName: z.string().optional(),
    alternateMobile: z.string().optional(),
    email: z.string().email("Invalid email format").optional().or(z.literal("")),
    preferredLanguage: z.string().optional(),
  })
});

export const submitFeedbackSchema = z.object({
  rating: z.coerce.number({ message: "A valid star rating between 1 and 5 is required." })
    .min(1, "A valid star rating between 1 and 5 is required.")
    .max(5, "A valid star rating between 1 and 5 is required."),
  feedbackText: z.string().optional(),
});
