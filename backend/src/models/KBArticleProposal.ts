import mongoose, { Schema, Document } from 'mongoose';

export interface IKBArticleProposal extends Document {
  deletedAt?: Date | null;
  tenantId: mongoose.Types.ObjectId;
  title: string;
  content: string;
  sourceTicketIds: mongoose.Types.ObjectId[];
  status: 'pending' | 'approved' | 'rejected';
  confidenceScore: number;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const KBArticleProposalSchema: Schema = new Schema(
  {
    deletedAt: { type: Date, default: null },
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    title: { type: String, required: true },
    content: { type: String, required: true },
    sourceTicketIds: [{ type: Schema.Types.ObjectId, ref: 'Ticket' }],
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending', index: true },
    confidenceScore: { type: Number, default: 0 },
    tags: { type: [String], default: [] },
  },
  { timestamps: true },
);

export default mongoose.model<IKBArticleProposal>('KBArticleProposal', KBArticleProposalSchema);
