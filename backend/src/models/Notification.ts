import mongoose, { Schema, Document } from 'mongoose';

export type NotificationType =
  | 'ticket_assigned'
  | 'high_priority_ticket'
  | 'sla_warning'
  | 'auto_reply_sent'
  | 'team_member_joined';

export interface INotification extends Document {
  tenantId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  type: NotificationType;
  message: string;
  url?: string;
  readAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema: Schema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: {
      type: String,
      enum: [
        'ticket_assigned',
        'high_priority_ticket',
        'sla_warning',
        'auto_reply_sent',
        'team_member_joined',
      ],
      required: true,
      index: true,
    },
    message: { type: String, required: true },
    url: { type: String },
    readAt: { type: Date, index: true },
  },
  { timestamps: true },
);

export default mongoose.model<INotification>('Notification', NotificationSchema);

