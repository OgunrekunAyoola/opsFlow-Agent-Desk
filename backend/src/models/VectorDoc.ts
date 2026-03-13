import mongoose, { Schema, Document } from 'mongoose';

export interface IVectorDoc extends Document {
  deletedAt?: Date | null;
  tenantId: mongoose.Types.ObjectId;
  sourceType: 'ticket' | 'doc' | 'web' | 'integration';
  sourceId: string;
  content: string;
  metadata?: Record<string, any>;
  embedding: number[];
  createdAt: Date;
  updatedAt: Date;
}

const VectorDocSchema: Schema = new Schema(
  {
    deletedAt: { type: Date, default: null },
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    sourceType: { type: String, required: true, enum: ['ticket', 'doc', 'web', 'integration'] },
    sourceId: { type: String, required: true },
    content: { type: String, required: true },
    metadata: { type: Schema.Types.Mixed },
    embedding: { type: [Number], required: true },
  },
  { timestamps: true },
);

VectorDocSchema.index({ tenantId: 1, sourceType: 1, sourceId: 1 }, { unique: true });

export default mongoose.model<IVectorDoc>('VectorDoc', VectorDocSchema);
