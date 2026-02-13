import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  tenantId: mongoose.Types.ObjectId;
  name: string;
  email: string;
  passwordHash: string;
  role: 'admin' | 'member';
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['admin', 'member'], default: 'member' },
}, { timestamps: true });

UserSchema.index({ tenantId: 1, email: 1 }, { unique: true });

export default mongoose.model<IUser>('User', UserSchema);
