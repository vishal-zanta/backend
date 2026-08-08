export class HealthDepartmentService {
  
  static async getAuthToken(): Promise<string> {
    console.log(`[HealthService] Fetching fresh dynamic token...`);
    
    const params = new URLSearchParams();
    params.append('username', 'CRM');
    params.append('password', process.env.HEALTH_PASS || '');
    params.append('userType', 'EMPLOYEE');
    params.append('tenantId', 'bh.health');
    params.append('scope', 'read');
    params.append('grant_type', 'password');

    try {
      const response = await fetch('http://bihargrhelp.piramalswasthya.org/user/oauth/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': 'Basic ZWdvdi11c2VyLWNsaWVudDo=' // Common base64 for eGov if client auth is needed
        },
        body: params
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Auth failed with status ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      return data.access_token;
    } catch (error) {
      console.error("[HealthService] Auth Error:", error);
      throw error;
    }
  }

  static async createGrievance(payload: any, token: string): Promise<{ complaintId: string, mobile: string, status: string }> {
    const mappedPayload = {
      "workflow": {
        "action": "APPLY_BY_HELPDESK"
      },
      "RequestInfo": {
        "apiId": "Rainmaker",
        "authToken": token,
        "userInfo": {
          "id": 12307,
          "uuid": "1c8d5ca3-4cca-4e03-a902-437e1dd6d49a",
          "userName": "CRM",
          "name": "Sachine Kumar Yadav",
          "mobileNumber": "8826676167",
          "gender": "MALE",
          "emailId": "sachine.yadav@iccs.in",
          "locale": null,
          "type": "EMPLOYEE",
          "roles": [
            { "name": "HelpDesk", "code": "HELPDESK", "tenantId": "bh.health" },
            { "name": "Employee", "code": "EMPLOYEE", "tenantId": "bh.health" },
            { "name": "State Administrator", "code": "STADMIN", "tenantId": "bh.health" }
          ]
        }
      },
      "service": {...payload,"additionalDetail": {},
        "source": "web",}
    };

    console.log(`[HealthService] Sending payload:`, JSON.stringify(mappedPayload));

    try {
      const response = await fetch('http://bihargrhelp.piramalswasthya.org/pgr-services/v2/request/_create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(mappedPayload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Create ticket failed with status ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      
      const serviceData = data?.ServiceWrappers?.[0]?.service;
      if (!serviceData || !serviceData.serviceRequestId) {
        throw new Error("Invalid response format from Health Department API");
      }

      return {
        complaintId: serviceData.serviceRequestId,
        mobile: serviceData.citizen?.mobileNumber || payload?.citizen?.mobileNumber,
        status: serviceData.applicationStatus || "OPEN"
      };
    } catch (error) {
      console.error("[HealthService] Create Grievance Error:", error);
      throw error;
    }
  }

  static async getStatus(complaintId: string, token: string): Promise<string> {
    const response = await fetch(`http://bihargrhelp.piramalswasthya.org/pgr-services/v2/request/_search?tenantId=bh.health&serviceRequestId=${complaintId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        "RequestInfo": {
          "apiId": "Rainmaker",
          "authToken": token,
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Get status failed with status ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    
    const serviceData = data?.ServiceWrappers?.[0]?.service;
    if (!serviceData || !serviceData.applicationStatus) {
      console.warn(`[HealthService] Invalid or empty response for status check of ${complaintId}`);
      return "UNKNOWN";
    }

    return serviceData.applicationStatus;
  }

  static async getDistrictData(): Promise<any> {
    try {
      const response = await fetch('http://bihargrhelp.piramalswasthya.org/egov-mdms-service/v1/_search?tenantId=bh.health', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
    "MdmsCriteria": {
        "tenantId": "bh.health",
        "moduleDetails": [
            {
                "moduleName": "egov-location",
                "masterDetails": [
                    {
                        "name": "TenantBoundary"
                    }
                ]
            }
        ]
    },
    "RequestInfo": {
        "apiId": "Rainmaker",
        "msgId": "1785999777994|en_IN"
    }
})
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Get district data failed with status ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      return data ;
    } catch (error) {
      console.error("[HealthService] Get District Data Error:", error);
      throw error;
    }

  }
  
  static async getMasterData(): Promise<any> {
    try {
      const response = await fetch('http://bihargrhelp.piramalswasthya.org/egov-mdms-service/v1/_search?tenantId=bh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
    "MdmsCriteria": {
        "tenantId": "bh",
        "moduleDetails": [
            {
                "moduleName": "common-masters",
                "masterDetails": [
                    {
                        "name": "GenderType"
                    },
                    {
                        "name": "ComplainantType"
                    },
                    {
                        "name": "InstitutionType"
                    },
                    {
                        "name": "InstitutionName"
                    }
                ]
            },
            {
                "moduleName": "RAINMAKER-PGR",
                "masterDetails": [
                    {
                        "name": "ServiceDefs"
                    },
                    {
                        "name": "GrievanceType"
                    },
                    {
                        "name": "GrievanceSubType"
                    }
                ]
            }
        ]
    },
    "RequestInfo": {
        "apiId": "Rainmaker",
        "msgId": "1786000572894|en_IN"
    }
})
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Get master data failed with status ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      return data?.MdmsRes || {};
    } catch (error) {
      console.error("[HealthService] Get Master Data Error:", error);
      throw error;
    }

  }


    }
