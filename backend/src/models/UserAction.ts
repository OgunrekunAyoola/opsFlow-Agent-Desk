import mongoose, { Schema, Document } from 'mongoose';

export interface IUserAction extends Document {
  tenantId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  type: string;
  subjectId?: mongoose.Types.ObjectId;
  meta?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const UserActionSchema: Schema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, required: true },
    subjectId: { type: Schema.Types.ObjectId },
    meta: { type: Object },
  },
  { timestamps: true },
);

UserActionSchema.index({ tenantId: 1, userId: 1, createdAt: -1 });

export default mongoose.model<IUserAction>('UserAction', UserActionSchema);
