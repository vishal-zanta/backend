import { ExternalMasterData } from "./externalMasterData.model.js";
import { ExternalIntegrationService } from "./integrationFactory.js";

// Built-in fallback seeds for non-sequential data when external platform is unreachable
const DEFAULT_FALLBACKS: Record<string, Record<string, any>> = {
  HEALTH: {
    master: {
      "common-masters": {
        InstitutionType: [
          { name: "Primary Health Centre (PHC)", active: true },
          { name: "Community Health Centre (CHC)", active: true },
          { name: "District Hospital", active: true },
          { name: "Sub-Divisional Hospital", active: true },
          { name: "Referral Hospital", active: true },
          { name: "Health Sub Centre", active: true },
          { name: "Medical College Hospital", active: true }
        ],
        InstitutionName: [
          { name: "Patna Medical College Hospital", active: true },
          { name: "Nalanda Medical College Hospital", active: true },
          { name: "District Hospital Gaya", active: true },
          { name: "District Hospital Muzaffarpur", active: true },
          { name: "District Hospital Bhagalpur", active: true }
        ],
        GenderType: [
          { name: "Male", code: "MALE", active: true },
          { name: "Female", code: "FEMALE", active: true },
          { name: "Transgender", code: "TRANSGENDER", active: true }
        ],
        ComplainantType: [
          { name: "Citizen", active: true },
          { name: "Patient", active: true },
          { name: "Attendant / Relative", active: true },
          { name: "Health Worker", active: true }
        ]
      },
      "RAINMAKER-PGR": {
        ServiceDefs: [
          { name: "Doctor Absenteeism", serviceCode: "DOC_ABSENT", active: true },
          { name: "Medicine Shortage / Unavailability", serviceCode: "MED_UNAVAIL", active: true },
          { name: "Ambulance Delay / Denial", serviceCode: "AMB_DELAY", active: true },
          { name: "Misbehaviour by Staff", serviceCode: "STAFF_MISBEHAVE", active: true },
          { name: "Denial of Admission / Treatment", serviceCode: "DENIAL_TREAT", active: true },
          { name: "Hospital Cleanliness / Hygiene Issue", serviceCode: "CLEAN_ISSUE", active: true },
          { name: "Corruption / Illegal Demands", serviceCode: "CORRUPTION", active: true },
          { name: "Diagnostic Test Not Done", serviceCode: "TEST_NOT_DONE", active: true },
          { name: "Other Health Issues", serviceCode: "OTHER_HEALTH", active: true }
        ]
      }
    },
    district_data: {
      MdmsRes: {
        "egov-location": {
          TenantBoundary: [
            {},
            {
              boundary: {
                children: [
                  {
                    name: "Patna Division",
                    code: "PATNA_DIV",
                    children: [
                      { name: "Patna", children: [] },
                      { name: "Nalanda", children: [] },
                      { name: "Bhojpur", children: [] },
                      { name: "Buxar", children: [] },
                      { name: "Rohtas", children: [] },
                      { name: "Kaimur", children: [] }
                    ]
                  },
                  {
                    name: "Tirhut Division",
                    code: "TIRHUT_DIV",
                    children: [
                      { name: "Muzaffarpur", children: [] },
                      { name: "East Champaran", children: [] },
                      { name: "West Champaran", children: [] },
                      { name: "Sitamarhi", children: [] },
                      { name: "Sheohar", children: [] },
                      { name: "Vaishali", children: [] }
                    ]
                  },
                  {
                    name: "Magadh Division",
                    code: "MAGADH_DIV",
                    children: [
                      { name: "Gaya", children: [] },
                      { name: "Nawada", children: [] },
                      { name: "Aurangabad", children: [] },
                      { name: "Jehanabad", children: [] },
                      { name: "Arwal", children: [] }
                    ]
                  }
                ]
              }
            }
          ]
        }
      }
    }
  },
  FOOD: {
    types: [
      { typeId: 321, typeName: "Consumer Related Issues" },
      { typeId: 322, typeName: "Dealer Related Issues" },
      { typeId: 323, typeName: "Transporter Related Issues" },
      { typeId: 324, typeName: "Procurement Related Issues" },
      { typeId: 325, typeName: "Other Issues" }
    ],
    states: {
      resultCode: "200",
      resultDescription: "Success",
      data: [{ id: "10", name: "Bihar" }]
    }
  }
};

