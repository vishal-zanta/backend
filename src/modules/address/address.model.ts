import mongoose, { Schema } from 'mongoose';

// ==========================================
// 1. District Schema
// ==========================================
const DistrictSchema = new Schema({
  lgd_district_code: { type: Number, required: true, unique: true, index: true },
  name_en: { type: String, required: true },
  name_local: { type: String },
  sahyog_district_id: { type: Number }
}, { timestamps: true });

// ==========================================
// 2. Block Schema
// ==========================================
const BlockSchema = new Schema({
  lgd_block_code: { type: Number, required: true, unique: true, index: true },
  district_id: { type: Number, required: true, index: true },
  name_en: { type: String, required: true },
  name_local: { type: String }
}, { timestamps: true });

// ==========================================
// 3. Panchayat Schema
// ==========================================
const PanchayatSchema = new Schema({
  lgd_gp_code: { type: Number, required: true, unique: true, index: true },
  block_id: { type: Number, required: true, index: true },
  name_en: { type: String, required: true },
  name_local: { type: String }
}, { timestamps: true });

// ==========================================
// 4. Village Schema
// ==========================================
const VillageSchema = new Schema({
  lgd_village_code: { type: Number, required: true, unique: true, index: true },
  panchayat_id: { type: Number, required: true, index: true },
  block_id: { type: Number, required: true, index: true },
  name_en: { type: String, required: true }
}, { timestamps: true });

// ==========================================
// 5. Urban Local Body Schema
// ==========================================
const UrbanLocalBodySchema = new Schema({
  lgd_ulb_code: { type: Number, required: true, unique: true, index: true },
  district_id: { type: Number, required: true, index: true },
  name_en: { type: String, required: true },
  name_local: { type: String },
  type_en: { type: String },
  type_local: { type: String },
  type_code: { type: Number },
  census_2001_code: { type: String },
  district_source: { type: String }
}, { timestamps: true });

// ==========================================
// 6. Ward Schema
// ==========================================
const WardSchema = new Schema({
  lgd_ward_code: { type: Number, required: true, unique: true, index: true },
  ulb_id: { type: Number, required: true, index: true },
  ward_number: { type: Number, required: true },
  ward_name: { type: String, required: true }
}, { timestamps: true });

// ==========================================
// 7. Thana Schema
// ==========================================
const ThanaSchema = new Schema({
  thanas_id: { type: String, required: true, unique: true, index: true },
  sahyog_id: { type: String },
  name_en: { type: String, required: true },
  name_local: { type: String },
  lgd_block_codes: [{ type: Number, index: true }],
  lgd_ulb_codes: [{ type: Number, index: true }]
}, { timestamps: true });

// ==========================================
// Export Models
// ==========================================
export const DistrictModel = mongoose.model('District', DistrictSchema);
export const BlockModel = mongoose.model('Block', BlockSchema);
export const PanchayatModel = mongoose.model('Panchayat', PanchayatSchema);
export const VillageModel = mongoose.model('Village', VillageSchema);
export const UrbanLocalBodyModel = mongoose.model('UrbanLocalBody', UrbanLocalBodySchema);
export const WardModel = mongoose.model('Ward', WardSchema);
export const ThanaModel = mongoose.model('Thana', ThanaSchema);
