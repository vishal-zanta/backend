import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/apiResponse.js';

export interface RBACRequest extends Request {
  user?: any;
}

export const rbacMiddleware = (allowedRoles: string[]) => {
  return (req: RBACRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new ApiError(401, 'Authentication required');
    }

    const userRole = req.user.role.level;
    
    if (!allowedRoles.includes(userRole)) {
      throw new ApiError(403, 'Insufficient permissions');
    }

    next();
  };
};

