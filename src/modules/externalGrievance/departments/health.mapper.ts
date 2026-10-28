import moment from "moment";
import { TranslateName } from "../../translate/translateName.model.js";
import { TranslateService } from "../../translate/translate.service.js";

/**
 * Helper to resolve or create phonetic Hindi translation for a list of names.
 * Loops through each name:
 * 1. Checks TranslateName model in MongoDB.
 * 2. If found, returns existing nameHindi.
 * 3. Else, transliterates to phonetic Hindi and saves { name, nameHindi } in TranslateName.
 */
export const resolveNamesHindi = async (names: string[]): Promise<Record<string, string>> => {
  const result: Record<string, string> = {};
  const uniqueNames = Array.from(
    new Set(names.map((n) => (n || "").trim()).filter((n) => n.length > 0 && !/^\d+$/.test(n)))
  );

  if (uniqueNames.length === 0) return result;

  // 1. Query TranslateName collection in DB
  const cachedDocs = await TranslateName.find({ name: { $in: uniqueNames } }).lean();
  cachedDocs.forEach((doc) => {
    result[doc.name] = doc.nameHindi;
  });

  const missing = uniqueNames.filter((name) => !result[name]);
  if (missing.length === 0) {
    return result;
  }

  // 2. Transliterate missing names phonetically (in chunks of 10)
  const chunkSize = 10;
  const bulkOps: any[] = [];

  for (let i = 0; i < missing.length; i += chunkSize) {
    const chunk = missing.slice(i, i + chunkSize);
    await Promise.all(
      chunk.map(async (name) => {
        const hindi = await TranslateService.transliterateText(name);
        result[name] = hindi;

        bulkOps.push({
          updateOne: {
            filter: { name },
            update: { $set: { name, nameHindi: hindi } },
            upsert: true,
          },
        });
      })
    );
  }

  // 3. Save new names into TranslateName model
  if (bulkOps.length > 0) {
    await TranslateName.bulkWrite(bulkOps).catch((err) =>
      console.warn("[HealthMapper] TranslateName bulk write error:", err?.message)
    );
  }

  return result;
};

/**
 * Maps Health raw master data, translates all nested names, appends `nameHindi`,
 * and returns the structured master data object.
 */
export const getMappedMasterData = async (res: any) => {
  const common = res?.["common-masters"] || res?.MdmsRes?.["common-masters"] || {};
  const pgr = res?.["RAINMAKER-PGR"] || res?.MdmsRes?.["RAINMAKER-PGR"] || {};

  const rawInstitutionName = (common?.["InstitutionName"] || []).filter((v: any) => v.active == true);
  const rawInstitutionType = (common?.["InstitutionType"] || []).filter((v: any) => v.active == true);
  const rawGender = (common?.["GenderType"] || []).filter((v: any) => v.active == true);
  const rawComplainantType = (common?.["ComplainantType"] || []).filter((v: any) => v.active == true);
  const rawGrievanceType = (pgr?.["ServiceDefs"] || []).filter((v: any) => v.active == true);

  // Collect all unique names to translate in bulk
  const allNames: string[] = [];
  rawInstitutionName.forEach((v: any) => v.name && allNames.push(v.name));
  rawInstitutionType.forEach((v: any) => v.name && allNames.push(v.name));
  rawGender.forEach((v: any) => v.name && allNames.push(v.name));
  rawComplainantType.forEach((v: any) => v.name && allNames.push(v.name));
  rawGrievanceType.forEach((v: any) => v.name && allNames.push(v.name));

  // Resolve Hindi versions from TranslateName model or transliterate & save
  const nameMap = await resolveNamesHindi(allNames);

  const obj = {
    institutionName: rawInstitutionName.map((v: any) => ({
      label: v.name,
      value: v.name,
      nameHindi: nameMap[v.name] || v.name,
    })),
    institutionType: rawInstitutionType.map((v: any) => ({
      label: v.name,
      value: v.name,
      nameHindi: nameMap[v.name] || v.name,
    })),
    gender: rawGender.map((v: any) => ({
      label: v.name,
      value: v.code,
      nameHindi: nameMap[v.name] || v.name,
    })),
    complainantType: rawComplainantType.map((v: any) => ({
      label: v.name,
      value: v.name,
      nameHindi: nameMap[v.name] || v.name,
    })),
    grievanceType: rawGrievanceType.map((v: any) => ({
      label: v.name,
      value: v.name,
      subType: v.serviceCode,
      nameHindi: nameMap[v.name] || v.name,
    })),
  };

  return obj;
};

