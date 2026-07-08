import mongoose, { Schema, Document } from 'mongoose';

export interface IWorkflowLevel extends Document {
  order: number;
  role: mongoose.Types.ObjectId;
  description: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const workflowLevelSchema = new Schema<IWorkflowLevel>({
  order: {
    type: Number,
    required: true
  },
  role: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Role',
    required: true
  },
  description: {
    type: String,
    required: true
  },
  active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

export const WorkflowLevel = mongoose.model<IWorkflowLevel>('WorkflowLevel', workflowLevelSchema);
