import mongoose, { Schema, Document } from 'mongoose';

export interface ICSAT extends Document {
  deletedAt?: Date | null;
  ticketId: mongoose.Types.ObjectId;
  tenantId: mongoose.Types.ObjectId;
  rating: number; // 1-5
  comment?: string;
  submittedAt: Date;
}

const CSATSchema: Schema = new Schema(
  {
    deletedAt: { type: Date, default: null },
    ticketId: { type: Schema.Types.ObjectId, ref: 'Ticket', required: true, index: true },
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String },
    submittedAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

export default mongoose.model<ICSAT>('CSAT', CSATSchema);
