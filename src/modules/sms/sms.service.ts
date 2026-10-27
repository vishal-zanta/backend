import {
  enqueueOtpSms,
  enqueueCitizenSms,
  enqueueInternalSms,
} from "./sms.queue.js";
import {
  SmsPayload,
  InternalOfficerSmsType,
  SmsLanguage,
} from "./sms.types.js";
import { Citizen } from "../citizen/citizen.model.js";
import { User } from "../users/user.model.js";

/**
 * Service providing high-level helper methods to trigger SMS notifications.
 * Automatically checks and honors the preferred language of the Citizen or User (Officer).
 */
export class SmsService {
  /**
   * Helper to normalize language string to supported "en" | "hi"
   */
  static normalizeLanguage(lang?: string | null): SmsLanguage {
    if (!lang) return "en";
    const clean = lang.trim().toLowerCase();
    if (clean.includes("hi") || clean.includes("hindi")) {
      return "hi";
    }
    return "en";
  }

  /**
   * Resolve language for a citizen:
   * 1. Check explicit language argument
   * 2. Lookup Citizen model by mobile/ID
   */
  static async resolveCitizenLanguage(
    citizenIdentifier: string,
    explicitLanguage?: SmsLanguage
  ): Promise<SmsLanguage> {
    if (explicitLanguage) return explicitLanguage;

    try {
      const mobileClean = citizenIdentifier.slice(-10);
      const citizen = await Citizen.findOne({
        $or: [
          { mobile: new RegExp(`${mobileClean}$`) },
          { _id: citizenIdentifier.length === 24 ? citizenIdentifier : null },
        ],
      })
        .select("preferredLanguage")
        .lean();

      if (citizen?.preferredLanguage) {
        return this.normalizeLanguage(citizen.preferredLanguage);
      }
    } catch {
      // Fallback
    }

    return "en";
  }

  /**
   * Resolve language for an internal user/officer:
   * 1. Check explicit language argument
   * 2. Lookup User model by ID or phone
   */
  static async resolveUserLanguage(
    userIdentifier: string,
    explicitLanguage?: SmsLanguage
  ): Promise<SmsLanguage> {
    if (explicitLanguage) return explicitLanguage;

    try {
      const phoneClean = userIdentifier.slice(-10);
      const user = await User.findOne({
        $or: [
          { phone: new RegExp(`${phoneClean}$`) },
          { _id: userIdentifier.length === 24 ? userIdentifier : null },
        ],
      })
        .select("preferredLanguages")
        .lean();

      if (user?.preferredLanguages && user.preferredLanguages.length > 0) {
        return this.normalizeLanguage(user.preferredLanguages[0]);
      }
    } catch {
      // Fallback
    }

    return "en";
  }

  /**
   * Send OTP Authentication SMS (High Priority)
   */
  static async sendOtp(
    to: string,
    otp: string | number,
    language?: SmsLanguage
  ): Promise<void> {
    const finalLang = await this.resolveCitizenLanguage(to, language);

    await enqueueOtpSms({
      to,
      language: finalLang,
      vars: {
        OTP: String(otp),
      },
    });
  }

  /**
   * Send Citizen Grievance Registration SMS
   */
  static async sendGrievanceRegistered(
    to: string,
    grievanceId: string,
    language?: SmsLanguage
  ): Promise<void> {
    const finalLang = await this.resolveCitizenLanguage(to, language);

    await enqueueCitizenSms({
      to,
      type: "grievance_register",
      language: finalLang,
      vars: {
        GRIEVANCE_ID: grievanceId,
      },
    });
  }

  /**
   * Send Citizen Grievance Assignment SMS
   */
  static async sendGrievanceAssigned(
    to: string,
    grievanceId: string,
    language?: SmsLanguage
  ): Promise<void> {
    const finalLang = await this.resolveCitizenLanguage(to, language);

    await enqueueCitizenSms({
      to,
      type: "grievance_assign",
      language: finalLang,
      vars: {
        GRIEVANCE_ID: grievanceId,
      },
    });
  }

