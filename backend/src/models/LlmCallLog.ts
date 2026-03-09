import mongoose, { Schema, Document } from 'mongoose';

export interface ILlmCallLog extends Document {
  tenantId?: mongoose.Types.ObjectId;
  ticketId?: mongoose.Types.ObjectId;
  task: 'classification' | 'answer_generation' | 'self_eval';
  modelName: string;
  success: boolean;
  errorMessage?: string;
  latencyMs: number;
  createdAt: Date;
}

const LlmCallLogSchema: Schema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', index: true },
    ticketId: { type: Schema.Types.ObjectId, ref: 'Ticket', index: true },
    task: {
      type: String,
      enum: ['classification', 'answer_generation', 'self_eval'],
      required: true,
      index: true,
    },
    modelName: { type: String, required: true },
    success: { type: Boolean, required: true },
    errorMessage: { type: String },
    latencyMs: { type: Number, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

export default mongoose.model<ILlmCallLog>('LlmCallLog', LlmCallLogSchema);
