import mongoose, { Schema, Document } from 'mongoose';

export interface ITicketReply extends Document {
  tenantId: mongoose.Types.ObjectId;
  ticketId: mongoose.Types.ObjectId;
  authorType: 'ai' | 'human';
  authorId?: mongoose.Types.ObjectId;
  body: string;
  deliveryStatus?: 'queued' | 'sent' | 'failed';
  deliveredAt?: Date;
  deliveryProvider?: string;
  createdAt: Date;
}

const TicketReplySchema: Schema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    ticketId: { type: Schema.Types.ObjectId, ref: 'Ticket', required: true, index: true },
    authorType: { type: String, enum: ['ai', 'human'], required: true },
    authorId: { type: Schema.Types.ObjectId, ref: 'User' },
    body: { type: String, required: true },
    deliveryStatus: { type: String, enum: ['queued', 'sent', 'failed'] },
    deliveredAt: { type: Date },
    deliveryProvider: { type: String },
  },
  { timestamps: true },
);

export default mongoose.model<ITicketReply>('TicketReply', TicketReplySchema);
