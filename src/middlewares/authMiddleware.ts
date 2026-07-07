import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import config from "../config/index.js";
import { ApiError } from "./errorHandler.js";
import { StatusCodes } from "http-status-codes";

import { User } from "../modules/users/user.model.js";

 export interface IUser {
  id?: string;
  name: string;
  email?: string;
  role?: any;

  phone?: string;
  status?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';

  createdAt: Date;
  updatedAt: Date;
}


declare global {
  namespace Express {
    interface Request {
      user?: IUser;

    }
  }
}

type TokenPayload = jwt.JwtPayload & {
  id?: string;
  userId?: string;
};

/**
 * Extracts the JWT token from the Authorization header of the request.
 * @param req Express request object
 * @returns The JWT token string
 * @throws ApiError if the token is missing or malformed
 */
function extractToken(req: Request): string {
  let token: string | undefined;

  // From Authorization header
  if (typeof req.headers.authorization === "string") {
    const [scheme, value] = req.headers.authorization.split(" ");

    if (scheme === "Bearer" && value) {
      token = value;
    }
  }

  // Fallback: from query param (SSE / EventSource)
  if (!token && typeof req.query.token === "string") {
    token = req.query.token;
  }

  if (!token) {
    throw new ApiError({
      status: StatusCodes.UNAUTHORIZED,
      message: "Authorization token missing",
    });
  }

  return token;
}


/**
 * Verifies the JWT token and returns its payload.
 * @param token JWT token string
 * @returns Decoded JWT payload
 * @throws ApiError if the token is invalid or expired
 */
function verifyJwtToken(token: string): TokenPayload {
  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    console.log(decoded)
    if (typeof decoded !== "object" || decoded === null) {
      throw new ApiError({
        status: StatusCodes.UNAUTHORIZED,
        message: "Invalid token payload",
      });
    }

    const payload = decoded as TokenPayload;

    const hasId =
      (typeof payload.id === "string" && payload.id.length > 0) ||
      (typeof payload.userId === "string" && payload.userId.length > 0);

    if (!hasId) {
      throw new ApiError({
        status: StatusCodes.UNAUTHORIZED,
        message: "Invalid token payload",
      });
    }

    return payload;
  } catch(err) {
    console.log(err)
    throw new ApiError({
      status: StatusCodes.UNAUTHORIZED,
      message: "Invalid or expired authorization token",
    });
  }
}

/**
 * Fetches the user from the database by user ID.
 * @param userId user's ID
 * @returns UserResponseDTO object containing user data
 * @throws ApiError if the user is not found
 */
async function fetchUser(userId: string): Promise<IUser> {
  let user: any = await User
    .findOne({_id:userId, status: 'ACTIVE'})
    .select('-password')
    .populate('role')
    .lean()
    .exec();

  if (!user) {
    throw new ApiError({
      status: StatusCodes.UNAUTHORIZED,
      message: 'User not found',
    });
  }

  const { _id, ...rest } = user;

  return {
    id: _id.toString(),
    ...rest,
  } as IUser;
}


/**
 * Express middleware to authenticate requests using JWT.
 * Attaches the authenticated user to req.user if successful.
 * @param req Express request object
 * @param res Express response object
 * @param next Express next middleware function
 */
export const authProtect = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const token = extractToken(req);
    console.log(token)
    const payload = verifyJwtToken(token);

    const userId =
      typeof payload.id === "string" && payload.id.length > 0
        ? payload.id
        : typeof payload.userId === "string" && payload.userId.length > 0
          ? payload.userId
          : undefined;

    if (!userId) {
      throw new ApiError({
        status: StatusCodes.UNAUTHORIZED,
        message: "User id missing in token",
      });
    }

    const user = await fetchUser(String(userId));
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};
