import mongoose, { Schema, Document } from 'mongoose';

export interface ISyncedObject extends Document {
  tenantId: mongoose.Types.ObjectId;
  integrationConnectionId: mongoose.Types.ObjectId;
  provider: string;
  externalId: string;
  type: 'ticket' | 'message' | 'customer' | 'doc' | 'order';
  internalId?: mongoose.Types.ObjectId; // Reference to Ticket, KBArticle, etc.
  lastSyncedAt: Date;
  hash?: string; // To detect changes
  createdAt: Date;
  updatedAt: Date;
}

const SyncedObjectSchema: Schema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true },
    integrationConnectionId: {
      type: Schema.Types.ObjectId,
      ref: 'IntegrationConnection',
      required: true,
    },
    provider: { type: String, required: true },
    externalId: { type: String, required: true },
    type: { type: String, enum: ['ticket', 'message', 'customer', 'doc', 'order'], required: true },
    internalId: { type: Schema.Types.ObjectId }, // Dynamic ref based on type
    lastSyncedAt: { type: Date, default: Date.now },
    hash: { type: String },
  },
  { timestamps: true },
);

SyncedObjectSchema.index({ tenantId: 1, provider: 1, externalId: 1 }, { unique: true });
SyncedObjectSchema.index({ internalId: 1 });

export default mongoose.model<ISyncedObject>('SyncedObject', SyncedObjectSchema);
