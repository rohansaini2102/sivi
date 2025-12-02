import { Request, Response } from 'express';
import Enrollment from '../models/Enrollment';
import logger from '../utils/logger';

/**
 * Get user's enrollments
 * GET /api/learn/enrollments
 */
export const getEnrollments = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { itemType, page = '1', limit = '10' } = req.query;

    logger.info(`User requesting enrollments: ${userId}`);

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);

    const query: any = { user: userId, isActive: true };

    // Filter by item type if provided
    if (itemType) {
      query.itemType = itemType;
    }

    // Only show valid (non-expired) enrollments
    query.validUntil = { $gte: new Date() };

    logger.info(`Fetching enrollments with query: ${JSON.stringify(query)}`);

    const enrollments = await Enrollment.find(query)
      .populate('testSeries', 'title slug thumbnail examCategory totalExams validityDays price discountPrice')
      .populate('course', 'title slug thumbnail category totalLessons')
      .populate('payment', 'orderId amount status')
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .lean();

    const total = await Enrollment.countDocuments(query);

    logger.info(`Found ${total} total enrollments, returning ${enrollments.length} items`);

    res.json({
      success: true,
      data: {
        enrollments,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error) {
    logger.error('Error fetching enrollments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch enrollments',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Check if user is enrolled in a specific item
 * GET /api/learn/check-enrollment
 */
export const checkEnrollment = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { itemId, itemType } = req.query;

    if (!itemId || !itemType) {
      return res.status(400).json({
        success: false,
        message: 'itemId and itemType are required',
      });
    }

    const query: any = {
      user: userId,
      itemType,
      isActive: true,
      validUntil: { $gte: new Date() },
    };

    // Set the correct field based on item type
    if (itemType === 'test_series') {
      query.testSeries = itemId;
    } else if (itemType === 'course') {
      query.course = itemId;
    } else if (itemType === 'bundle') {
      query.bundle = itemId;
    }

    const enrollment = await Enrollment.findOne(query)
      .populate('testSeries', 'title slug thumbnail validityDays')
      .populate('course', 'title slug thumbnail')
      .populate('payment', 'orderId amount')
      .lean();

    res.json({
      success: true,
      data: {
        isEnrolled: !!enrollment,
        enrollment: enrollment || null,
      },
    });
  } catch (error) {
    logger.error('Error checking enrollment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check enrollment',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
