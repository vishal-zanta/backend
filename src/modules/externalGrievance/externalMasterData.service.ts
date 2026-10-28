import { ExternalMasterData } from "./externalMasterData.model.js";
import { ExternalIntegrationService } from "./integrationFactory.js";
import { TranslateService } from "../translate/translate.service.js";

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

// Cache validity duration: 7 days
export const MASTER_DATA_TTL_DAYS = 7;
export const MASTER_DATA_TTL_MS = MASTER_DATA_TTL_DAYS * 24 * 60 * 60 * 1000;

export class ExternalMasterDataService {
  /**
   * Helper to determine if cached master data is still fresh (younger than 7 days)
   */
  static isCacheValid(lastSyncedAt?: Date | null): boolean {
    if (!lastSyncedAt) return false;
    const ageMs = Date.now() - new Date(lastSyncedAt).getTime();
    return ageMs < MASTER_DATA_TTL_MS;
  }

  /**
   * Helper to construct a normalized, deterministic subKey string from query params.
   * - Filters out departmentCode, type (as they are part of primary query keys).
   * - Filters out null, undefined, empty strings.
   * - Sorts parameter keys alphabetically so { a: 1, b: 2 } matches { b: 2, a: 1 }.
   */
  static buildSubKey(params?: Record<string, any>): string {
    if (!params || typeof params !== "object") return "";

    return Object.entries(params)
      .filter(([k, v]) => {
        const lower = k.trim().toLowerCase();
        if (lower === "departmentcode" || lower === "type") return false;
        return v !== undefined && v !== null && String(v).trim() !== "";
      })
      .sort(([a], [b]) => a.trim().toLowerCase().localeCompare(b.trim().toLowerCase()))
      .map(([k, v]) => `${k.trim()}=${String(v).trim()}`)
      .join("&");
  }

  /**
   * Normalize dataType aliases across singular/plural and default types
   * e.g. source -> sources, school -> schools, category -> categories
   */
  static normalizeDataType(departmentCode: string, type?: string): string {
    const dept = departmentCode.toUpperCase();
    const raw = (type || "").trim().toLowerCase();
    if (!raw) {
      if (dept === "HEALTH") return "master";
      if (dept === "EDUCATION") return "categories";
      if (dept === "FOOD") return "types";
      return "master";
    }

    const map: Record<string, string> = {
      source: "sources",
      sources: "sources",
      school: "schools",
      schools: "schools",
      category: "categories",
      categories: "categories",
      district: "districts",
      districts: "districts",
      block: "blocks",
      blocks: "blocks",
      panchayat: "panchayats",
      panchayats: "panchayats",
      village: "villages",
      villages: "villages",
      status: "statuses",
      statuses: "statuses",
      type: "types",
      types: "types",
      state: "states",
      states: "states",
    };

    return map[raw] || raw;
  }

