import { Request, Response } from 'express';
import User from '../models/User';
import logger from '../utils/logger';

// Get admin profile
export const getProfile = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.user!.userId)
      .select('name email phone avatar role createdAt')
      .lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        error: { message: 'User not found', code: 'USER_NOT_FOUND' },
      });
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error: any) {
    logger.error('Get profile error:', error);
    res.status(400).json({
      success: false,
      error: { message: error.message, code: 'GET_PROFILE_ERROR' },
    });
  }
};

// Update admin profile
export const updateProfile = async (req: Request, res: Response) => {
  try {
    const { name, email, phone } = req.body;

    const updateData: any = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (phone) updateData.phone = phone;

    const user = await User.findByIdAndUpdate(
      req.user!.userId,
      updateData,
      { new: true }
    ).select('name email phone avatar role');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: { message: 'User not found', code: 'USER_NOT_FOUND' },
      });
    }

    res.json({
      success: true,
      data: user,
      message: 'Profile updated successfully',
    });
  } catch (error: any) {
    logger.error('Update profile error:', error);
    res.status(400).json({
      success: false,
      error: { message: error.message, code: 'UPDATE_PROFILE_ERROR' },
    });
  }
};

// Get notification preferences
export const getNotificationPreferences = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.user!.userId)
      .select('notificationPreferences')
      .lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        error: { message: 'User not found', code: 'USER_NOT_FOUND' },
      });
    }

    // Default preferences if not set
    const preferences = user.notificationPreferences || {
      emailNotifications: true,
      activityAlerts: true,
      dailyDigest: false,
      newUserAlerts: true,
      paymentAlerts: true,
    };

    res.json({
      success: true,
      data: preferences,
    });
  } catch (error: any) {
    logger.error('Get notification preferences error:', error);
    res.status(400).json({
      success: false,
      error: { message: error.message, code: 'GET_NOTIFICATIONS_ERROR' },
    });
  }
};

// Update notification preferences
export const updateNotificationPreferences = async (req: Request, res: Response) => {
  try {
    const preferences = req.body;

    const user = await User.findByIdAndUpdate(
      req.user!.userId,
      { notificationPreferences: preferences },
      { new: true }
    ).select('notificationPreferences');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: { message: 'User not found', code: 'USER_NOT_FOUND' },
      });
    }

    res.json({
      success: true,
      data: user.notificationPreferences,
      message: 'Notification preferences updated successfully',
    });
  } catch (error: any) {
    logger.error('Update notification preferences error:', error);
    res.status(400).json({
      success: false,
      error: { message: error.message, code: 'UPDATE_NOTIFICATIONS_ERROR' },
    });
  }
};

export default {
  getProfile,
  updateProfile,
  getNotificationPreferences,
  updateNotificationPreferences,
};
