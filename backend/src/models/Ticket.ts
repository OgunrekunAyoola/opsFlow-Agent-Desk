import mongoose, { Schema, Document } from 'mongoose';

export interface ITicket extends Document {
  tenantId: mongoose.Types.ObjectId;
  subject: string;
  body: string;
  channel: 'email' | 'web_form';
  status: 'new' | 'triaged' | 'awaiting_reply' | 'replied' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: 'bug' | 'feature_request' | 'billing' | 'general' | 'other';
  customerName?: string;
  customerEmail?: string;
  assigneeId?: mongoose.Types.ObjectId;
  createdById?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const TicketSchema: Schema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
  subject: { type: String, required: true },
  body: { type: String, required: true },
  channel: { type: String, enum: ['email', 'web_form'], required: true },
  status: { type: String, enum: ['new', 'triaged', 'awaiting_reply', 'replied', 'closed'], default: 'new', index: true },
  priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
  category: { type: String, enum: ['bug', 'feature_request', 'billing', 'general', 'other'], default: 'general' },
  customerName: { type: String },
  customerEmail: { type: String },
  assigneeId: { type: Schema.Types.ObjectId, ref: 'User' },
  createdById: { type: Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

export default mongoose.model<ITicket>('Ticket', TicketSchema);
