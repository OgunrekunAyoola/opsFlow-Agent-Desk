import mongoose, { Schema, Document } from 'mongoose';

export interface IEventLog extends Document {
  deletedAt?: Date | null;
  tenantId: mongoose.Types.ObjectId;
  source: string; // e.g., 'stripe', 'github', 'server_monitor'
  eventType: string; // e.g., 'payment_failed', 'server_down'
  severity: 'info' | 'warning' | 'critical';
  payload: any;
  status: 'processed' | 'ignored';
  relatedTicketId?: mongoose.Types.ObjectId;
  createdAt: Date;
}

const EventLogSchema: Schema = new Schema(
  {
    deletedAt: { type: Date, default: null },
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    source: { type: String, required: true },
    eventType: { type: String, required: true },
    severity: { type: String, enum: ['info', 'warning', 'critical'], default: 'info' },
    payload: { type: Schema.Types.Mixed },
    status: { type: String, enum: ['processed', 'ignored'], default: 'ignored' },
    relatedTicketId: { type: Schema.Types.ObjectId, ref: 'Ticket' },
  },
  { timestamps: true },
);

export default mongoose.model<IEventLog>('EventLog', EventLogSchema);
