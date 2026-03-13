import mongoose, { Schema, Document } from 'mongoose';

export interface IKBArticle extends Document {
  deletedAt?: Date | null;
  tenantId: mongoose.Types.ObjectId;
  title: string;
  body: string;
  tags?: string[];
  createdById?: mongoose.Types.ObjectId;
  updatedById?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const KBArticleSchema: Schema = new Schema(
  {
    deletedAt: { type: Date, default: null },
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    title: { type: String, required: true },
    body: { type: String, required: true },
    tags: { type: [String], default: [] },
    createdById: { type: Schema.Types.ObjectId, ref: 'User' },
    updatedById: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true },
);

KBArticleSchema.index({ tenantId: 1, title: 1 });

export default mongoose.model<IKBArticle>('KBArticle', KBArticleSchema);

