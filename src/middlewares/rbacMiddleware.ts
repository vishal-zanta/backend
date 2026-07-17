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

      // Check if user has a role object populated and its designationEnglish
      const userRole = user.role?.level;

      if (!userRole) {
        throw new ApiError({
          status: StatusCodes.FORBIDDEN,
          message: "Access denied. No role assigned.",
        });
      }
      
      // Admin bypass (optional, but usually helpful. Remove if Admin shouldn't auto-bypass everything)
      // if (userRole === ROLES.ADMIN) {
      //   return next();
      // }

      if (!allowedRoles.includes(userRole as AppRole)) {
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
