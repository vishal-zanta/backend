import { Request, Response } from 'express';
import { DivisionModel, DistrictModel, SubdivisionModel, BlockModel, PanchayatModel, ThanaModel } from './address.model.js';
import { asyncHandler } from '../../middlewares/asyncHandler.js';
import ApiResponse from '../../utils/apiResponse.js';
import { ApiError } from '../../middlewares/errorHandler.js';
import mongoose from 'mongoose';
import { validateRequestFields } from '../../utils/helpers.js';

export class AddressController {
  
  // ==========================
  // HIERARCHY APIS
  // ==========================

  /**
   * Get all divisions
   */
  static getDivisions = asyncHandler(async (req: Request, res: Response) => {
    const divisions = await DivisionModel.find({}).sort({ name_en: 1 }).lean();
    return new ApiResponse({ res, status: 200, data: divisions, message: 'Divisions fetched successfully' });
  });

  /**
   * Get all districts (optional, backwards compatibility)
   */
  static getDistricts = asyncHandler(async (req: Request, res: Response) => {
    const districts = await DistrictModel.find({}).sort({ name_en: 1 }).lean();
    return new ApiResponse({ res, status: 200, data: districts, message: 'Districts fetched successfully' });
  });

  /**
   * Get districts for a specific division
   */
  static getDistrictsByDivision = asyncHandler(async (req: Request, res: Response) => {
    const { divisionId } = req.params;
    let query: any = { division_id: divisionId };
    
    if (mongoose.Types.ObjectId.isValid(divisionId as string)) {
      const division = await DivisionModel.findById(divisionId);
      if (!division) throw new ApiError({ status: 404, message: "Division not found" });
      query = { division_id: division.division_id };
    }

    const districts = await DistrictModel.find(query).sort({ name_en: 1 }).lean();
    return new ApiResponse({ res, status: 200, data: districts, message: 'Districts fetched successfully' });
  });

  /**
   * Get subdivisions for a specific district
   */
  static getSubdivisionsByDistrict = asyncHandler(async (req: Request, res: Response) => {
    const { districtId } = req.params;
    let query: any = { district_id: districtId };
    
    if (mongoose.Types.ObjectId.isValid(districtId as string)) {
      const district = await DistrictModel.findById(districtId);
      if (!district) throw new ApiError({ status: 404, message: "District not found" });
      query = { district_id: district.district_id };
    }

    const subdivisions = await SubdivisionModel.find(query).sort({ name_en: 1 }).lean();
    return new ApiResponse({ res, status: 200, data: subdivisions, message: 'Subdivisions fetched successfully' });
  });

  /**
   * Get blocks for a specific district (Legacy fallback if needed)
   */
  static getBlocksByDistrict = asyncHandler(async (req: Request, res: Response) => {
    const { districtId } = req.params;
    let query: any = { district_id: districtId };
    
    if (mongoose.Types.ObjectId.isValid(districtId as string)) {
      const district = await DistrictModel.findById(districtId);
      if (!district) throw new ApiError({ status: 404, message: "District not found" });
      query = { district_id: district.district_id };
    }

    const blocks = await BlockModel.find(query).sort({ name_en: 1 }).lean();
    return new ApiResponse({ res, status: 200, data: blocks, message: 'Blocks fetched successfully' });
  });

  /**
   * Get blocks for a specific subdivision
   */
  static getBlocksBySubdivision = asyncHandler(async (req: Request, res: Response) => {
    const { subdivisionId } = req.params;
    let query: any = { subdivision_id: subdivisionId };
    
    if (mongoose.Types.ObjectId.isValid(subdivisionId as string)) {
      const subdivision = await SubdivisionModel.findById(subdivisionId);
      if (!subdivision) throw new ApiError({ status: 404, message: "Subdivision not found" });
      query = { subdivision_id: subdivision.subdivision_id };
    }

    const blocks = await BlockModel.find(query).sort({ name_en: 1 }).lean();
    return new ApiResponse({ res, status: 200, data: blocks, message: 'Blocks fetched successfully' });
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
    return new ApiResponse({ res, status: 200, data: panchayats, message: 'Panchayats fetched successfully' });
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
    return new ApiResponse({ res, status: 200, data: thanas, message: 'Thanas fetched successfully' });
  });


  }
