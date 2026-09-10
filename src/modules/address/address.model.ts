import mongoose, { Schema, Document } from 'mongoose';

// ==========================================
// 1. District Schema
// ==========================================
export interface IDistrict extends Document {
  district_id: string;
  sahyog_id?: string;
  name_en: string;
  name_local?: string;
  lgd_code?: number;
}

const DistrictSchema = new Schema<IDistrict>({
  district_id: { type: String, required: true, unique: true, index: true },
  sahyog_id: { type: String },
  name_en: { type: String, required: true },
  name_local: { type: String },
  lgd_code: { type: Number }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual to easily fetch all blocks in this district
DistrictSchema.virtual('blocks', {
  ref: 'Block',
  localField: 'district_id',
  foreignField: 'district_id',
  justOne: false
});

// ==========================================
// 2. Block Schema
// ==========================================
export interface IBlock extends Document {
  block_id: string;
  district_id: string;
  sahyog_id?: string;
  name_en: string;
  name_local?: string;
  lgd_code?: number;
}

const BlockSchema = new Schema<IBlock>({
  block_id: { type: String, required: true, unique: true, index: true },
  district_id: { type: String, required: true, index: true },
  sahyog_id: { type: String },
  name_en: { type: String, required: true },
  name_local: { type: String },
  lgd_code: { type: Number }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual to fetch the parent district document
BlockSchema.virtual('district', {
  ref: 'District',
  localField: 'district_id',
  foreignField: 'district_id',
  justOne: true
});

// Virtual to fetch all panchayats in this block
BlockSchema.virtual('panchayats', {
  ref: 'Panchayat',
  localField: 'block_id',
  foreignField: 'block_id',
  justOne: false
});

// Virtual to fetch all thanas linked to this block
BlockSchema.virtual('thanas', {
  ref: 'Thana',
  localField: 'block_id',
  foreignField: 'block_ids',
  justOne: false
});

// ==========================================
// 3. Panchayat Schema
// ==========================================
export interface IPanchayat extends Document {
  panchayat_id: string;
  block_id: string;
  name_en: string;
  name_local?: string;
  lgd_code?: number;
}

const PanchayatSchema = new Schema<IPanchayat>({
  panchayat_id: { type: String, required: true, unique: true, index: true },
  block_id: { type: String, required: true, index: true },
  name_en: { type: String, required: true },
  name_local: { type: String },
  lgd_code: { type: Number }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual to fetch the parent block document
PanchayatSchema.virtual('block', {
  ref: 'Block',
  localField: 'block_id',
  foreignField: 'block_id',
  justOne: true
});

// ==========================================
// 4. Thana Schema
// ==========================================
export interface IThana extends Document {
  thanas_id: string;
  sahyog_id?: string;
  name_en: string;
  name_local?: string;
  block_ids: string[];
}

const ThanaSchema = new Schema<IThana>({
  thanas_id: { type: String, required: true, unique: true, index: true },
  sahyog_id: { type: String },
  name_en: { type: String, required: true },
  name_local: { type: String },
  block_ids: [{ type: String, index: true }]
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual to fetch all parent block documents
ThanaSchema.virtual('blocks', {
  ref: 'Block',
  localField: 'block_ids',
  foreignField: 'block_id',
  justOne: false
});

// ==========================================
// Export Models
// ==========================================
export const DistrictModel = mongoose.model<IDistrict>('District', DistrictSchema);
export const BlockModel = mongoose.model<IBlock>('Block', BlockSchema);
export const PanchayatModel = mongoose.model<IPanchayat>('Panchayat', PanchayatSchema);
export const ThanaModel = mongoose.model<IThana>('Thana', ThanaSchema);

