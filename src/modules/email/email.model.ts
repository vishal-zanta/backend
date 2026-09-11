import mongoose, { Schema, Document } from 'mongoose';

export interface IEmailAttachment {
  name: string;
  size: string;
}

export interface IEmail extends Document {
  emailId: string;
  from: string;
  fromName: string;
  fromEmail: string;
  to: string;
  cc: string;
  bcc: string;
  subject: string;
  body: string;
  receivedAt: Date;
  status: 'PENDING' | 'CONVERTED' | 'REJECTED' | 'CLOSED';
  rejectionReason?: string;
  closeReason?: string;
  complaintId?: string; // e.g. BH-2026-049811
  grievance?: mongoose.Types.ObjectId; // Foreign key linking to actual Grievance document
  attachments: IEmailAttachment[];
  createdAt: Date;
  updatedAt: Date;
}

const EmailAttachmentSchema = new Schema<IEmailAttachment>({
  name: String,
  size: String,
}, { _id: false });

const EmailSchema = new Schema<IEmail>({
  emailId: { type: String, required: true, unique: true },
  from: { type: String, required: true },
  fromName: { type: String },
  fromEmail: { type: String },
  to: { type: String },
  cc: { type: String },
  bcc: { type: String },
  subject: { type: String },
  body: { type: String },
  receivedAt: { type: Date },
  status: {
    type: String,
    enum: ['PENDING', 'CONVERTED', 'REJECTED', 'CLOSED'],
    default: 'PENDING'
  },
  rejectionReason: String,
  closeReason: String,
  complaintId: String,
  grievance: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Grievance'
  },
  attachments: [EmailAttachmentSchema]
}, { timestamps: true });

export const Email = mongoose.model<IEmail>('Email', EmailSchema);