export class ExternalMasterDataService {
  /**
   * Helper to construct subKey string from query params
   */
  private static buildSubKey(params?: Record<string, string | number>): string {
    if (!params || Object.keys(params).length === 0) return "";
    return Object.entries(params)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}=${v}`)
      .join("&");
  }

  /**
   * Fetch master data with database caching and seamless offline fallback
   */
  static async getMasterData(
    departmentCode: string,
    type?: string,
    queryParams?: Record<string, string | number>
  ): Promise<any> {
    const dept = departmentCode.toUpperCase();
    const dataType = type || (dept === "HEALTH" ? "master" : "categories");
    const subKey = this.buildSubKey(queryParams);

    // 1. Try to fetch live data from the external department API
    try {
      const liveData = await ExternalIntegrationService.fetchMasterData(dept, type, queryParams);
      if (liveData) {
        // Cache/upsert into local DB asynchronously without blocking
        ExternalMasterData.findOneAndUpdate(
          { departmentCode: dept, dataType, subKey },
          {
            departmentCode: dept,
            dataType,
            subKey,
            data: liveData,
            lastSyncedAt: new Date(),
            isStatic: !subKey
          },
          { upsert: true, returnDocument: 'after' }
        ).catch((err) => console.warn(`[MasterDataService] Cache save error for ${dept}-${dataType}:`, err?.message));

        return liveData;
      }
    } catch (apiError: any) {
      console.warn(
        `[MasterDataService] External API unavailable for ${dept} (${dataType}). Checking local database cache:`,
        apiError?.message
      );
    }

    // 2. Fallback to cached data in local database
    const cached = await ExternalMasterData.findOne({
      departmentCode: dept,
      dataType,
      subKey
    }).lean();

    if (cached && cached.data) {
      console.log(`[MasterDataService] Returning cached master data for ${dept} (${dataType})`);
      return cached.data;
    }

    // 3. Fallback to built-in default seed if available
    const fallback = DEFAULT_FALLBACKS[dept]?.[dataType];
    if (fallback) {
      console.log(`[MasterDataService] Returning default static fallback for ${dept} (${dataType})`);
      return fallback;
    }

    throw new Error(
      `Master data for ${dept} (${dataType}) is temporarily unavailable and not yet cached locally.`
    );
  }

  /**
   * Fetch district data with database caching and offline fallback
   */
  static async getDistrictData(departmentCode: string): Promise<any> {
    const dept = departmentCode.toUpperCase();
    const dataType = "district_data";

    // 1. Try live external API
    try {
      const liveData = await ExternalIntegrationService.fetchDistrictData(dept);
      if (liveData) {
        ExternalMasterData.findOneAndUpdate(
          { departmentCode: dept, dataType, subKey: "" },
          {
            departmentCode: dept,
            dataType,
            subKey: "",
            data: liveData,
            lastSyncedAt: new Date(),
            isStatic: true
          },
          { upsert: true, returnDocument: 'after' }
        ).catch((err) => console.warn(`[MasterDataService] District cache save error for ${dept}:`, err?.message));

        return liveData;
      }
    } catch (apiError: any) {
      console.warn(
        `[MasterDataService] External District API unavailable for ${dept}. Checking local database cache:`,
        apiError?.message
      );
    }

    // 2. Fallback to cached database record
    const cached = await ExternalMasterData.findOne({
      departmentCode: dept,
      dataType,
      subKey: ""
    }).lean();

    if (cached && cached.data) {
      console.log(`[MasterDataService] Returning cached district data for ${dept}`);
      return cached.data;
    }

    // 3. Built-in fallback
    const fallback = DEFAULT_FALLBACKS[dept]?.[dataType];
    if (fallback) {
      return fallback;
    }

    throw new Error(`District data for ${dept} is temporarily unavailable.`);
  }

  /**
   * Sync and cache all static/standalone master data for all external departments
   */
  static async syncAllStaticData(): Promise<{ synced: string[]; errors: string[] }> {
    const synced: string[] = [];
    const errors: string[] = [];

    const tasks: Array<{ dept: string; type?: string; subKey?: string; isDistrict?: boolean }> = [
      // Health
      { dept: "HEALTH", type: "master" },
      { dept: "HEALTH", isDistrict: true },
      // Education
      { dept: "EDUCATION", type: "categories" },
      { dept: "EDUCATION", type: "districts" },
      { dept: "EDUCATION", type: "statuses" },
      { dept: "EDUCATION", type: "sources" },
      { dept: "EDUCATION", isDistrict: true },
      // Food
      { dept: "FOOD", type: "types" },
      { dept: "FOOD", type: "categories" },
      { dept: "FOOD", type: "states" },
      { dept: "FOOD", isDistrict: true }
    ];

    for (const task of tasks) {
      try {
        if (task.isDistrict) {
          const data = await ExternalIntegrationService.fetchDistrictData(task.dept);
          await ExternalMasterData.findOneAndUpdate(
            { departmentCode: task.dept, dataType: "district_data", subKey: "" },
            { departmentCode: task.dept, dataType: "district_data", subKey: "", data, lastSyncedAt: new Date(), isStatic: true },
            { upsert: true, returnDocument: 'after' }
          );
          synced.push(`${task.dept}:district_data`);
        } else if (task.type) {
          const data = await ExternalIntegrationService.fetchMasterData(task.dept, task.type);
          await ExternalMasterData.findOneAndUpdate(
            { departmentCode: task.dept, dataType: task.type, subKey: "" },
            { departmentCode: task.dept, dataType: task.type, subKey: "", data, lastSyncedAt: new Date(), isStatic: true },
            { upsert: true, returnDocument: 'after' }
          );
          synced.push(`${task.dept}:${task.type}`);
        }
      } catch (err: any) {
        errors.push(`${task.dept}:${task.type || "district"}: ${err?.message}`);
        // Ensure default fallback is present in DB if external is down
        const fallback = task.isDistrict
          ? DEFAULT_FALLBACKS[task.dept]?.["district_data"]
          : DEFAULT_FALLBACKS[task.dept]?.[task.type || ""];
        if (fallback) {
          await ExternalMasterData.findOneAndUpdate(
            { departmentCode: task.dept, dataType: task.isDistrict ? "district_data" : task.type!, subKey: "" },
            { departmentCode: task.dept, dataType: task.isDistrict ? "district_data" : task.type!, subKey: "", data: fallback, lastSyncedAt: new Date(), isStatic: true },
            { upsert: true, returnDocument: 'after' }
          );
        }
      }
    }

    return { synced, errors };
  }
}
