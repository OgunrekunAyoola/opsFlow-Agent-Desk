import mongoose, { Schema, Document } from 'mongoose';

export interface ITenant extends Document {
  name: string;
  slug?: string;
  inboundAddress?: string;
  inboundSecret?: string;
  createdAt: Date;
  updatedAt: Date;
}

const TenantSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, unique: true, sparse: true },
    inboundAddress: { type: String, unique: true, sparse: true },
    inboundSecret: { type: String, unique: true, sparse: true },
  },
  { timestamps: true },
);

export default mongoose.model<ITenant>('Tenant', TenantSchema);
