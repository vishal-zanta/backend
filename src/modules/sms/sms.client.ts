import axios, { AxiosInstance } from "axios";
import { SmsPayload } from "./sms.types.js";

/**
 * Service to execute direct HTTP API calls to the upstream SMS Gateway.
 */
export class SmsClient {
  private static instance: AxiosInstance;

  private static getClient(): AxiosInstance {
    if (!this.instance) {
      const baseURL = process.env.SMS_BASE_URL || "http://localhost:3000";
      const apiKey = process.env.SMS_API_KEY || "";

      this.instance = axios.create({
        baseURL,
        timeout: 10000,
        headers: {
          "Content-Type": "application/json",
          ...(apiKey ? { "x-api-key": apiKey } : {}),
        },
      });
    }
    return this.instance;
  }

  /**
   * Dispatch SMS payload directly to SMS endpoint: /api/v1/sms/send
   */
  static async send(payload: SmsPayload): Promise<any> {
    const client = this.getClient();
    const formattedPayload = {
      to: payload.to,
      type: payload.type,
      language: payload.language || "en",
      vars: payload.vars,
    };

    try {
      const response = await client.post("/api/v1/sms/send", formattedPayload);
      return response.data;
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.response?.data || error.message;
      console.error(
        `[SmsClient] Failed to send SMS [${payload.type}] to ${payload.to}: ${
          typeof errorMsg === "object" ? JSON.stringify(errorMsg) : errorMsg
        }`
      );
      throw new Error(`SMS Gateway Error: ${typeof errorMsg === "object" ? JSON.stringify(errorMsg) : errorMsg}`);
    }
  }
}
