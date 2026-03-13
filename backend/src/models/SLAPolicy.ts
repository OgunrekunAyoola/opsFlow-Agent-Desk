import mongoose, { Schema, Document } from 'mongoose';

export interface ISLAPolicy extends Document {
  deletedAt?: Date | null;
  tenantId: mongoose.Types.ObjectId;
  name: string;
  tier: 'starter' | 'growth' | 'enterprise';
  firstResponseTarget: number; // in minutes
  resolutionTarget: number;    // in minutes
  businessHoursOnly: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SLAPolicySchema: Schema = new Schema(
  {
    deletedAt: { type: Date, default: null },
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    name: { type: String, required: true },
    tier: { type: String, enum: ['starter', 'growth', 'enterprise'], required: true },
    firstResponseTarget: { type: Number, required: true },
    resolutionTarget: { type: Number, required: true },
    businessHoursOnly: { type: Boolean, default: true },
  },
  { timestamps: true },
);

// Ensure policy names are unique per tenant
SLAPolicySchema.index({ tenantId: 1, name: 1 }, { unique: true });

export default mongoose.model<ISLAPolicy>('SLAPolicy', SLAPolicySchema);
