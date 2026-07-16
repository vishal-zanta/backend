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

  if (config.nodeEnv === 'development') {
    console.error(errorMessage);
    console.error(error?.stack);
  }

  if (error?.name === 'ValidationError') {
    errorMessage = "Invalid input data provided. Please check your request.";
    status = StatusCodes.BAD_REQUEST;
  } else if (error?.name === 'CastError') {
    errorMessage = "Invalid identifier format provided.";
    status = StatusCodes.BAD_REQUEST;
  } else if (error?.code === 11000) {
    errorMessage = "This record already exists.";
    status = StatusCodes.CONFLICT;
  } else {
    const isDbError = 
      error?.name === 'MongoServerError' || 
      error?.name === 'MongooseError' || 
      (errorMessage && errorMessage.toLowerCase().includes('mongo'));

    if (isDbError || status === StatusCodes.INTERNAL_SERVER_ERROR) {
      errorMessage = "Something went wrong, please try after some time";
      status = StatusCodes.INTERNAL_SERVER_ERROR;
    }
  }

  new ApiResponse({
    res,
    status,
    message: errorMessage || "Something went wrong, please try after some time",
  });
};
