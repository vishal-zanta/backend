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
        categoryId: Number(payload.categoryId ),
        typeId: Number(payload.typeId ),
        name: String( payload.name ),
        stateId: Number(payload.stateId),
        districtId: Number( payload.districtId),
        blockId: Number( payload.blockId ),
        panchayatId: String(payload.panchayatId ),
        villageId: String( payload.villageId ),
        address: String(payload.address),
        mobileNo: String( payload.mobileNo ),
        grievancesDescription: String( payload.grievancesDescription ),
        createdBy: String(payload.createdBy || "1")
      };

      const { data } = await foodAxios.post('/grievanceRegistration', foodPayload);

      // Expected response: { resultDescription: "Success", resultcode: "200", grievanceID: "GRV-...", data: {...}, assignTo: "...", status: "REGISTERED" }
      if (data?.resultcode !== "200" || !data?.grievanceID) {
        throw new Error(`Failed to create Food Dept grievance: ${data?.resultDescription || JSON.stringify(data)}`);
      }

      return {
        complaintId: data.grievanceID,
        mobile: String(foodPayload.mobileNo),
        status: data.status || 'REGISTERED',
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

      console.log(JSON.stringify(data));

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
  static async uploadFiles(grievanceId: string, files: Express.Multer.File[]): Promise<any> {
    console.log(`[FoodService] Uploading files for ${grievanceId}`);
    try {
      const formData = new FormData();
      files.forEach((file, index) => {
        const blob = new Blob([new Uint8Array(file.buffer)], { type: file.mimetype });
        formData.append(`file${index + 1}`, blob as any, file.originalname);
      });
      const { data } = await foodAxios.post(`/grievances/${grievanceId}/files`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return data;
    } catch (error: any) {
      console.error('[FoodService] Upload Files Error:', error?.message);
      throw error;
    }
  }

  static async getTypes(): Promise<any> {
    const { data } = await foodAxios.get('/masters/types');
    return data;
  }

  static async getCategories(): Promise<any> {
    const { data } = await foodAxios.get('/masters/categories');
    return data;
  }

  static async getStates(): Promise<any> {
    const { data } = await foodAxios.get('/masters/states');
    return data;
  }

  static async getDistricts(stateId: string): Promise<any> {
    const { data } = await foodAxios.get(`/masters/districts?state_id=${stateId}`);
    return data;
  }

  static async getBlocks(districtId: string): Promise<any> {
    const { data } = await foodAxios.get(`/masters/blocks?district_id=${districtId}`);
    return data;
  }

  static async getPanchayats(blockId: string): Promise<any> {
    const { data } = await foodAxios.get(`/masters/panchayats?block_id=${blockId}`);
    return data;
  }

  static async getVillages(panchayatId: string): Promise<any> {
    const { data } = await foodAxios.get(`/masters/villages?panchayat_id=${panchayatId}`);
    return data;
  }
}
