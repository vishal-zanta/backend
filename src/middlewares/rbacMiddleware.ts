import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { ApiError } from "./errorHandler.js";
import { AppRole, ROLES } from "../config/roles.config.js";

/**
 * Middleware to check if the authenticated user has the required role(s).
 * Pass the allowed roles as arguments.
 */
export const authorizeRoles = (...allowedRoles: AppRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const user = (req as any).user;

      if (!user) {
        throw new ApiError({
          status: StatusCodes.UNAUTHORIZED,
          message: "User not authenticated",
        });
      }

      if (!user.roles || !Array.isArray(user.roles) || user.roles.length === 0) {
        throw new ApiError({
          status: StatusCodes.FORBIDDEN,
          message: "Access denied. No role assigned.",
        });
      }
      
      const userRoles = user.roles.map((r: any) => r.level);
      
      const hasAllowedRole = allowedRoles.some((allowedRole) => userRoles.includes(allowedRole));

      if (!hasAllowedRole) {
        throw new ApiError({
          status: StatusCodes.FORBIDDEN,
          message: `Access denied. Requires one of the following roles: ${allowedRoles.join(", ")}`,
        });
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
