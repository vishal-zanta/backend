import path from "path";
import dotenv from "dotenv";
import { v2 } from "@google-cloud/translate";
import { TranslateName } from "./translateName.model.js";

dotenv.config();

const translateClient = new v2.Translate({
  keyFilename:
    process.env.GOOGLE_APPLICATION_CREDENTIALS ||
    path.join(process.cwd(), "hozo-translation-prod-247bbeac1b85.json"),
});

// Candidate property names representing names or labels in master data
const TARGET_NAME_FIELDS = [
  "schoolName",
  "villageName",
  "panchayatName",
  "blockName",
  "districtName",
  "name",
  "localname",
  "category",
  "categoryName",
  "source",
  "status",
  "type",
  "typeName",
  "subType",
  "description",
  "serviceName",
  "title",
  "label",
];

export interface DualTranslation {
  hindi: string;
  english: string;
}

export function isHindiText(text: string): boolean {
  return /[\u0900-\u097F]/.test(text || "");
}

export class TranslateService {
  /**
   * Transliterate a single text phonetically into Hindi script (Devanagari).
   * E.g. "Patna" -> "पटना", "HELPLINE" -> "हेल्पलाइन"
   */
  static async transliterateText(text: string): Promise<string> {
    const trimmed = (text || "").trim();
    if (!trimmed) return "";

    try {
      const url = `https://inputtools.google.com/request?text=${encodeURIComponent(trimmed)}&itc=hi-t-i0-und&num=1`;
      const res = await fetch(url).then((r) => r.json());
      if (res && res[0] === "SUCCESS" && Array.isArray(res[1])) {
        const transliterated = res[1]
          .map((item: any) => (item[1] && item[1][0] ? item[1][0] : item[0]))
          .join(" ");
        if (transliterated && transliterated.trim()) {
          return transliterated.trim();
        }
      }
    } catch {
      // Fallback below
    }

    // Secondary fallback: Google Cloud Translate
    try {
      const [translation] = await translateClient.translate(trimmed, "hi");
      return String(translation || trimmed).trim();
    } catch {
      return trimmed;
    }
  }

  /**
   * Translate a Hindi text into English.
   * E.g. "विद्यालय" -> "School", "आधारभूत संरचना" -> "Infrastructure"
   */
  static async translateTextToEnglish(text: string): Promise<string> {
    const trimmed = (text || "").trim();
    if (!trimmed) return "";

    try {
      const [translation] = await translateClient.translate(trimmed, "en");
      return String(translation || trimmed).trim();
    } catch (e: any) {
      console.warn(`[TranslateService] Failed to translate "${trimmed}" to English:`, e?.message);
      return trimmed;
    }
  }

  /**
   * Bulk transliterates / translates an array of texts.
   * 1. Checks TranslateName DB collection first for existing Hindi & English versions.
   * 2. If text is Hindi -> translates to English.
   * 3. If text is English -> transliterates/translates to Hindi.
   * 4. Saves newly converted names into TranslateName DB with nameHindi and nameEng.
   * 5. Returns map of { [text]: { hindi, english } }
   */
  static async translateBatch(texts: string[]): Promise<Record<string, DualTranslation>> {
    const result: Record<string, DualTranslation> = {};
    const uniqueClean = Array.from(
      new Set(
        texts
          .map((t) => (t || "").trim())
          .filter((t) => t.length > 0 && !/^\d+$/.test(t)) // Skip empty strings and numbers
      )
    );

    if (uniqueClean.length === 0) return result;

    // 1. Query DB for existing translations in TranslateName
    const cachedDocs = await TranslateName.find({ name: { $in: uniqueClean } }).lean();
    cachedDocs.forEach((doc) => {
      const isHindi = isHindiText(doc.name);
      result[doc.name] = {
        hindi: doc.nameHindi || (isHindi ? doc.name : ""),
        english: doc.nameEng || (!isHindi ? doc.name : ""),
      };
    });

    const missingTexts = uniqueClean.filter(
      (text) =>
        !result[text] ||
        !result[text].hindi ||
        !result[text].english
    );

    if (missingTexts.length === 0) {
      return result;
    }

    // 2. Translate/transliterate missing texts in chunks
    const chunkSize = 10;
    const bulkOps: any[] = [];

    for (let i = 0; i < missingTexts.length; i += chunkSize) {
      const chunk = missingTexts.slice(i, i + chunkSize);
      await Promise.all(
        chunk.map(async (text) => {
          let hindi = result[text]?.hindi || "";
          let english = result[text]?.english || "";

          if (isHindiText(text)) {
            hindi = text;
            if (!english) {
              english = await this.translateTextToEnglish(text);
            }
          } else {
            english = text;
            if (!hindi) {
              hindi = await this.transliterateText(text);
            }
          }

          result[text] = { hindi, english };

          bulkOps.push({
            updateOne: {
              filter: { name: text },
              update: {
                $set: {
                  name: text,
                  nameHindi: hindi,
                  nameEng: english,
                },
              },
              upsert: true,
            },
          });
        })
      );
    }

    // 3. Save new versions into TranslateName DB
    if (bulkOps.length > 0) {
      await TranslateName.bulkWrite(bulkOps).catch((err) =>
        console.warn("[TranslateService] Bulk write error for TranslateName:", err?.message)
      );
    }

    return result;
  }