  /**
   * Fetch master data with database caching and 7-day renewal.
   *
   * Logic:
   * 1. Check DB for exact match on (departmentCode, dataType, queryParams/subKey).
   * 2. If present AND younger than 7 days -> Return saved DB cache directly (no external API hit).
   * 3. If NOT in DB (first time for this query) OR older than 7 days -> Fetch from external API, save to DB with lastSyncedAt, and return.
   * 4. If external API is down -> Fallback to existing stale DB cache.
   */
  static async getMasterData(
    departmentCode: string,
    type?: string,
    queryParams?: Record<string, any>
  ): Promise<any> {
    const dept = departmentCode.toUpperCase();
    const dataType = this.normalizeDataType(dept, type);
    const subKey = this.buildSubKey(queryParams);

    // 1. Search local DB cache for matching department + dataType + exact query params
    const cached = await ExternalMasterData.findOne({
      departmentCode: dept,
      dataType,
      subKey
    }).lean();

    // 2. Return from DB if present and within 7-day validity
    if (cached && cached.data && this.isCacheValid(cached.lastSyncedAt)) {
      if (cached.isTranslated) {
        const ageHours = Math.round((Date.now() - new Date(cached.lastSyncedAt).getTime()) / (1000 * 60 * 60));
        console.log(
          `[MasterDataService] DB Cache Hit (Translated): Serving ${dept} [type=${dataType}${subKey ? `, params: ${subKey}` : ""}] from DB (Cache age: ${ageHours}h / 168h)`
        );
        return cached.data;
      }

      // Existing cached data without translations -> translate, update DB, and return
      console.log(`[MasterDataService] Existing DB cache for ${dept} (${dataType}) lacks translations. Appending nameHindi...`);
      const translatedData = await TranslateService.appendMasterDataTranslations(cached.data, {
        departmentCode: dept,
        dataType,
      });

      await ExternalMasterData.updateOne(
        { _id: cached._id },
        { $set: { data: translatedData, isTranslated: true } }
      ).catch(() => {});
      return translatedData;
    }

    // 3. First-time fetch (no cache in DB) OR expired (> 7 days) -> Fetch from external API
    console.log(
      `[MasterDataService] ${
        !cached
          ? "First-time query (not in DB)"
          : "Cache expired (> 7 days)"
      } for ${dept} [type=${dataType}${subKey ? `, params: ${subKey}` : ""}]. Fetching from external API...`
    );

    try {
      const liveData = await ExternalIntegrationService.fetchMasterData(dept, type, queryParams);
      if (liveData) {
        // Keep exact original API response structure and only append nameHindi field
        console.log(`[MasterDataService] Appending nameHindi for ${dept} (${dataType})...`);
        const translatedData = await TranslateService.appendMasterDataTranslations(liveData, {
          departmentCode: dept,
          dataType,
        });

        // Upsert into DB with exact query parameters, isTranslated: true, and current timestamp
        await ExternalMasterData.findOneAndUpdate(
          { departmentCode: dept, dataType, subKey },
          {
            departmentCode: dept,
            dataType,
            subKey,
            queryParams: queryParams || {},
            data: translatedData,
            isTranslated: true,
            lastSyncedAt: new Date(),
            isStatic: !subKey
          },
          { upsert: true, returnDocument: 'after' }
        );

        console.log(
          `[MasterDataService] Saved fresh master data with nameHindi to DB for ${dept} [type=${dataType}${subKey ? `, params: ${subKey}` : ""}] (valid for 7 days).`
        );
        return translatedData;
      }
    } catch (apiError: any) {
      console.warn(
        `[MasterDataService] Failed to fetch external API for ${dept} (${dataType}) with params [${subKey}]:`,
        apiError?.message
      );
    }

    // 4. Stale-while-error fallback: return existing cached data even if expired (> 7 days) to avoid breaking UI
    if (cached && cached.data) {
      console.log(
        `[MasterDataService] Serving stale cached master data from DB for ${dept} (${dataType}) [${subKey}] due to external API outage`
      );
      return cached.data;
    }

    // 5. Fallback to built-in default seed if available
    const fallback = DEFAULT_FALLBACKS[dept]?.[dataType];
    if (fallback) {
      console.log(`[MasterDataService] Returning default static fallback for ${dept} (${dataType})`);
      return await TranslateService.appendMasterDataTranslations(fallback, {
        departmentCode: dept,
        dataType,
      });
    }

    throw new Error(
      `Master data for ${dept} (${dataType}) with query parameters [${subKey || "none"}] is temporarily unavailable and not yet cached locally.`
    );
  }

