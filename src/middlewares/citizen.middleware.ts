import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import config from "../config/index.js";
import { ApiError } from "./errorHandler.js";
import { StatusCodes } from "http-status-codes";
import { Citizen, ICitizen } from "../modules/citizen/citizen.model.js";

declare global {
  namespace Express {
    interface Request {
      citizen?: ICitizen;
    }
  }
}

export const citizenAuthProtect = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let token: string | undefined;

    if (typeof req.headers.authorization === "string") {
      const [scheme, value] = req.headers.authorization.split(" ");
      if (scheme === "Bearer" && value) {
        token = value;
      }
    }

    if (!token) {
      throw new ApiError({
        status: StatusCodes.UNAUTHORIZED,
        message: "Authorization token missing",
      });
    }

    const jwtSecret =  config.jwtSecret || "fallback_secret_key";
    
    let decoded: any;
    try {
      decoded = jwt.verify(token, jwtSecret);
    } catch (err) {
      throw new ApiError({
        status: StatusCodes.UNAUTHORIZED,
        message: "Invalid or expired authorization token",
      });
    }

    if (!decoded || !decoded.id) {
      throw new ApiError({
        status: StatusCodes.UNAUTHORIZED,
        message: "Invalid token payload",
      });
    }

    const citizen = await Citizen.findById(decoded.id);

    if (!citizen) {
      throw new ApiError({
        status: StatusCodes.UNAUTHORIZED,
        message: "Citizen not found",
      });
    }
citizen.mobile = citizen.mobile.slice(-10);
citizen.alternateMobile = citizen?.alternateMobile?.slice(-10);
    next();
  } catch (error) {
    next(error);
  }
};
