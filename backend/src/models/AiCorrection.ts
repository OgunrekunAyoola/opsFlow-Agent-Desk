import mongoose, { Schema, Document } from 'mongoose';

export interface IAiCorrection extends Document {
  tenantId: mongoose.Types.ObjectId;
  ticketId: mongoose.Types.ObjectId;
  originalQuestion: string;
  aiSuggestion: string;
  finalHumanAnswer: string;
  intent?: string;
  tags?: string[];
   editRatio?: number;
  createdAt: Date;
  updatedAt: Date;
}

const AiCorrectionSchema: Schema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    ticketId: { type: Schema.Types.ObjectId, ref: 'Ticket', required: true, index: true },
    originalQuestion: { type: String, required: true },
    aiSuggestion: { type: String, required: true },
    finalHumanAnswer: { type: String, required: true },
    intent: { type: String },
    tags: { type: [String], default: [] },
    editRatio: { type: Number },
  },
  { timestamps: true },
);

AiCorrectionSchema.index({ tenantId: 1, ticketId: 1, createdAt: -1 });

export default mongoose.model<IAiCorrection>('AiCorrection', AiCorrectionSchema);
