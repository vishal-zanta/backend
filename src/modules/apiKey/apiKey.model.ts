import mongoose, { Schema, Document } from 'mongoose';
import crypto from 'crypto';

export interface IApiKey extends Document {
  name: string;
  key: string;
  active: boolean;
  createdBy: mongoose.Types.ObjectId;
  lastUsed?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const apiKeySchema = new Schema<IApiKey>({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  key: {
    type: String,
    required: true,
    unique: true
  },
  active: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lastUsed: {
    type: Date
  }
}, { timestamps: true });

// Pre-save hook to generate API key if not provided
apiKeySchema.pre('validate', function() {
  if (!this.key) {
    this.key = crypto.randomBytes(32).toString('hex');
  }
});

export const ApiKey = mongoose.model<IApiKey>('ApiKey', apiKeySchema);
