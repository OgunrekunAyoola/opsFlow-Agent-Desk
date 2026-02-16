import mongoose, { Schema, Document } from 'mongoose';

export interface ITenant extends Document {
  name: string;
  slug?: string;
  inboundAddress?: string;
  inboundSecret?: string;
  autoReplyEnabled?: boolean;
  autoReplyConfidenceThreshold?: number;
  autoReplySafeCategories?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const TenantSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, unique: true, sparse: true },
    inboundAddress: { type: String, unique: true, sparse: true },
    inboundSecret: { type: String, unique: true, sparse: true },
    autoReplyEnabled: { type: Boolean, default: false },
    autoReplyConfidenceThreshold: { type: Number, default: 0.9 },
    autoReplySafeCategories: {
      type: [String],
      default: ['general', 'feature_request'],
    },
  },
  { timestamps: true },
);

export default mongoose.model<ITenant>('Tenant', TenantSchema);
