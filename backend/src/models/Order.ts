import mongoose, { Schema, Document } from 'mongoose';

export interface IOrder extends Document {
  deletedAt?: Date | null;
  tenantId: mongoose.Types.ObjectId;
  orderId: string;
  customerEmail: string;
  status: 'pending' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  total: number;
  trackingNumber?: string;
  refundId?: string;
  refundReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema: Schema = new Schema(
  {
    deletedAt: { type: Date, default: null },
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    orderId: { type: String, required: true, index: true },
    customerEmail: { type: String, required: true, index: true },
    status: {
      type: String,
      enum: ['pending', 'shipped', 'delivered', 'cancelled', 'refunded'],
      default: 'pending',
    },
    total: { type: Number, required: true },
    trackingNumber: { type: String },
    refundId: { type: String },
    refundReason: { type: String },
  },
  { timestamps: true },
);

// Ensure orderId is unique per tenant
OrderSchema.index({ tenantId: 1, orderId: 1 }, { unique: true });

export default mongoose.model<IOrder>('Order', OrderSchema);
