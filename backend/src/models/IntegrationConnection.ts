import mongoose, { Schema, Document } from 'mongoose';
import { encrypt, decrypt } from '../utils/encryption';

export interface IIntegrationConnection extends Document {
  deletedAt?: Date | null;
  tenantId: mongoose.Types.ObjectId;
  provider: string; // 'slack', 'gmail', 'zendesk', 'dummy'
  integrationId: string; // unique identifier from provider if applicable
  accessToken?: string; // Encrypt this in real prod
  refreshToken?: string; // Encrypt this in real prod
  expiresAt?: Date;
  profile?: any; // Store user profile from provider
  status: 'active' | 'error' | 'disconnected';
  config?: any; // Provider specific config (e.g. channels to sync)
  lastSyncAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const IntegrationConnectionSchema: Schema = new Schema(
  {
    deletedAt: { type: Date, default: null },
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true },
    provider: { type: String, required: true },
    integrationId: { type: String },
    accessToken: {
      type: String,
      set: (v: string) => encrypt(v),
      get: (v: string) => decrypt(v),
    },
    refreshToken: {
      type: String,
      set: (v: string) => encrypt(v),
      get: (v: string) => decrypt(v),
    },
    expiresAt: { type: Date },
    profile: { type: Schema.Types.Mixed },
    status: { type: String, enum: ['active', 'error', 'disconnected'], default: 'active' },
    config: { type: Schema.Types.Mixed, default: {} },
    lastSyncAt: { type: Date },
  },
  {
    timestamps: true,
    toJSON: { getters: true, virtuals: true }, // Ensure decrypted values are available when converting to JSON
    toObject: { getters: true, virtuals: true },
  },
);

// Ensure a tenant only has one active connection per provider (optional constraint, but good for now)
IntegrationConnectionSchema.index({ tenantId: 1, provider: 1 }, { unique: true });

export default mongoose.model<IIntegrationConnection>(
  'IntegrationConnection',
  IntegrationConnectionSchema,
);
