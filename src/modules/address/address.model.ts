import mongoose, { Schema, Document } from 'mongoose';

// ==========================================
// 1. Division Schema
// ==========================================
export interface IDivision extends Document {
  division_id: string;
  sahyog_id?: string;
  name_en: string;
  name_local?: string;
}

const DivisionSchema = new Schema<IDivision>({
  division_id: { type: String, required: true, unique: true, index: true },
  sahyog_id: { type: String },
  name_en: { type: String, required: true },
  name_local: { type: String }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

DivisionSchema.virtual('districts', {
  ref: 'District',
  localField: 'division_id',
  foreignField: 'division_id',
  justOne: false
});

// ==========================================
// 2. District Schema
// ==========================================
export interface IDistrict extends Document {
  district_id: string;
  division_id?: string;
  sahyog_id?: string;
  name_en: string;
  name_local?: string;
  lgd_code?: number;
}

const DistrictSchema = new Schema<IDistrict>({
  district_id: { type: String, required: true, unique: true, index: true },
  division_id: { type: String, index: true },
  sahyog_id: { type: String },
  name_en: { type: String, required: true },
  name_local: { type: String },
  lgd_code: { type: Number }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

DistrictSchema.virtual('division', {
  ref: 'Division',
  localField: 'division_id',
  foreignField: 'division_id',
  justOne: true
});

DistrictSchema.virtual('subdivisions', {
  ref: 'Subdivision',
  localField: 'district_id',
  foreignField: 'district_id',
  justOne: false
});

DistrictSchema.virtual('blocks', {
  ref: 'Block',
  localField: 'district_id',
  foreignField: 'district_id',
  justOne: false
});

// ==========================================
// 3. Subdivision Schema
// ==========================================
export interface ISubdivision extends Document {
  subdivision_id: string;
  district_id: string;
  sahyog_id?: string;
  name_en: string;
  name_local?: string;
}

const SubdivisionSchema = new Schema<ISubdivision>({
  subdivision_id: { type: String, required: true, unique: true, index: true },
  district_id: { type: String, required: true, index: true },
  sahyog_id: { type: String },
  name_en: { type: String, required: true },
  name_local: { type: String }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

SubdivisionSchema.virtual('district', {
  ref: 'District',
  localField: 'district_id',
  foreignField: 'district_id',
  justOne: true
});

SubdivisionSchema.virtual('blocks', {
  ref: 'Block',
  localField: 'subdivision_id',
  foreignField: 'subdivision_id',
  justOne: false
});

// ==========================================
// 4. Block Schema
// ==========================================
export interface IBlock extends Document {
  block_id: string;
  district_id: string;
  subdivision_id?: string;
  sahyog_id?: string;
  name_en: string;
  name_local?: string;
  lgd_code?: number;
}

const BlockSchema = new Schema<IBlock>({
  block_id: { type: String, required: true, unique: true, index: true },
  district_id: { type: String, required: true, index: true },
  subdivision_id: { type: String, index: true },
  sahyog_id: { type: String },
  name_en: { type: String, required: true },
  name_local: { type: String },
  lgd_code: { type: Number }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

BlockSchema.virtual('district', {
  ref: 'District',
  localField: 'district_id',
  foreignField: 'district_id',
  justOne: true
});

BlockSchema.virtual('subdivision', {
  ref: 'Subdivision',
  localField: 'subdivision_id',
  foreignField: 'subdivision_id',
  justOne: true
});

BlockSchema.virtual('panchayats', {
  ref: 'Panchayat',
  localField: 'block_id',
  foreignField: 'block_id',
  justOne: false
});

BlockSchema.virtual('thanas', {
  ref: 'Thana',
  localField: 'block_id',
  foreignField: 'block_ids',
  justOne: false
});

// ==========================================
// 5. Panchayat Schema
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

PanchayatSchema.virtual('block', {
  ref: 'Block',
  localField: 'block_id',
  foreignField: 'block_id',
  justOne: true
});

// ==========================================
// 6. Thana Schema
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

ThanaSchema.virtual('blocks', {
  ref: 'Block',
  localField: 'block_ids',
  foreignField: 'block_id',
  justOne: false
});

// ==========================================
// Export Models
// ==========================================
export const DivisionModel = mongoose.model<IDivision>('Division', DivisionSchema);
export const DistrictModel = mongoose.model<IDistrict>('District', DistrictSchema);
export const SubdivisionModel = mongoose.model<ISubdivision>('Subdivision', SubdivisionSchema);
export const BlockModel = mongoose.model<IBlock>('Block', BlockSchema);
export const PanchayatModel = mongoose.model<IPanchayat>('Panchayat', PanchayatSchema);
export const ThanaModel = mongoose.model<IThana>('Thana', ThanaSchema);

