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
   * Get blocks for specific district(s)
   */
  static getBlocksByDistrict = asyncHandler(async (req: Request, res: Response) => {
    const { districtId } = req.params;
    const districtIds = (districtId as string).split(',');
    const districts = await DistrictModel.find({ _id: { $in: districtIds } });
    const lgdCodes = districts.map(d => Number(d.lgd_district_code)).filter(c => !isNaN(c));
    const blocks = await BlockModel.find({ district_id: { $in: lgdCodes } }).sort({ name_en: 1 }).lean();
    return new ApiResponse({ res, status: 200, data: blocks, message: 'Blocks fetched successfully' });
  });

  /**
   * Get Urban Local Bodies for specific district(s)
   */
  static getUrbanLocalBodiesByDistrict = asyncHandler(async (req: Request, res: Response) => {
    const { districtId } = req.params;
    const districtIds = (districtId as string).split(',');
    const districts = await DistrictModel.find({ _id: { $in: districtIds } });
    const lgdCodes = districts.map(d => Number(d.lgd_district_code)).filter(c => !isNaN(c));
    const ulbs = await UrbanLocalBodyModel.find({ district_id: { $in: lgdCodes } }).sort({ name_en: 1 }).lean();
    return new ApiResponse({ res, status: 200, data: ulbs, message: 'Urban Local Bodies fetched successfully' });
  });

  /**
   * Get panchayats for specific block(s)
   */
  static getPanchayatsByBlock = asyncHandler(async (req: Request, res: Response) => {
    const { blockId } = req.params;
    const blockIds = (blockId as string).split(',');
    const blocks = await BlockModel.find({ _id: { $in: blockIds } });
    const lgdCodes = blocks.map(b => Number(b.lgd_block_code)).filter(c => !isNaN(c));
    const panchayats = await PanchayatModel.find({ block_id: { $in: lgdCodes } }).sort({ name_en: 1 }).lean();
    return new ApiResponse({ res, status: 200, data: panchayats, message: 'Panchayats fetched successfully' });
  });

  /**
   * Get villages for specific panchayat(s)
   */
  static getVillagesByPanchayat = asyncHandler(async (req: Request, res: Response) => {
    const { panchayatId } = req.params;
    const panchayatIds = (panchayatId as string).split(',');
    const panchayats = await PanchayatModel.find({ _id: { $in: panchayatIds } });
    const lgdCodes = panchayats.map(p => Number(p.lgd_gp_code)).filter(c => !isNaN(c));
    const villages = await VillageModel.find({ panchayat_id: { $in: lgdCodes } }).sort({ name_en: 1 }).lean();
    return new ApiResponse({ res, status: 200, data: villages, message: 'Villages fetched successfully' });
  });

  /**
   * Get wards for specific Urban Local Body(ies)
   */
  static getWardsByUlb = asyncHandler(async (req: Request, res: Response) => {
    const { ulbId } = req.params;
    const ulbIds = (ulbId as string).split(',');
    const ulbs = await UrbanLocalBodyModel.find({ _id: { $in: ulbIds } });
    const lgdCodes = ulbs.map(u => Number(u.lgd_ulb_code)).filter(c => !isNaN(c));
    const wards = await WardModel.find({ ulb_id: { $in: lgdCodes } }).sort({ ward_number: 1 }).lean();
    return new ApiResponse({ res, status: 200, data: wards, message: 'Wards fetched successfully' });
  });

  /**
   * Get thanas for specific district(s)
   */
  static getThanasByDistrict = asyncHandler(async (req: Request, res: Response) => {
    const { districtId } = req.params;
    const districtIds = (districtId as string).split(',');
    const districts = await DistrictModel.find({ _id: { $in: districtIds } });
    const lgdCodes = districts.map(d => Number(d.lgd_district_code)).filter(c => !isNaN(c));
    const thanas = await ThanaModel.find({ district_id: { $in: lgdCodes } }).sort({ name_en: 1 }).lean();
    return new ApiResponse({ res, status: 200, data: thanas, message: 'Thanas fetched successfully' });
  });

}