  /**
   * Fetch district data with database caching and 7-day renewal.
   */
  static async getDistrictData(
    departmentCode: string,
    queryParams?: Record<string, any>
  ): Promise<any> {
    const dept = departmentCode.toUpperCase();
    const dataType = "district_data";
    const subKey = this.buildSubKey(queryParams);

    // 1. Look up cached district data in local database
    const cached = await ExternalMasterData.findOne({
      departmentCode: dept,
      dataType,
      subKey
    }).lean();

    // 2. Serve from DB if valid (< 7 days)
    if (cached && cached.data && this.isCacheValid(cached.lastSyncedAt)) {
      if (cached.isTranslated) {
        const ageHours = Math.round((Date.now() - new Date(cached.lastSyncedAt).getTime()) / (1000 * 60 * 60));
        console.log(`[MasterDataService] DB Cache Hit (Translated): Serving district data from DB for ${dept} [params: ${subKey || "none"}] (Age: ${ageHours}h / 168h)`);
        return cached.data;
      }

      console.log(`[MasterDataService] Existing district cache for ${dept} lacks translations. Appending nameHindi...`);
      const translatedData = await TranslateService.appendMasterDataTranslations(cached.data, {
        departmentCode: dept,
        dataType,
      });

      await ExternalMasterData.updateOne(
        { _id: cached._id },
        { $set: { data: translatedData, isTranslated: true } }
      ).catch(() => {});
      return translatedData;
    }

    // 3. First time or expired (> 7 days) -> renew from external API
    console.log(
      `[MasterDataService] District data ${!cached ? 'first-time query (not in DB)' : 'cache expired (> 7 days)'} for ${dept}. Fetching from external API...`
    );

    try {
      const liveData = await ExternalIntegrationService.fetchDistrictData(dept);
      if (liveData) {
        console.log(`[MasterDataService] Appending nameHindi to original structure for ${dept} district data...`);
        const translatedData = await TranslateService.appendMasterDataTranslations(liveData, {
          departmentCode: dept,
          dataType,
        });

        await ExternalMasterData.findOneAndUpdate(
          { departmentCode: dept, dataType, subKey },
          {
            departmentCode: dept,
            dataType,
            subKey,
            queryParams: queryParams || {},
            data: translatedData,
            isTranslated: true,
            lastSyncedAt: new Date(),
            isStatic: !subKey
          },
          { upsert: true, returnDocument: 'after' }
        );

        console.log(`[MasterDataService] Saved fresh district data with nameHindi to DB for ${dept} (valid for 7 days).`);
        return translatedData;
      }
    } catch (apiError: any) {
      console.warn(
        `[MasterDataService] External District API unavailable for ${dept} during renewal:`,
        apiError?.message
      );
    }

    // 4. Stale fallback
    if (cached && cached.data) {
      console.log(`[MasterDataService] Serving stale cached district data from DB for ${dept}`);
      return cached.data;
    }

    // 5. Default fallback
    const fallback = DEFAULT_FALLBACKS[dept]?.[dataType];
    if (fallback) {
      return await TranslateService.appendMasterDataTranslations(fallback, {
        departmentCode: dept,
        dataType,
      });
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
          const rawData = await ExternalIntegrationService.fetchDistrictData(task.dept);
          const data = await TranslateService.appendMasterDataTranslations(rawData, {
            departmentCode: task.dept,
            dataType: "district_data",
          });
          await ExternalMasterData.findOneAndUpdate(
            { departmentCode: task.dept, dataType: "district_data", subKey: "" },
            { departmentCode: task.dept, dataType: "district_data", subKey: "", data, isTranslated: true, lastSyncedAt: new Date(), isStatic: true },
            { upsert: true, returnDocument: 'after' }
          );
          synced.push(`${task.dept}:district_data`);
        } else if (task.type) {
          const rawData = await ExternalIntegrationService.fetchMasterData(task.dept, task.type);
          const data = await TranslateService.appendMasterDataTranslations(rawData, {
            departmentCode: task.dept,
            dataType: task.type,
          });
          await ExternalMasterData.findOneAndUpdate(
            { departmentCode: task.dept, dataType: task.type, subKey: "" },
            { departmentCode: task.dept, dataType: task.type, subKey: "", data, isTranslated: true, lastSyncedAt: new Date(), isStatic: true },
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
            { departmentCode: task.dept, dataType: task.isDistrict ? "district_data" : task.type!, subKey: "", data: fallback, isTranslated: false, lastSyncedAt: new Date(), isStatic: true },
            { upsert: true, returnDocument: 'after' }
          );
        }
      }
    }

    return { synced, errors };
  }
}