  /**
   * Helper to determine primary identifier property and value of an object.
   * Priority: schoolName (for schools) > villageName > panchayatName > blockName > districtName > name > localname > category > source > status > ...
   */
  static getPrimaryField(node: any): { key: string; value: string } | null {
    if (!node || typeof node !== "object") return null;

    const priorityFields = [
      "schoolName",
      "villageName",
      "panchayatName",
      "blockName",
      "districtName",
      "name",
      "localname",
      "category",
      "categoryName",
      "source",
      "status",
      "type",
      "typeName",
      "subType",
      "serviceName",
      "title",
      "label",
    ];

    for (const field of priorityFields) {
      if (typeof node[field] === "string" && node[field].trim()) {
        return { key: field, value: node[field].trim() };
      }
    }

    return null;
  }

  /**
   * Scans master data items and appends `nameHindi`, `nameEng`, and field-specific
   * `samekeyEng` / `samekeyHindi` counterparts (especially for EDUCATION department).
   */
  static async appendMasterDataTranslations(
    payload: any,
    options?: { departmentCode?: string; dataType?: string }
  ): Promise<any> {
    if (!payload) return payload;

    const cloned = JSON.parse(JSON.stringify(payload));
    const extractedTexts: string[] = [];
    const isEducation = options?.departmentCode?.toUpperCase() === "EDUCATION";

    // 1. Recursively collect text from all candidate name/label fields
    const collectTexts = (node: any) => {
      if (!node || typeof node !== "object") return;

      if (Array.isArray(node)) {
        node.forEach(collectTexts);
        return;
      }

      for (const field of TARGET_NAME_FIELDS) {
        if (typeof node[field] === "string" && node[field].trim()) {
          extractedTexts.push(node[field].trim());
        }
      }

      for (const value of Object.values(node)) {
        if (value && typeof value === "object") {
          collectTexts(value);
        }
      }
    };

    collectTexts(cloned);

    if (extractedTexts.length === 0) {
      return cloned;
    }

    // 2. Fetch or generate Hindi and English versions
    const translationMap = await this.translateBatch(extractedTexts);

    // 3. Recursively append translations
    const injectTranslations = (node: any): any => {
      if (!node || typeof node !== "object") return node;

      if (Array.isArray(node)) {
        return node.map(injectTranslations);
      }

      const primary = this.getPrimaryField(node);
      const primaryTrans = primary ? translationMap[primary.value] : undefined;

      const updatedEntries: [string, any][] = [];
      let nameInserted = false;

      for (const [key, val] of Object.entries(node)) {
        // Skip existing translation keys to avoid duplicates when re-syncing
        if (key === "nameHindi" || key === "nameEng") continue;
        if (
          isEducation &&
          (key.endsWith("Hindi") || key.endsWith("Eng")) &&
          TARGET_NAME_FIELDS.some(
            (tf) => key === `${tf}Hindi` || key === `${tf}Eng`
          )
        ) {
          continue;
        }

        const processedVal =
          val && typeof val === "object" ? injectTranslations(val) : val;
        updatedEntries.push([key, processedVal]);

        // Education department special logic: add samekeyEng / samekeyHindi
        if (
          isEducation &&
          typeof val === "string" &&
          val.trim() &&
          TARGET_NAME_FIELDS.includes(key)
        ) {
          const trans = translationMap[val.trim()];
          if (trans) {
            if (isHindiText(val)) {
              // Hindi source text -> add keyEng
              updatedEntries.push([`${key}Eng`, trans.english]);
            } else {
              // English source text -> add keyHindi and keyEng
              updatedEntries.push([`${key}Hindi`, trans.hindi]);
              updatedEntries.push([`${key}Eng`, trans.english]);
            }
          }
        }

        // Place nameHindi & nameEng immediately after primary identifier key
        if (primary && key === primary.key && primaryTrans && !nameInserted) {
          updatedEntries.push(["nameHindi", primaryTrans.hindi]);
          if (primaryTrans.english) {
            updatedEntries.push(["nameEng", primaryTrans.english]);
          }
          nameInserted = true;
        } else if (
          !isEducation &&
          (TARGET_NAME_FIELDS.includes(key) || key === "name") &&
          primaryTrans &&
          !nameInserted
        ) {
          updatedEntries.push(["nameHindi", primaryTrans.hindi]);
          if (primary && isHindiText(primary.value) && primaryTrans.english) {
            updatedEntries.push(["nameEng", primaryTrans.english]);
          }
          nameInserted = true;
        }
      }

      // Fallback: If nameHindi not inserted yet, place before children or at end
      if (primaryTrans && !nameInserted) {
        const childrenIdx = updatedEntries.findIndex(([k]) => k === "children");
        const insertIdx = childrenIdx !== -1 ? childrenIdx : updatedEntries.length;
        const additions: [string, any][] = [["nameHindi", primaryTrans.hindi]];
        if (primaryTrans.english) {
          additions.push(["nameEng", primaryTrans.english]);
        }
        updatedEntries.splice(insertIdx, 0, ...additions);
      }

      return Object.fromEntries(updatedEntries);
    };

    return injectTranslations(cloned);
  }
}
