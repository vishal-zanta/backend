import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import ApiResponse from "../utils/apiResponse.js";
import config from "../config/index.js";

export class ApiError extends Error {
  status: number;

  constructor({ status, message }: { status: number; message: string }) {
    super(message);
    this.status = status;
  }
}

export const handleErrorResponse = (
  res: Response,
  error: ApiError | Error | any,
  req?: Request
) => {
  let errorMessage = error?.response?.data?.message || error?.message;
  let status = error?.status || StatusCodes.INTERNAL_SERVER_ERROR;

  const isDbError = 
    error?.name === 'MongoServerError' || 
    error?.name === 'MongooseError' || 
    error?.name === 'CastError' || 
    error?.name === 'ValidationError' ||
    (errorMessage && errorMessage.toLowerCase().includes('mongo'));

  if (config.nodeEnv === 'development') {
    console.error(errorMessage);
    console.error(error?.stack);
  }

  if (isDbError) {
    errorMessage = "Internal Server Error";
    status = StatusCodes.INTERNAL_SERVER_ERROR;
  }

  new ApiResponse({
    res,
    status,
    message: errorMessage || "Internal Server Error",
  });
};
