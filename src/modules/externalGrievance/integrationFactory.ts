import { HealthDepartmentService } from "./departments/health.service.js";

export class ExternalIntegrationService {
  
  // In-memory cache to store tokens per department
  static tokenCache: Record<string, string> = {};

  /**
   * Get an auth token based on the department.
   */
  static async getAuthToken(departmentCode: string, forceRefresh = false): Promise<string> {
    if (!forceRefresh && this.tokenCache[departmentCode]) {
      return this.tokenCache[departmentCode];
    }

    if (departmentCode === "HEALTH") {
      this.tokenCache[departmentCode] = await HealthDepartmentService.getAuthToken();
      return this.tokenCache[departmentCode];
    } 
    else if (departmentCode === "EDUCATION") {
      console.log(`[IntegrationService] Using static token for EDUCATION...`);
      this.tokenCache[departmentCode] = "mock-edu-api-key-456";
      return this.tokenCache[departmentCode];
    }
    
    throw new Error(`No auth configuration for ${departmentCode}`);
  }

  /**
   * Internal method to execute the payload mapping and external API call
   * Returns { complaintId, mobile, status }
   */
  private static async executeApiCall(departmentCode: string, payload: any, token: string): Promise<{ complaintId: string, mobile: string, status: string }> {
    if (departmentCode === "HEALTH") {
      return await HealthDepartmentService.createGrievance(payload, token);
    } 
    else if (departmentCode === "EDUCATION") {
      const mappedPayload = {
        complaint_data: payload,
        source: "CRM"
      };
      
      await new Promise(resolve => setTimeout(resolve, 200));
      const externalId = `EDU-${Math.floor(Math.random() * 90000) + 10000}`;
      
      console.log(`[IntegrationService] Payload Sent:`, JSON.stringify(mappedPayload));
      return {
        complaintId: externalId,
        mobile: payload.mobile, // Assuming payload has mobile
        status: "OPEN"
      };
    } 
    else {
      throw new Error(`No integration setup for ${departmentCode}`);
    }
  }

  /**
   * Push a new grievance payload directly to the external department API
   */
  static async createExternalTicket(departmentCode: string, payload: any): Promise<{ complaintId: string, mobile: string, status: string }> {
    try {
      let token = await this.getAuthToken(departmentCode);
      
      try {
        console.log(`[IntegrationService] Pushing ticket to ${departmentCode} with cached token...`);
        return await this.executeApiCall(departmentCode, payload, token);
      } catch (error: any) {
        // If the API call fails because of an expired token (e.g., 401 or specific message)
        if (error?.message === "UNAUTHORIZED" || error?.response?.status === 401 || true) {
          console.log(`[IntegrationService] Token likely expired. Refreshing token and retrying...`);
          // Force refresh the token
          token = await this.getAuthToken(departmentCode, true);
          // Retry exactly once
          return await this.executeApiCall(departmentCode, payload, token);
        }
        throw error;
      }

    } catch (error: any) {
      console.error(`[IntegrationService] Failed to push to ${departmentCode}:`, error?.message);
      throw new Error(`External API Error: ${error?.message || "Failed to create ticket"}`);
    }
  }

  /**
   * Fetch the latest status from the external department API
   */
  static async fetchExternalStatus(departmentCode: string, externalComplaintId: string): Promise<string | null> {
    if (!externalComplaintId) return null;

    try {
      if (departmentCode === "HEALTH") {
        const token = await this.getAuthToken(departmentCode);
        return await HealthDepartmentService.getStatus(externalComplaintId, token);
      } 
      else if (departmentCode === "EDUCATION") {
        return "RESOLVED";
      }
      return null;
    } catch (error: any) {
      console.error(`[IntegrationService] Failed to fetch status for ${externalComplaintId}:`, error?.message);
      return null;
    }
  }

  /**
   * Fetch master data for a specific department
   */
  static async fetchMasterData(departmentCode: string): Promise<any> {
    if (departmentCode === "HEALTH") {
      return await HealthDepartmentService.getMasterData();
    }
    throw new Error(`Master data not configured for department: ${departmentCode}`);
  }

  /**
   * Fetch district data for a specific department
   */
  static async fetchDistrictData(departmentCode: string): Promise<any> {
    if (departmentCode === "HEALTH") {
      return await HealthDepartmentService.getDistrictData();
    }
    throw new Error(`District data not configured for department: ${departmentCode}`);
  }
}

