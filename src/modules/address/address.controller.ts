import { Request, Response } from 'express';
import { DistrictModel, BlockModel, PanchayatModel, ThanaModel } from './address.model.js';
import { asyncHandler } from '../../middlewares/asyncHandler.js';
import ApiResponse from '../../utils/apiResponse.js';
import { ApiError } from '../../middlewares/errorHandler.js';
import mongoose from 'mongoose';

export class AddressController {
  
  /**
   * Get all districts
   */
  static getDistricts = asyncHandler(async (req: Request, res: Response) => {
    const districts = await DistrictModel.find({}).sort({ name_en: 1 }).lean();
    return new ApiResponse({
      res,
      status: 200,
      data: districts,
      message: 'Districts fetched successfully'
    });
  });

  /**
   * Get blocks for a specific district
   * Accepts either Mongoose ObjectId or String district_id
   */
  static getBlocksByDistrict = asyncHandler(async (req: Request, res: Response) => {
    const { districtId } = req.params;
    let query: any = { district_id: districtId };
    
    // If it's a valid mongoose ObjectId, fetch the district first to get its string ID
    if (mongoose.Types.ObjectId.isValid(districtId as string)) {
      const district = await DistrictModel.findById(districtId);
      if (!district) throw new ApiError({ status: 404, message: "District not found" });
      query = { district_id: district.district_id };
    }

    const blocks = await BlockModel.find(query).sort({ name_en: 1 }).lean();
    
    return new ApiResponse({
      res,
      status: 200,
      data: blocks,
      message: 'Blocks fetched successfully'
    });
  });

  /**
   * Get panchayats for a specific block
   */
  static getPanchayatsByBlock = asyncHandler(async (req: Request, res: Response) => {
    const { blockId } = req.params;
    let query: any = { block_id: blockId };

    if (mongoose.Types.ObjectId.isValid(blockId as string)) {
      const block = await BlockModel.findById(blockId);
      if (!block) throw new ApiError({ status: 404, message: "Block not found" });
      query = { block_id: block.block_id };
    }

    const panchayats = await PanchayatModel.find(query).sort({ name_en: 1 }).lean();

    return new ApiResponse({
      res,
      status: 200,
      data: panchayats,
      message: 'Panchayats fetched successfully'
    });
  });

  /**
   * Get thanas for a specific block
   */
  static getThanasByBlock = asyncHandler(async (req: Request, res: Response) => {
    const { blockId } = req.params;
    let query: any = { block_ids: blockId };

    if (mongoose.Types.ObjectId.isValid(blockId as string)) {
      const block = await BlockModel.findById(blockId);
      if (!block) throw new ApiError({ status: 404, message: "Block not found" });
      query = { block_ids: block.block_id };
    }

    const thanas = await ThanaModel.find(query).sort({ name_en: 1 }).lean();

    return new ApiResponse({
      res,
      status: 200,
      data: thanas,
      message: 'Thanas fetched successfully'
    });
  });

}
