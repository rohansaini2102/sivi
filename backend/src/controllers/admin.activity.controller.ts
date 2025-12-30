import { Request, Response } from 'express';
import { getRecentActivities, getActivityStats } from '../services/activityLog.service';
import logger from '../utils/logger';

// Get recent activities (paginated)
export const listActivities = async (req: Request, res: Response) => {
  try {
    const {
      page = '1',
      limit = '20',
      entityType,
      action,
      actorId,
    } = req.query;

    const result = await getRecentActivities({
      page: parseInt(page as string),
      limit: parseInt(limit as string),
      entityType: entityType as string,
      action: action as string,
      actorId: actorId as string,
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    logger.error('List activities error:', error);
    res.status(400).json({
      success: false,
      error: { message: error.message, code: 'LIST_ACTIVITIES_ERROR' },
    });
  }
};

// Get activity stats (for notification badge)
export const activityStats = async (req: Request, res: Response) => {
  try {
    const stats = await getActivityStats();

    res.json({
      success: true,
      data: stats,
    });
  } catch (error: any) {
    logger.error('Activity stats error:', error);
    res.status(400).json({
      success: false,
      error: { message: error.message, code: 'ACTIVITY_STATS_ERROR' },
    });
  }
};

export default {
  listActivities,
  activityStats,
};
