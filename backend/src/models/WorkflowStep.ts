import mongoose, { Schema, Document } from 'mongoose';

export interface IWorkflowStep extends Document {
  tenantId: mongoose.Types.ObjectId;
  workflowRunId: mongoose.Types.ObjectId;
  stepType: string;
  inputSnapshot?: any;
  outputSnapshot?: any;
  createdAt: Date;
}

const WorkflowStepSchema: Schema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
  workflowRunId: { type: Schema.Types.ObjectId, ref: 'WorkflowRun', required: true, index: true },
  stepType: { type: String, required: true },
  inputSnapshot: { type: Schema.Types.Mixed },
  outputSnapshot: { type: Schema.Types.Mixed },
}, { timestamps: { createdAt: true, updatedAt: false } });

export default mongoose.model<IWorkflowStep>('WorkflowStep', WorkflowStepSchema);
