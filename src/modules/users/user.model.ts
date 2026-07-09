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
  isAdmin: boolean;
  district: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
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
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  phone:{
    type: String,
    required: true,
    unique: true,
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
  isAdmin:{
    type:Boolean,
    default:false
  }
}, {
  timestamps: true
});

userSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  this.password = await PasswordHelper.hash(this.password);
});

export const User = mongoose.model<IUser>('User', userSchema);
