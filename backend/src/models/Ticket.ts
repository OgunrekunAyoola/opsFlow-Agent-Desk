import mongoose, { Schema, Document } from 'mongoose';

export interface ITicket extends Document {
  tenantId: mongoose.Types.ObjectId;
  clientId?: mongoose.Types.ObjectId;
  subject: string;
  body: string;
  messageId?: string;
  channel: 'email' | 'web_form';
  status: 'new' | 'triaged' | 'awaiting_reply' | 'replied' | 'closed' | 'auto_resolved';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: 'bug' | 'feature_request' | 'billing' | 'general' | 'other';
  customerName?: string;
  customerEmail?: string;
  assigneeId?: mongoose.Types.ObjectId;
  createdById?: mongoose.Types.ObjectId;
  aiAnalysis?: {
    sentiment?: 'positive' | 'neutral' | 'negative';
    priorityScore?: number;
    suggestedCategory?: string;
    summary?: string;
    suggestedReply?: string;
  };
  isAiTriaged: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const TicketSchema: Schema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    clientId: { type: Schema.Types.ObjectId, ref: 'Client' },
    subject: { type: String, required: true },
    messageId: { type: String, index: true },
    body: { type: String, required: true },
    channel: { type: String, enum: ['email', 'web_form'], required: true },
    status: {
      type: String,
      enum: ['new', 'triaged', 'awaiting_reply', 'replied', 'closed', 'auto_resolved'],
      default: 'new',
      index: true,
    },
    priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
    category: {
      type: String,
      enum: ['bug', 'feature_request', 'billing', 'general', 'other'],
      default: 'general',
    },
    customerName: { type: String },
    customerEmail: { type: String },
    assigneeId: { type: Schema.Types.ObjectId, ref: 'User' },
    createdById: { type: Schema.Types.ObjectId, ref: 'User' },
    aiAnalysis: {
      sentiment: { type: String, enum: ['positive', 'neutral', 'negative'] },
      priorityScore: { type: Number },
      suggestedCategory: { type: String },
      summary: { type: String },
      suggestedReply: { type: String },
    },
    isAiTriaged: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export default mongoose.model<ITicket>('Ticket', TicketSchema);
