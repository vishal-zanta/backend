
import {  parsePhoneNumberFromString } from "libphonenumber-js";

export function getPhoneMatchDigits(input: any): string | null {
if (!input && input !== 0) return null;
const digits = String(input).replace(/\D/g, "");
  if (!digits) return null;

  return digits.slice(-10);
}

export function buildPhoneMatchRegex(input: any): RegExp | null {
  const digits = getPhoneMatchDigits(input);
  if (!digits) return null;

  return new RegExp(`${digits}$`);
}

export function extractAndValidatePhone(
  input: any,
  defaultCountry: any = "IN" // default India
): string | null {
if (!input && input !== 0) return null;
const inputStr = String(input).trim();
  if (!inputStr) return null;
  try {
    const phone = parsePhoneNumberFromString(inputStr, defaultCountry);

    if (!phone || !phone.isValid()) return inputStr;

    // Always return E.164 format
    console.log( phone.number)
    return phone.number; // Example: +919876543210
  } catch {
    return null;
  }
}

export function validatePhoneNumbers(
  phones: (string | null | undefined)[]
): string[] {
  const validPhones: string[] = [];
  const seen = new Set<string>();

  for (const phone of phones) {
    if (!phone) continue;

    const validated = extractAndValidatePhone(phone); // IN auto default

    if (validated && !seen.has(validated)) {
      validPhones.push(validated);
      seen.add(validated);
    }
  }

  return validPhones;
}




