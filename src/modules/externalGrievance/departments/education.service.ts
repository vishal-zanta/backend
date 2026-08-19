import axios, { AxiosInstance, AxiosError } from 'axios';

// ---------------------------------------------------------------------------
// Axios instance – single shared client for all Education (Call-Connect) APIs
// ---------------------------------------------------------------------------
const BASE_URL = 'https://call-connect.codebuckets.in/api/v1';

const educationAxios: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 30_000,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
});

// Attach API key & secret from env on every request
educationAxios.interceptors.request.use((config) => {
  config.headers['x-api-key'] = process.env.EDUCATION_API_KEY || '';
  config.headers['x-api-secret'] = process.env.EDUCATION_API_SECRET || '';
  return config;
});

// Centralised error logging
educationAxios.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const status = error.response?.status;
    const data = error.response?.data;
    console.error(
      `[EducationAxios] Request failed – ${error.config?.method?.toUpperCase()} ${error.config?.url} | Status: ${status}`,
      data,
    );
    return Promise.reject(error);
  },
);

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export interface EducationCreateGrievancePayload {
  externalRef: string;
  type: string;
  categoryId: number;
  categoryOther?: string;
  complaint: string;
  complainant: {
    name: string;
    mobile: string;
    shareNumberWithOfficer?: boolean;
  };
  location: {
    districtCode: number;
    blockCode?: number;
    clusterCode?: number;
    panchayatCode?: number;
    villageCode?: number;
    schoolCode?: number;
    teacherCode?: number;
  };
  accused?: {
    name?: string;
    designation?: string;
  };
  source: string;
  registeredAt: string;
}

export interface EducationGrievanceResponse {
  grievanceId: string;
  internalId: number;
  externalRef: string;
  type: string;
  status: string;
  statusDescription: string;
  statusLabel: string;
  isClosed: boolean;
  category: {
    id: number;
    name: string;
    type: string;
    subType: string;
    other: string;
  };
  complaint: string;
  complainant: {
    name: string;
    mobile: string;
    shareNumberWithOfficer: boolean;
  };
  accused: {
    name: string;
    designation: string;
  };
  location: Record<string, { code: number; name: string }>;
  assignedOfficer?: {
    designation: string;
    name: string;
    mobile: string;
    district: string;
    block: string;
    assignedAt: string;
  };
  sla?: {
    slaHours: number;
    startedAt: string;
    dueAt: string;
    slaStatus: string;
    hoursRemaining: number;
    breached: boolean;
  };
  source: string;
  registeredAt: string;
  lastActionAt: string;
  lastActionBy: string;
  interactions: Array<{
    id: number;
    at: string;
    status: string;
    statusLabel: string;
    by: string;
    actor: string;
    remarks: string;
    feedbackResponse: string;
    genuine: boolean;
    source: string;
    attachmentUrl: string;
  }>;
}

// Master data endpoint types accepted by the unified helper
export type EducationMasterType =
  | 'categories'
  | 'districts'
  | 'blocks'
  | 'panchayats'
  | 'villages'
  | 'schools'
  | 'statuses'
  | 'sources';

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------
export class EducationDepartmentService {

  // ── Create Grievance ────────────────────────────────────────────────
  static async createGrievance(
    payload: EducationCreateGrievancePayload,
  ): Promise<{ complaintId: string; mobile: string; status: string }> {
    console.log(`[EducationService] Creating grievance – externalRef: ${payload.externalRef}`);

    try {
      const { data } = await educationAxios.post('/integration/grievance', payload);

      if (data?.status !== 'success' || !data?.data?.grievanceId) {
        throw new Error(
          `Unexpected response from Education create API: ${JSON.stringify(data)}`,
        );
      }

      const grievance: EducationGrievanceResponse = data.data;

      return {
        complaintId: grievance.grievanceId,
        mobile: payload.complainant.mobile,
        status: grievance.status || 'REGISTERED',
      };
    } catch (error: any) {
      console.error('[EducationService] Create Grievance Error:', error?.message);
      throw error;
    }
  }

  // ── Get Status ──────────────────────────────────────────────────────
  static async getStatus(grievanceId: string): Promise<string> {
    console.log(`[EducationService] Fetching status for ${grievanceId}`);

    try {
      const { data } = await educationAxios.get(
        `/integration/grievance/${grievanceId}`,
      );

      if (data?.status !== 'success' || !data?.data) {
        console.warn(
          `[EducationService] Invalid or empty response for status check of ${grievanceId}`,
        );
        return 'UNKNOWN';
      }

      return data.data.status || 'UNKNOWN';
    } catch (error: any) {
      console.error('[EducationService] Get Status Error:', error?.message);
      throw error;
    }
  }

  // ── Get Full Grievance Detail ───────────────────────────────────────
  static async getGrievanceDetail(
    grievanceId: string,
  ): Promise<EducationGrievanceResponse | null> {
    console.log(`[EducationService] Fetching full detail for ${grievanceId}`);

    try {
      const { data } = await educationAxios.get(
        `/integration/grievance/${grievanceId}`,
      );

      if (data?.status !== 'success' || !data?.data) {
        return null;
      }

      return data.data as EducationGrievanceResponse;
    } catch (error: any) {
      console.error('[EducationService] Get Grievance Detail Error:', error?.message);
      throw error;
    }
  }

  // ── Master Data (unified) ──────────────────────────────────────────
  /**
   * Single method for all master-data endpoints.
   * Pass a `type` to hit the corresponding `/masters/<type>` endpoint.
   *
   * Accepted types: categories | districts | blocks | panchayats |
   *                 villages | schools | statuses | sources
   *
   * Optional `params` are forwarded as query-string parameters
   * (e.g. `{ districtCode: 1007 }` for blocks).
   */
  static async getMasterData(
    type: EducationMasterType,
    params?: Record<string, string | number>,
  ): Promise<any> {
    console.log(`[EducationService] Fetching master data – type: ${type}`, params || '');

    try {
      const { data } = await educationAxios.get(`/integration/masters/${type}`, { params });

      if (data?.status !== 'success') {
        throw new Error(
          `Unexpected response from Education /masters/${type}: ${JSON.stringify(data)}`,
        );
      }

      return data.data ?? data;
    } catch (error: any) {
      console.error(`[EducationService] Get Master Data (${type}) Error:`, error?.message);
      throw error;
    }
  }
}
