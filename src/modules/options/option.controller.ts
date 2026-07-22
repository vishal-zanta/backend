import { Request, Response } from "express";
import { Option } from "./option.model.js";
import { asyncHandler } from "../../middlewares/asyncHandler.js";
import { ApiError } from "../../middlewares/errorHandler.js";
import ApiResponse from "../../utils/apiResponse.js";
import { buildPagination, toSnakeCase } from "../../utils/helpers.js";



export class OptionController {
  /**
   * Create a new Option. Automatically derives snake_case value from the title.
   */
  static createOption = asyncHandler(async (req: Request, res: Response) => {
    const { title, type } = req.body;

    if (!title || !type) {
      throw new ApiError({ status: 400, message: "title and type are required" });
    }

    const value = toSnakeCase(title);

    const existing = await Option.findOne({ type: type.trim(), value });
    if (existing) {
      throw new ApiError({ 
        status: 400, 
        message: `Option with title '${title}' already exists in type '${type}'` 
      });
    }

    const option = await Option.create({
      title: title.trim(),
      type: type.trim(),
      value,
    });

    return new ApiResponse({
      res,
      status: 201,
      data: option,
      message: "Option created successfully",
    });
  });

  /**
   * Get all unique option types (e.g. ['PUBLIC_IMPACT', 'FREQUENCY', ...])
   */
  static getTypes = asyncHandler(async (req: Request, res: Response) => {
    const types = await Option.distinct("type");

    return new ApiResponse({
      res,
      status: 200,
      data: types,
      message: "Option types retrieved successfully",
    });
  });

  /**
   * Get options. Supports filtering by type, search (title/value), and pagination.
   */
  static getOptions = asyncHandler(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const sortBy = (req.query.sortBy as string) || "createdAt";
    let sortOrder: 1 | -1 = -1; // Default for createdAt is desc
    if (req.query.sortOrder === "asc") sortOrder = 1;
    else if (req.query.sortOrder === "desc") sortOrder = -1;
    else if (sortBy !== "createdAt") sortOrder = 1; // Default for other fields is asc

    const query: any = {};

    if (req.query.type) {
      query.type = req.query.type;
    }

    if (req.query.active !== undefined) {
      query.active = req.query.active === "true";
    }

    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search as string, "i");
      query.$or = [
        { title: searchRegex },
        { value: searchRegex },
      ];
    }

    const totalCount = await Option.countDocuments(query);
    const pagination = buildPagination({ page, limit, totalCount });

    const options = await Option.find(query)
      .skip(pagination.offset)
      .limit(pagination.limit)
      .sort({ [sortBy]: sortOrder });

    return new ApiResponse({
      res,
      status: 200,
      data: {
        docs: options,
        pagination,
      },
      message: "Options retrieved successfully",
    });
  });

  /**
   * Update an existing Option
   */
  static updateOption = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { title, type, active } = req.body;

    const option = await Option.findById(id);
    if (!option) {
      throw new ApiError({ status: 404, message: "Option not found" });
    }

    if (title) {
      option.title = title.trim();
      option.value = toSnakeCase(title);
    }
    
    if (type) {
      option.type = type.trim();
    }

    if (active !== undefined) {
      option.active = active;
    }

    // Check for unique conflict if title or type changed
    if (title || type) {
      const existing = await Option.findOne({ 
        _id: { $ne: id },
        type: option.type, 
        value: option.value 
      });
      
      if (existing) {
        throw new ApiError({ 
          status: 400, 
          message: `Option with title '${option.title}' already exists in type '${option.type}'` 
        });
      }
    }

    await option.save();

    return new ApiResponse({
      res,
      status: 200,
      data: option,
      message: "Option updated successfully",
    });
  });

  /**
   * Delete an Option
   */
  static deleteOption = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const option = await Option.findByIdAndDelete(id);
    
    if (!option) {
      throw new ApiError({ status: 404, message: "Option not found" });
    }

    return new ApiResponse({
      res,
      status: 200,
      data: null,
      message: "Option deleted successfully",
    });
  });
}
