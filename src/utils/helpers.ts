import moment from "moment";
import { StatusCodes } from "http-status-codes";
import { Types, isValidObjectId } from "mongoose";
import { ApiError } from "../middlewares/errorHandler.js";

/**
 * Validates required fields and throws an ApiError if any are missing
 * @param fields Object containing field name-value pairs to validate
 * @throws ApiError with BAD_REQUEST status if any required fields are missing
 */
export const validateRequiredFields = (fields: Record<string, any>): void => {
  const missingFields = Object.entries(fields)
    .filter(([_, value]) => !value)
    .map(([key]) => key);

  if (missingFields.length > 0) {
    throw new ApiError({
      status: StatusCodes.BAD_REQUEST,
      message: `Missing required fields: ${missingFields.join(", ")}`,
    });
  }
};

/**
 * Split an array into chunks of the given size.
 *
 * @template T - type of array elements
 * @param {T[]} arr - The array to chunk.
 * @param {number} size - Maximum size of each chunk. Must be > 0.
 * @returns {T[][]} An array of chunks (arrays). Returns [] if input is not an array or size <= 0.
 */
export function chunkArray<T>(arr: T[], size: number): T[][] {
  if (!Array.isArray(arr) || size <= 0) return [];
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

/**
 * Convert a snake_case string or an object's keys to camelCase.
 *
 * - If a string is provided, trims whitespace and converts underscores followed by a character
 *   to the uppercase form of that character.
 * - If a plain object is provided, returns a new object with top-level keys converted
 *   from snake_case to camelCase (values are preserved as-is).
 *
 * Examples:
 *   snakeToCamelCase('hello_world') // -> 'helloWorld'
 *   snakeToCamelCase({ email_address: 'a@b.com', house_no: 12 })
 *   // -> { emailAddress: 'a@b.com', houseNo: 12 }
 *
 * Note: This function performs only a shallow conversion of object keys.
 *
 * @param {string|Record<string, any>} input - The snake_case string or object to convert.
 * @returns {string|Record<string, any>} The converted camelCase string or new object with camelCased keys.
 */
export function snakeToCamelCase(
  input: string | Record<string, any>,
): string | Record<string, any> {
  // handle string input
  if (typeof input === "string") {
    return input.trim().replace(/_([a-zA-Z0-9])/g, (_, ch) => ch.toUpperCase());
  }

  // handle null/non-object or arrays -> return empty object for invalid inputs
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return {};
  }

  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(input)) {
    const camelKey = key.replace(/_([a-zA-Z0-9])/g, (_, ch) =>
      ch.toUpperCase(),
    );
    result[camelKey] = value;
  }
  return result;
}

/**
 * Parses multiple JSON fields in an object, modifying the object in place.
 * For each key in the provided array, attempts to parse the corresponding value in the object as JSON.
 * If parsing fails or the value is falsy, sets the value to an empty array.
 * @param obj - The object containing the fields to parse.
 * @param keys - Array of keys whose values should be parsed as JSON.
 */
export function parseMultipleJSONFields(
  obj: Record<string, any>,
  keys: string[],
): void {
  keys.forEach((key) => {
    try {
      const value = obj[key];
      if (value === null || value === undefined || value === "") {
        delete obj[key];
        return;
      }
      obj[key] = JSON.parse(value);
    } catch {
      delete obj[key];
    }
  });
}

/**
 * Builds pagination metadata based on the provided page, limit, and total count.
 * Validates and clamps the page and limit values, then calculates various pagination properties.
 * @param {Object} params - The pagination parameters.
 * @param {number} params.page - The current page number (1-based).
 * @param {number} params.limit - The number of items per page.
 * @param {number} params.totalCount - The total number of items.
 * @returns {Object} An object containing pagination metadata including current page, total pages, navigation flags, and range information.
 */
export function buildPagination({
  page,
  limit,
  totalCount,
}: {
  page: number;
  limit: number;
  totalCount: number;
}): {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  limit: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  nextPage: number | null;
  previousPage: number | null;
  offset: number;
  from: number;
  to: number;
  isFirstPage: boolean;
  isLastPage: boolean;
} {
  const totalPages = Math.ceil(totalCount / limit) || 1;

  const validatedPage = Math.max(1, Math.min(page, totalPages));
  const validatedLimit = Math.max(1, limit);

  const hasNextPage = validatedPage < totalPages;
  const hasPreviousPage = validatedPage > 1;

  return {
    currentPage: validatedPage,
    totalPages,
    totalCount,
    limit: validatedLimit,

    hasNextPage,
    hasPreviousPage,
    nextPage: hasNextPage ? validatedPage + 1 : null,
    previousPage: hasPreviousPage ? validatedPage - 1 : null,

    offset: (validatedPage - 1) * validatedLimit,
    from: (validatedPage - 1) * validatedLimit + 1,
    to: Math.min(validatedPage * validatedLimit, totalCount),

    isFirstPage: validatedPage === 1,
    isLastPage: validatedPage === totalPages,
  };
}

export function buildSearchQuery(search: string | undefined, fields: string[]) {
  if (!search) return {};

  return {
    $or: fields.map((field) => ({
      [field]: { $regex: search, $options: "i" },
    })),
  };
}

type FilterType =
  | "objectId"
  | "string"
  | "number"
  | "boolean"
  | "date"
  | "dateRange";

export const buildMongoQuery = ({
  reqQuery,
  filters,
  search,
}: {
  reqQuery: Record<string, any>;
  filters: Record<string, FilterType>;
  search?: { term?: string; fields: string[] };
}) => {
  const query: Record<string, any> = {};

  // search
  const searchTerm = search?.term || (reqQuery.search as string);
  if (searchTerm && search?.fields) {
    Object.assign(query, buildSearchQuery(searchTerm, search.fields));
  }

  for (const [field, type] of Object.entries(filters)) {
    const value = reqQuery[field];
    if (value === undefined) continue;

    switch (type) {
      case "objectId":
        if (isValidObjectId(value)) {
          query[field] = new Types.ObjectId(value);
        }
        break;

      case "number":
        query[field] = Number(value);
        break;

      case "boolean":
        query[field] = value === "true" || value === true;
        break;

      case "date":
        query[field] = new Date(value);
        break;

      case "string":
        query[field] = value;
        break;

      case "dateRange":
        const from = reqQuery.startDate;
        const to = reqQuery.endDate;
        if (from || to) {
          query[field] = {};
          if (from) query[field].$gte = moment(from).startOf("day").toDate();
          if (to) query[field].$lte = moment(to).endOf("day").toDate();
        }
        break;
    }
  }

  return query;
};


  export const  validateRequestFields=(fields: any[], data: Record<string, any>)=> {
    const errors: string[] = [];
    
    for (const field of fields) {
      if (field && !data[field]) {
        errors.push(`${field} is required`);
      }
    }
    
    if (errors.length > 0) {
      throw new ApiError({ status: 400, message: errors.join(', ') });
    }
  }