  /**
   * Send Action Taken Report (ATR) Update SMS
   */
  static async sendAtrUpdate(
    to: string,
    grievanceId: string,
    status: string,
    language?: SmsLanguage
  ): Promise<void> {
    const finalLang = await this.resolveCitizenLanguage(to, language);

    await enqueueCitizenSms({
      to,
      type: "grievance_atr",
      language: finalLang,
      vars: {
        GRIEVANCE_ID: grievanceId,
        STATUS: status,
      },
    });
  }

  /**
   * Send Grievance Resolved & Feedback Request SMS
   */
  static async sendGrievanceResolved(
    to: string,
    grievanceId: string,
    language?: SmsLanguage
  ): Promise<void> {
    const finalLang = await this.resolveCitizenLanguage(to, language);

    await enqueueCitizenSms({
      to,
      type: "grievance_resolved",
      language: finalLang,
      vars: {
        GRIEVANCE_ID: grievanceId,
      },
    });
  }

  /**
   * Send Grievance Official Closure SMS
   */
  static async sendGrievanceClosure(
    to: string,
    grievanceId: string,
    language?: SmsLanguage
  ): Promise<void> {
    const finalLang = await this.resolveCitizenLanguage(to, language);

    await enqueueCitizenSms({
      to,
      type: "grievance_closure",
      language: finalLang,
      vars: {
        GRIEVANCE_ID: grievanceId,
      },
    });
  }

  /**
   * Send Grievance Reopened SMS
   */
  static async sendGrievanceReopened(
    to: string,
    grievanceId: string,
    language?: SmsLanguage
  ): Promise<void> {
    const finalLang = await this.resolveCitizenLanguage(to, language);

    await enqueueCitizenSms({
      to,
      type: "grievance_reopened",
      language: finalLang,
      vars: {
        GRIEVANCE_ID: grievanceId,
      },
    });
  }

  /**
   * Send Grievance Rejected SMS
   */
  static async sendGrievanceRejected(
    to: string,
    grievanceId: string,
    rejectReason: string,
    language?: SmsLanguage
  ): Promise<void> {
    const finalLang = await this.resolveCitizenLanguage(to, language);

    await enqueueCitizenSms({
      to,
      type: "grievance_rejected",
      language: finalLang,
      vars: {
        GRIEVANCE_ID: grievanceId,
        REJECT_REASON: rejectReason,
      },
    });
  }

  /**
   * Send Officer Task Assignment SMS
   */
  static async sendOfficerTaskAssigned(
    to: string,
    grievanceId: string,
    slaDeadline: string,
    language?: SmsLanguage
  ): Promise<void> {
    const finalLang = await this.resolveUserLanguage(to, language);

    await enqueueInternalSms({
      to,
      type: "officer_assign",
      language: finalLang,
      vars: {
        GRIEVANCE_ID: grievanceId,
        SLA_DEADLINE: slaDeadline,
      },
    });
  }

  /**
   * Send SLA Warning / Timeline Alert SMS to Officer
   */
  static async sendSlaWarning(
    to: string,
    grievanceId: string,
    slaDeadline: string,
    language?: SmsLanguage
  ): Promise<void> {
    const finalLang = await this.resolveUserLanguage(to, language);

    await enqueueInternalSms({
      to,
      type: "sla_warning",
      language: finalLang,
      vars: {
        GRIEVANCE_ID: grievanceId,
        SLA_DEADLINE: slaDeadline,
      },
    });
  }

  /**
   * Generic dispatcher (resolves citizen/user language automatically)
   */
  static async dispatchNotification(payload: SmsPayload): Promise<void> {
    const internalTypes: InternalOfficerSmsType[] = ["officer_assign", "sla_warning"];
    const isInternal = internalTypes.includes(payload.type as InternalOfficerSmsType);

    const resolvedLanguage = isInternal
      ? await this.resolveUserLanguage(payload.to, payload.language)
      : await this.resolveCitizenLanguage(payload.to, payload.language);

    if (payload.type === "otp") {
      await enqueueOtpSms({
        to: payload.to,
        language: resolvedLanguage,
        vars: {
          OTP: (payload.vars as any).OTP || (payload.vars as any).otp || "",
        },
      });
      return;
    }

    if (isInternal) {
      await enqueueInternalSms({
        ...payload,
        language: resolvedLanguage,
      });
      return;
    }

    await enqueueCitizenSms({
      ...payload,
      language: resolvedLanguage,
    });
  }
}
