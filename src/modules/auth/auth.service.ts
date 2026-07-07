
import jwt from "jsonwebtoken";
import config from "../../config/index.js";

import { StatusCodes } from "http-status-codes";
import { ApiError } from "../../middlewares/errorHandler.js";

// const JWT_EXPIRES_IN = "7d";




/**
 * Generate a signed JWT for the given payload.
 * Uses config values if present, falls back to environment variables.
 */
export function generateJwtToken(payload: Record<string, any>): string {
  const secret =
    // common config shapes handled
    (config as any).jwtSecret ||
    (config as any).jwt?.secret ||
    process.env.JWT_SECRET;

  // const expiresIn = JWT_EXPIRES_IN;

  if (!secret) {
    throw new ApiError({
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      message: "JWT secret not configured",
    });
  }

  return jwt.sign(payload, secret as string);
}
