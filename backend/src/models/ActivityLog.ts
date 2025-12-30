import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IActivityLog extends Document {
  actor: Types.ObjectId;
  actorName: string;
  actorRole: 'admin' | 'super_admin';
  action: 'create' | 'update' | 'delete' | 'publish' | 'unpublish';
  entityType: 'course' | 'test_series' | 'exam' | 'question' | 'user';
  entityId: Types.ObjectId;
  entityTitle: string;
  changes?: {
    field: string;
    oldValue?: string;
    newValue?: string;
  }[];
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

const activityLogSchema = new Schema<IActivityLog>(
  {
    actor: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    actorName: {
      type: String,
      required: true,
      trim: true,
    },
    actorRole: {
      type: String,
      enum: ['admin', 'super_admin'],
      required: true,
    },
    action: {
      type: String,
      enum: ['create', 'update', 'delete', 'publish', 'unpublish'],
      required: true,
    },
    entityType: {
      type: String,
      enum: ['course', 'test_series', 'exam', 'question', 'user'],
      required: true,
    },
    entityId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    entityTitle: {
      type: String,
      required: true,
      trim: true,
    },
    changes: [{
      field: String,
      oldValue: String,
      newValue: String,
    }],
    ipAddress: String,
    userAgent: String,
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// Indexes for efficient querying
activityLogSchema.index({ actor: 1, createdAt: -1 });
activityLogSchema.index({ entityType: 1, entityId: 1 });
activityLogSchema.index({ createdAt: -1 });
activityLogSchema.index({ action: 1 });

export default mongoose.model<IActivityLog>('ActivityLog', activityLogSchema);
