import mongoose, { Schema, Document } from 'mongoose';

export interface ITenant extends Document {
  deletedAt?: Date | null;
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
  onboarded?: boolean;
  industry?: string;
  teamSize?: string;
  brandTone?: 'professional' | 'friendly' | 'concise';
  escalationThreshold?: number;
  tier: 'starter' | 'growth' | 'enterprise';
  createdAt?: Date;
  updatedAt?: Date;
}

const TenantSchema: Schema = new Schema(
  {
    deletedAt: { type: Date, default: null },
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
    onboarded: { type: Boolean, default: false },
    industry: { type: String },
    teamSize: { type: String },
    brandTone: { type: String, enum: ['professional', 'friendly', 'concise'], default: 'professional' },
    escalationThreshold: { type: Number, default: 70 },
    tier: { type: String, enum: ['starter', 'growth', 'enterprise'], default: 'starter', index: true },
  },
  { timestamps: true },
);

export default mongoose.model<ITenant>('Tenant', TenantSchema);
