import mongoose, { Schema, Document } from 'mongoose';

export interface IEmailAttachment {
  name: string;
  size: string;
}

export interface IEmail extends Document {
  emailId: string;
  messageId?: string; // IMAP Message-ID header for deduplication
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
  assignTo?: mongoose.Types.ObjectId; // User assigned to handle this email
  attachments: IEmailAttachment[];
  createdAt: Date;
  updatedAt: Date;
}

const EmailAttachmentSchema = new Schema<IEmailAttachment>({
  name: String,
  size: String,
}, { _id: false });

const EmailSchema = new Schema<IEmail>({
  emailId: { type: String, unique: true },
  messageId: { type: String, sparse: true, unique: true },
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
  assignTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  attachments: [EmailAttachmentSchema]
}, { timestamps: true });

// Auto-increment emailId like INM-001, INM-002, ...
EmailSchema.pre('save', async function () {
  if (!this.emailId) {
    const lastEmail = await mongoose.model('Email').findOne({
      emailId: { $regex: /^INM-\d+$/ }
    }).sort({ createdAt: -1 }).lean() as any;

    let nextNum = 1;
    if (lastEmail?.emailId) {
      const match = lastEmail.emailId.match(/INM-(\d+)/);
      if (match) {
        nextNum = parseInt(match[1], 10) + 1;
      }
    }
    this.emailId = `INM-${String(nextNum).padStart(3, '0')}`;
  }
});

export const Email = mongoose.model<IEmail>('Email', EmailSchema);
