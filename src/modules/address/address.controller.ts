import { Request, Response } from 'express';
import { DistrictModel, BlockModel, PanchayatModel, VillageModel, UrbanLocalBodyModel, WardModel, ThanaModel } from './address.model.js';
import { asyncHandler } from '../../middlewares/asyncHandler.js';
import ApiResponse from '../../utils/apiResponse.js';

export class AddressController {
  
  // ==========================
  // HIERARCHY APIS
  // ==========================

  /**
   * Get all districts
   */
  static getDistricts = asyncHandler(async (req: Request, res: Response) => {
    const districts = await DistrictModel.find({}).sort({ name_en: 1 }).lean();
    return new ApiResponse({ res, status: 200, data: districts, message: 'Districts fetched successfully' });
  });

  /**
   * Get blocks for a specific district
   */
  static getBlocksByDistrict = asyncHandler(async (req: Request, res: Response) => {
    const { districtId } = req.params;
    const district=await DistrictModel.findById(districtId)
    const blocks = await BlockModel.find({ district_id: Number(district?.lgd_district_code) }).sort({ name_en: 1 }).lean();
    return new ApiResponse({ res, status: 200, data: blocks, message: 'Blocks fetched successfully' });
  });

  /**
   * Get Urban Local Bodies for a specific district
   */
  static getUrbanLocalBodiesByDistrict = asyncHandler(async (req: Request, res: Response) => {
    const { districtId } = req.params;
    const district=await DistrictModel.findById(districtId)
    const ulbs = await UrbanLocalBodyModel.find({ district_id: Number(district?.lgd_district_code) }).sort({ name_en: 1 }).lean();
    return new ApiResponse({ res, status: 200, data: ulbs, message: 'Urban Local Bodies fetched successfully' });
  });

  /**
   * Get panchayats for a specific block
   */
  static getPanchayatsByBlock = asyncHandler(async (req: Request, res: Response) => {
    const { blockId } = req.params;
    const block=await BlockModel.findById(blockId)
    const panchayats = await PanchayatModel.find({ block_id: Number(block?.lgd_block_code) }).sort({ name_en: 1 }).lean();
    return new ApiResponse({ res, status: 200, data: panchayats, message: 'Panchayats fetched successfully' });
  });

  /**
   * Get villages for a specific panchayat
   */
  static getVillagesByPanchayat = asyncHandler(async (req: Request, res: Response) => {
    const { panchayatId } = req.params;
    const panchayat=await PanchayatModel.findById(panchayatId);
    const villages = await VillageModel.find({ panchayat_id: Number(panchayat?.lgd_gp_code) }).sort({ name_en: 1 }).lean();
    return new ApiResponse({ res, status: 200, data: villages, message: 'Villages fetched successfully' });
  });

  /**
   * Get wards for a specific Urban Local Body
   */
  static getWardsByUlb = asyncHandler(async (req: Request, res: Response) => {
    const { ulbId } = req.params;
    const ulb=await UrbanLocalBodyModel.findById(ulbId)
    const wards = await WardModel.find({ ulb_id: Number(ulb?.lgd_ulb_code) }).sort({ ward_number: 1 }).lean();
    return new ApiResponse({ res, status: 200, data: wards, message: 'Wards fetched successfully' });
  });

  /**
   * Get thanas for a specific block
   */
  static getThanasByBlock = asyncHandler(async (req: Request, res: Response) => {
    const { blockId } = req.params;
    const thanas = await ThanaModel.find({ lgd_block_codes: Number(blockId) }).sort({ name_en: 1 }).lean();
    return new ApiResponse({ res, status: 200, data: thanas, message: 'Thanas fetched successfully' });
  });

  /**
   * Get thanas for a specific ulb
   */
  static getThanasByUlb = asyncHandler(async (req: Request, res: Response) => {
    const { ulbId } = req.params;
    const thanas = await ThanaModel.find({ lgd_ulb_codes: Number(ulbId) }).sort({ name_en: 1 }).lean();
    return new ApiResponse({ res, status: 200, data: thanas, message: 'Thanas fetched successfully' });
  });

}
