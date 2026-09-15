import mongoose, { Schema, Document } from 'mongoose';

export interface IOfficerTagging extends Document {
  officer: mongoose.Types.ObjectId;
  services: mongoose.Types.ObjectId[];
  blocks: mongoose.Types.ObjectId[];
  panchayats: mongoose.Types.ObjectId[];
  urbanPanchayats: mongoose.Types.ObjectId[];
  wards: mongoose.Types.ObjectId[];
  areaType:string[];
  districts:mongoose.Types.ObjectId[];


  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const officerTaggingSchema = new Schema<IOfficerTagging>({
  officer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
 
  services: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service'
  }],

  areaType:[String],
  districts:[{
     type: mongoose.Schema.Types.ObjectId,
    ref: 'District'
  }],
  blocks:[{
     type: mongoose.Schema.Types.ObjectId,
    ref: 'Block'
  }],
  panchayats:[{
     type: mongoose.Schema.Types.ObjectId,
    ref: 'Panchayat'
  }],
  urbanPanchayats:[{
     type: mongoose.Schema.Types.ObjectId,
    ref: 'UrbanLocalBody'
  }],
  wards:[{
     type: mongoose.Schema.Types.ObjectId,
    ref: 'Ward'
  }],
  active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

export const OfficerTagging = mongoose.model<IOfficerTagging>('OfficerTagging', officerTaggingSchema);
