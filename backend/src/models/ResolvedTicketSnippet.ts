import mongoose, { Schema, Document } from 'mongoose';

export interface IResolvedTicketSnippet extends Document {
  tenantId: mongoose.Types.ObjectId;
  ticketId: mongoose.Types.ObjectId;
  snippetText: string;
  embedding: number[];
  intent?: string;
  finalAnswer?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ResolvedTicketSnippetSchema: Schema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    ticketId: { type: Schema.Types.ObjectId, ref: 'Ticket', required: true, index: true },
    snippetText: { type: String, required: true },
    embedding: { type: [Number], required: true },
    intent: { type: String },
    finalAnswer: { type: String },
  },
  { timestamps: true },
);

ResolvedTicketSnippetSchema.index({ tenantId: 1, ticketId: 1 }, { unique: true });

export default mongoose.model<IResolvedTicketSnippet>(
  'ResolvedTicketSnippet',
  ResolvedTicketSnippetSchema,
);
