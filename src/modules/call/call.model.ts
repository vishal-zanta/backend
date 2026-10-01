import mongoose, { Schema, Document } from 'mongoose';

export interface ICall extends Document {
  callId: string;
  agent: mongoose.Types.ObjectId;
  duration: string;
  complaintId?: mongoose.Types.ObjectId;
  complaintIdString?: string;
  status: string;
  disposition: string;
  recordingUrl: string;
  recordingDuration: string;
  evidenceTagged: boolean;
  evidenceReason?: string;
  taggedBy?: mongoose.Types.ObjectId;
  taggedDate?: Date;
  citizenMobile: string;
  callType: string;
  createdAt: Date;
  updatedAt: Date;
}

const callSchema = new Schema<ICall>({
  callId: {
    type: String,
    required: true,
    unique: true
  },
  agent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  duration: {
    type: String
  },
  complaintId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Grievance'
  },
  complaintIdString: {
    type: String
  },
  status: {
    type: String,
    default: 'Pending'
  },
  disposition: {
    type: String
  },
  recordingUrl: {
    type: String,
    default: '/uploads/calls/test_call_recording_male.wav'
  },
  recordingDuration: {
    type: String
  },
  evidenceTagged: {
    type: Boolean,
    default: false
  },
  evidenceReason: {
    type: String
  },
  taggedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  taggedDate: {
    type: Date
  },
  citizenMobile: {
    type: String
  },
  callType: {
    type: String,
    enum: ['Inbound', 'Outbound'],
    default: 'Inbound'
  }
}, {
  timestamps: true
});

export const Call = mongoose.model<ICall>('Call', callSchema);
