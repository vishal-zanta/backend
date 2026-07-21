import mongoose, { Schema, Document } from 'mongoose';
import { PasswordHelper } from '../../utils/passwordHelper.js';

export interface IUser extends Document {
  userCode: string;
  name: string;
  email: string;
  password: string;
  phone: string;
  role: mongoose.Types.ObjectId;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  // isAdmin: boolean;
  escalatedCount: number;
  lastLogin?: Date;
  district: mongoose.Types.ObjectId;
  adminLogout?: Date;
  isBreak: boolean;
  createdAt: Date;
  updatedAt: Date;
  loginId?: string;
  isPasswordResetMandatory: boolean;
  skills?: mongoose.Types.ObjectId[];
  preferredLanguages?: string[];
}

const userSchema = new Schema<IUser>({
  userCode: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    unique: true,
    sparse: true,
    trim: true,
    lowercase: true
  },
  phone:{
    type: String,
    unique: true,
    sparse: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Role',
    // required: true
  },
  district: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Demography'
  },
  status: {
    type: String,
    enum: ['ACTIVE', 'INACTIVE', 'SUSPENDED'],
    default: 'ACTIVE'
  },
  // isAdmin:{
  //   type:Boolean,
  //   default:false
  // },
  escalatedCount: {
    type: Number,
    default: 0
  },
  lastLogin: {
    type: Date
  },
  adminLogout: {
    type: Date
  },
  isBreak: {
    type: Boolean,
    default: false
  },
  loginId: {
    type: String,
    unique: true,
    sparse: true
  },
  isPasswordResetMandatory: {
    type: Boolean,
    default: true
  },
  skills: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Skill'
  }],
  preferredLanguages: [{
    type: String
  }]
}, {
  timestamps: true
});

userSchema.pre('save', async function() {
  if (this.isNew && !this.loginId) {
    // Generate an 8-character uppercase alphanumeric ID
    this.loginId = Math.random().toString(36).substring(2, 10).toUpperCase();
  }
  if (!this.isModified('password')) return;
  this.password = await PasswordHelper.hash(this.password);
});

export const User = mongoose.model<IUser>('User', userSchema);
