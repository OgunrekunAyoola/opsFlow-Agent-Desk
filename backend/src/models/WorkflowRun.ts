import mongoose, { Schema, Document } from 'mongoose';

export interface IWorkflowRun extends Document {
  tenantId: mongoose.Types.ObjectId;
  type: 'ticket_triage';
  ticketId: mongoose.Types.ObjectId;
  status: 'running' | 'succeeded' | 'failed';
  startedByUserId?: mongoose.Types.ObjectId;
  startedAt: Date;
  finishedAt?: Date;
  errorMessage?: string;
}

const WorkflowRunSchema: Schema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
  type: { type: String, enum: ['ticket_triage'], required: true },
  ticketId: { type: Schema.Types.ObjectId, ref: 'Ticket', required: true, index: true },
  status: { type: String, enum: ['running', 'succeeded', 'failed'], default: 'running' },
  startedByUserId: { type: Schema.Types.ObjectId, ref: 'User' },
  startedAt: { type: Date, default: Date.now },
  finishedAt: { type: Date },
  errorMessage: { type: String },
});

export default mongoose.model<IWorkflowRun>('WorkflowRun', WorkflowRunSchema);