/**
 * Maps Health raw district data, translates all nested divisions, districts,
 * blocks, and villages, appends `nameHindi`, and returns the structured object.
 */
export const getDistrictMappedData = async (res: any) => {
  const nested =
    res?.MdmsRes?.["egov-location"]?.["TenantBoundary"]?.[1]?.boundary?.children ||
    res?.["egov-location"]?.["TenantBoundary"]?.[1]?.boundary?.children ||
    [];

  // Collect all names across nested tree
  const allNames: string[] = [];
  nested.forEach((division: any) => {
    if (division?.name) allNames.push(division.name);
    (division?.children || []).forEach((district: any) => {
      if (district?.name) allNames.push(district.name);
      (district?.children || []).forEach((block: any) => {
        if (block?.name) allNames.push(block.name);
        (block?.children || []).forEach((village: any) => {
          if (village?.name) allNames.push(village.name);
        });
      });
    });
  });

  // Resolve Hindi versions from TranslateName model or transliterate & save
  const nameMap = await resolveNamesHindi(allNames);

  const obj = {
    division: nested.map((v: any) => ({
      label: v.name,
      value: v.name,
      code: v.code,
      nameHindi: nameMap[v.name] || v.name,
    })),
    district: nested
      .map((division: any) => {
        return (division?.children || []).map((district: any) => ({
          label: district.name,
          value: district.name,
          division: division.name,
          nameHindi: nameMap[district.name] || district.name,
        }));
      })
      .flat(4),
    block: nested
      .map((division: any) => {
        return (division?.children || []).map((district: any) => {
          return (district?.children || []).map((block: any) => ({
            label: block.name,
            value: block.name,
            district: district.name,
            division: division.name,
            nameHindi: nameMap[block.name] || block.name,
          }));
        });
      })
      .flat(4),
    village: nested
      .map((division: any) => {
        return (division?.children || []).map((district: any) => {
          return (district?.children || []).map((block: any) => {
            return (block?.children || []).map((village: any) => ({
              label: village.name,
              value: village.name,
              block: block.name,
              district: district.name,
              division: division.name,
              nameHindi: nameMap[village.name] || village.name,
            }));
          });
        });
      })
      .flat(5),
  };

  return obj;
};

/**
 * Transforms form submission data into Health department grievance payload
 */
export const getFinalFormData = (
  data: any,
  fields: any,
  departmentCode = "HEALTH",
) => {
  const updatedData = { ...data };

  updatedData.dateOfIncident = String(
    moment(updatedData.dateOfIncident).valueOf(),
  );
  updatedData.serviceCode = (fields?.grievanceType || []).find(
    (o: any) => o.value === data?.grievanceType,
  )?.subType;
  const division = (fields?.district || []).find(
    (o: any) => o.value === data?.address?.district,
  )?.division;
  const divisionName =
    (fields?.division || []).find((o: any) => o.value === division)?.label ||
    "";

  if (!updatedData.address) {
    updatedData.address = {};
  }

  updatedData.address.division = String(divisionName).toUpperCase();
  updatedData.address.region = String(divisionName).toUpperCase();
  updatedData.address.locality = updatedData.address.locality || {};
  updatedData.address.locality.code = String(divisionName).toUpperCase();
  updatedData.address.locality.name = String(divisionName);

  const payload = {
    departmentCode,
    mobile: updatedData.citizen?.mobileNumber,
    departmentPayload: updatedData,
  };
  return payload;
};
