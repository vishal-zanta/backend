import mongoose, { Schema, Document } from 'mongoose';

export interface IOfficerTagging extends Document {
  officer: mongoose.Types.ObjectId;
  services: mongoose.Types.ObjectId[];
  subdivisions: mongoose.Types.ObjectId[];
  divisions: mongoose.Types.ObjectId[];

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
  subdivisions:[{
     type: mongoose.Schema.Types.ObjectId,
    ref: 'Subdivision'
  }],
  divisions:[{
     type: mongoose.Schema.Types.ObjectId,
    ref: 'Division'
  }],
  active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

export const OfficerTagging = mongoose.model<IOfficerTagging>('OfficerTagging', officerTaggingSchema);
