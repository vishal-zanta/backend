import axios, { AxiosError } from 'axios';

const FOOD_API_BASE_URL = 'http://183.82.101.100/Bihar4GGrievanceServer';
const USERNAME = '4GID-BIHARCMOFFICE';
const PIN = '9b7a0d487b0abd27e851f1b3cbe1a4ec6984df4c6093b464b10b5190245b63ad';

const foodAxios = axios.create({
  baseURL: FOOD_API_BASE_URL,
  timeout: 10000,
});

foodAxios.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    console.error(`[FoodAxios] Request failed - ${error.config?.url}:`, error.message);
    return Promise.reject(error);
  }
);

export class FoodDepartmentService {
  /**
   * Create Grievance at Food & Consumer Protection Department
   */
  static async createGrievance(payload: any): Promise<{ complaintId: string; mobile: string; status: string }> {
    console.log(`[FoodService] Registering grievance...`);
    try {
      // payload comes from the frontend or internal system, we map it to Food Dept format
      const foodPayload = {
        categoryId: payload.categoryId || 101,
        typeId: payload.typeId || 22,
        name: payload.complainant?.name || payload.name || "Citizen",
        stateId: payload.stateId || 10,
        districtId: payload.location?.districtCode || payload.districtId || 1001,
        blockId: payload.location?.blockCode || payload.blockId || 100101,
        panchayatId: payload.location?.panchayatCode || payload.panchayatId || "10010101",
        villageId: payload.location?.villageCode || payload.villageId || "1001010101",
        address: payload.complainant?.address || payload.address || "Bihar",
        mobileNo: payload.complainant?.mobile || payload.mobileNo || 9999999999,
        grievancesDescription: payload.complaint || payload.grievancesDescription || "No description provided",
        createdBy: payload.createdBy || "12345",
        status: payload.status || "P",
        //  username: USERNAME,
        // pin: PIN
      };

      const { data } = await foodAxios.post('/grievanceRegistration', foodPayload);

      // Expected response: { resultDescription: "Success", resultcode: "200", grievanceID: "GRV-...", data: {...} }
      if (data?.resultcode !== "200" || !data?.grievanceID) {
        throw new Error(`Failed to create Food Dept grievance: ${data?.resultDescription || JSON.stringify(data)}`);
      }

      return {
        complaintId: data.grievanceID,
        mobile: String(foodPayload.mobileNo),
        status: data.data?.status || 'P',
      };
    } catch (error: any) {
      console.error('[FoodService] Create Grievance Error:', error?.message);
      throw error;
    }
  }

  /**
   * Get Grievance Details / Status from Food & Consumer Protection Department
   */
  static async getStatus(grievanceID: string): Promise<string> {
    console.log(`[FoodService] Fetching status for ${grievanceID}`);
    try {
      const { data } = await foodAxios.post('/getGrievanceDetails', {
        username: USERNAME,
        pin: PIN,
        grievanceID
      });

      if (!data || !data.status) {
        console.warn(`[FoodService] Invalid status response for ${grievanceID}`);
        return 'UNKNOWN';
      }

      // Typically status might be "P" (Pending), "R" (Resolved), etc.
      // Returning raw status or mapping it to our system's status
      const extStatus = data.status;
      if (extStatus === 'P') return 'PENDING';
      if (extStatus === 'R') return 'RESOLVED';
      if (extStatus === 'C') return 'CLOSED';
      return extStatus;
      
    } catch (error: any) {
      console.error('[FoodService] Get Status Error:', error?.message);
      throw error;
    }
  }
}
