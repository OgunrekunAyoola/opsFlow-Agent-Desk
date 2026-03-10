import mongoose, { Schema, Document } from 'mongoose';

export interface ITenant extends Document {
  name: string;
  slug?: string;
  inboundAddress?: string;
  inboundSecret?: string;
  ingestApiKey?: string;
  supportEmail?: string;
  autoTriageOnInbound?: boolean;
  autoReplyEnabled?: boolean;
  autoReplyConfidenceThreshold?: number;
  autoReplySafeCategories?: string[];
  lastInboundAt?: Date;
  zendeskSubdomain?: string;
  zendeskClientId?: string;
  zendeskToken?: string;
  zendeskRefreshToken?: string;
  zendeskTokenExpiresAt?: Date;
  aiDraftEnabled?: boolean;
  aiUsePastTickets?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const TenantSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, unique: true, sparse: true },
    inboundAddress: { type: String, unique: true, sparse: true },
    inboundSecret: { type: String, unique: true, sparse: true },
    supportEmail: { type: String },
    autoTriageOnInbound: { type: Boolean, default: false },
    autoReplyEnabled: { type: Boolean, default: false },
    autoReplyConfidenceThreshold: { type: Number, default: 0.9 },
    autoReplySafeCategories: {
      type: [String],
      default: ['general', 'feature_request'],
    },
    lastInboundAt: { type: Date },
    zendeskSubdomain: { type: String },
    zendeskClientId: { type: String },
    zendeskToken: { type: String },
    zendeskRefreshToken: { type: String },
    zendeskTokenExpiresAt: { type: Date },
    aiDraftEnabled: { type: Boolean, default: true },
    aiUsePastTickets: { type: Boolean, default: true },
    ingestApiKey: { type: String, unique: true, sparse: true },
  },
  { timestamps: true },
);

export default mongoose.model<ITenant>('Tenant', TenantSchema);
