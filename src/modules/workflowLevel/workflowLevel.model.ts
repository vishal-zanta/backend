import mongoose, { Schema, Document } from 'mongoose';

export interface IWorkflowLevelItem {
  order: number;
  role: mongoose.Types.ObjectId;
  description: string;
}

export interface IWorkflowLevel extends Document {
  department: mongoose.Types.ObjectId;
  levels: IWorkflowLevelItem[];
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const workflowLevelItemSchema = new Schema<IWorkflowLevelItem>({
  order: { type: Number, required: true },
  role: { type: mongoose.Schema.Types.ObjectId, ref: 'Role', required: true },
  description: { type: String }
});

const workflowLevelSchema = new Schema<IWorkflowLevel>({
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: true,
    unique: true
  },
  levels: {
    type: [workflowLevelItemSchema],
    default: []
  },
  active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

export const WorkflowLevel = mongoose.model<IWorkflowLevel>('WorkflowLevel', workflowLevelSchema);
