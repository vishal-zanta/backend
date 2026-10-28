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

// Candidate property names representing the name of an item in master data
const TARGET_NAME_FIELDS = [
  "name",
  "localname",
  "typeName",
  "categoryName",
  "districtName",
  "blockName",
  "panchayatName",
  "villageName",
  "schoolName",
  "serviceName",
  "title",
];

export class TranslateService {
  /**
   * Transliterate a single text phonetically into Hindi script (Devanagari).
   * E.g. "Patna" -> "पटना", "Consumer Related Issues" -> "कंस्यूमर रिलेटेड इश्यूज"
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
   * Bulk transliterates an array of texts.
   * 1. Checks TranslateName DB collection first for existing phonetic Hindi versions.
   * 2. Transliterates any missing texts phonetically into Devanagari Hindi script.
   * 3. Saves newly converted names into TranslateName DB.
   * 4. Returns map of { [englishName]: hindiVersion }
   */
  static async translateBatch(texts: string[]): Promise<Record<string, string>> {
    const result: Record<string, string> = {};
    const uniqueClean = Array.from(
      new Set(
        texts
          .map((t) => (t || "").trim())
          .filter((t) => t.length > 0 && !/^\d+$/.test(t)) // Skip empty strings and numbers
      )
    );

    if (uniqueClean.length === 0) return result;

    // 1. Query DB for existing Hindi versions in TranslateName
    const cachedDocs = await TranslateName.find({ name: { $in: uniqueClean } }).lean();
    cachedDocs.forEach((doc) => {
      result[doc.name] = doc.nameHindi;
    });

    const missingTexts = uniqueClean.filter((text) => !result[text]);
    if (missingTexts.length === 0) {
      return result;
    }

    // 2. Transliterate missing texts in parallel (chunks of 10)
    const chunkSize = 10;
    const bulkOps: any[] = [];

    for (let i = 0; i < missingTexts.length; i += chunkSize) {
      const chunk = missingTexts.slice(i, i + chunkSize);
      await Promise.all(
        chunk.map(async (text) => {
          const hindi = await this.transliterateText(text);
          result[text] = hindi;

          bulkOps.push({
            updateOne: {
              filter: { name: text },
              update: { $set: { name: text, nameHindi: hindi } },
              upsert: true,
            },
          });
        })
      );
    }

    // 3. Save new phonetic Hindi versions into TranslateName DB
    if (bulkOps.length > 0) {
      await TranslateName.bulkWrite(bulkOps).catch((err) =>
        console.warn("[TranslateService] Bulk write error for TranslateName:", err?.message)
      );
    }

    return result;
  }

  /**
   * Scans external master data items and appends only one new field: `nameHindi`
   */
  static async appendMasterDataTranslations(payload: any): Promise<any> {
    if (!payload) return payload;

    const cloned = JSON.parse(JSON.stringify(payload));
    const extractedTexts: string[] = [];

    // 1. Recursively collect text from all candidate name fields
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

    // 2. Fetch or generate Hindi phonetic versions
    const translationMap = await this.translateBatch(extractedTexts);

    // 3. Recursively append ONLY `nameHindi` placed at the top next to `name`
    const injectNameHindi = (node: any): any => {
      if (!node || typeof node !== "object") return node;

      if (Array.isArray(node)) {
        return node.map(injectNameHindi);
      }

      // Find the primary name identifier for this item
      const primaryName =
        node.name ||
        node.localname ||
        node.typeName ||
        node.categoryName ||
        node.districtName ||
        node.blockName ||
        node.panchayatName ||
        node.villageName ||
        node.schoolName ||
        node.serviceName ||
        node.title;

      const hindi =
        typeof primaryName === "string" && primaryName.trim()
          ? translationMap[primaryName.trim()]
          : undefined;

      const updatedEntries: [string, any][] = [];
      let hindiInserted = false;

      for (const [key, val] of Object.entries(node)) {
        if (key === "nameHindi") continue;

        const processedVal = val && typeof val === "object" ? injectNameHindi(val) : val;
        updatedEntries.push([key, processedVal]);

        // Place nameHindi immediately after the name field so it appears at the top before large children arrays
        if (
          hindi &&
          !hindiInserted &&
          (TARGET_NAME_FIELDS.includes(key) || key === "name")
        ) {
          updatedEntries.push(["nameHindi", hindi]);
          hindiInserted = true;
        }
      }

      // Fallback: If not inserted yet (e.g. key named differently), place before children or at top
      if (hindi && !hindiInserted) {
        const childrenIdx = updatedEntries.findIndex(([k]) => k === "children");
        if (childrenIdx !== -1) {
          updatedEntries.splice(childrenIdx, 0, ["nameHindi", hindi]);
        } else {
          updatedEntries.push(["nameHindi", hindi]);
        }
      }

      return Object.fromEntries(updatedEntries);
    };

    return injectNameHindi(cloned);
  }
}
