import { HealthDepartmentService } from "./departments/health.service.js";
import { EducationDepartmentService } from "./departments/education.service.js";

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
      // Education uses static API key/secret via axios interceptors – no dynamic token needed
      console.log(`[IntegrationService] Education uses static API key auth, no token exchange required.`);
      this.tokenCache[departmentCode] = "education-static-key";
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
      return await EducationDepartmentService.createGrievance(payload);
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
        return await EducationDepartmentService.getStatus(externalComplaintId);
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
  static async fetchMasterData(departmentCode: string, type?: string, params?: Record<string, string | number>): Promise<any> {
    if (departmentCode === "HEALTH") {
      return await HealthDepartmentService.getMasterData();
    }
    if (departmentCode === "EDUCATION") {
      const masterType = (type || 'categories') as any;
      return await EducationDepartmentService.getMasterData(masterType, params);
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
    if (departmentCode === "EDUCATION") {
      return await EducationDepartmentService.getMasterData('districts');
    }
    throw new Error(`District data not configured for department: ${departmentCode}`);
  }
}
