import { Types } from 'mongoose';
import ActivityLog, { IActivityLog } from '../models/ActivityLog';
import logger from '../utils/logger';

export interface LogActivityParams {
  actor: Types.ObjectId | string;
  actorName: string;
  actorRole: 'admin' | 'super_admin';
  action: 'create' | 'update' | 'delete' | 'publish' | 'unpublish';
  entityType: 'course' | 'test_series' | 'exam' | 'question' | 'user';
  entityId: Types.ObjectId | string;
  entityTitle: string;
  changes?: { field: string; oldValue?: string; newValue?: string }[];
  ipAddress?: string;
  userAgent?: string;
}

export interface GetActivitiesOptions {
  page?: number;
  limit?: number;
  entityType?: string;
  action?: string;
  actorId?: string;
}

export const logActivity = async (params: LogActivityParams): Promise<IActivityLog | null> => {
  try {
    const activity = new ActivityLog({
      actor: new Types.ObjectId(params.actor.toString()),
      actorName: params.actorName,
      actorRole: params.actorRole,
      action: params.action,
      entityType: params.entityType,
      entityId: new Types.ObjectId(params.entityId.toString()),
      entityTitle: params.entityTitle,
      changes: params.changes,
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
    });

    await activity.save();
    logger.info(`Activity logged: ${params.action} ${params.entityType} "${params.entityTitle}" by ${params.actorName}`);
    return activity;
  } catch (error: any) {
    logger.error('Failed to log activity', { error: error.message, params });
    return null;
  }
};

export const getRecentActivities = async (options: GetActivitiesOptions = {}) => {
  const { page = 1, limit = 20, entityType, action, actorId } = options;
  const skip = (page - 1) * limit;

  const query: any = {};
  if (entityType) query.entityType = entityType;
  if (action) query.action = action;
  if (actorId) query.actor = new Types.ObjectId(actorId);

  try {
    const [activities, total] = await Promise.all([
      ActivityLog.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      ActivityLog.countDocuments(query),
    ]);

    return {
      activities,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  } catch (error: any) {
    logger.error('Failed to fetch activities', { error: error.message });
    return {
      activities: [],
      pagination: { page, limit, total: 0, pages: 0 },
    };
  }
};

export const getActivityStats = async () => {
  try {
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const [totalToday, recentActivities] = await Promise.all([
      ActivityLog.countDocuments({ createdAt: { $gte: oneDayAgo } }),
      ActivityLog.find()
        .sort({ createdAt: -1 })
        .limit(10)
        .lean(),
    ]);

    return {
      totalToday,
      recentActivities,
    };
  } catch (error: any) {
    logger.error('Failed to fetch activity stats', { error: error.message });
    return {
      totalToday: 0,
      recentActivities: [],
    };
  }
};

export default {
  logActivity,
  getRecentActivities,
  getActivityStats,
};
