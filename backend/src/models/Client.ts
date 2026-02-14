import mongoose, { Schema, Document } from 'mongoose';

export interface IClient extends Document {
  tenantId: mongoose.Types.ObjectId;
  name: string;
  domain?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ClientSchema: Schema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    name: { type: String, required: true },
    domain: { type: String },
  },
  { timestamps: true },
);

ClientSchema.index({ tenantId: 1, name: 1 }, { unique: true });

export default mongoose.model<IClient>('Client', ClientSchema);
