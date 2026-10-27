export type SmsLanguage = "en" | "hi";

export type OtpSmsType = "otp";

export type CitizenSmsType =
  | "grievance_register"
  | "grievance_assign"
  | "grievance_atr"
  | "grievance_resolved"
  | "grievance_closure"
  | "grievance_reopened"
  | "grievance_rejected";

export type InternalOfficerSmsType = "officer_assign" | "sla_warning";

export type SmsNotificationType = OtpSmsType | CitizenSmsType | InternalOfficerSmsType;

export interface SmsPayload {
  to: string;
  type: SmsNotificationType;
  language?: SmsLanguage;
  vars: Record<string, string | number>;
}

export interface SmsJobData extends SmsPayload {
  category: "otp" | "citizen" | "internal";
  logId?: string;
  retries?: number;
}
