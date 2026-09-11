import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { ApiError } from "./errorHandler.js";
import { ApiPermission } from "../config/permissions.config.js";

/**
 * Middleware to check if the authenticated user has the required permission(s).
 * Accepts either a single permission string or an array of permissions.
 * If an array is provided, the user needs at least one of those permissions.
 */
export const checkPermission = (requiredPermissions: ApiPermission | ApiPermission[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const user = req.user;

      if (!user) {
        throw new ApiError({
          status: StatusCodes.UNAUTHORIZED,
          message: "User not authenticated",
        });
      }

      // If user has no roles
      if (!user.roles || !Array.isArray(user.roles)) {
        throw new ApiError({
          status: StatusCodes.FORBIDDEN,
          message: "Access denied. No roles assigned.",
        });
      }

      // Aggregate all permissions from all assigned roles
      const allPermissions = user.roles.flatMap((r: any) => r.permissions || []);

      if (allPermissions.length === 0) {
        throw new ApiError({
          status: StatusCodes.FORBIDDEN,
          message: "Access denied. No permissions assigned to your roles.",
        });
      }

      // Bypass check if user has the master ALL permission
      if (allPermissions.includes("ALL")) {
        return next();
      }

      const permsToCheck = Array.isArray(requiredPermissions) 
        ? requiredPermissions 
        : [requiredPermissions];

      const hasPermission = permsToCheck.some((perm) => 
        allPermissions.includes(perm)
      );

      if (!hasPermission) {
        throw new ApiError({
          status: StatusCodes.FORBIDDEN,
          message: `Access denied. Requires permission: ${permsToCheck.join(", ")}`,
        });
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
