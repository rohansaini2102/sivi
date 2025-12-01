import { Request, Response } from 'express';
import User from '../models/User';
import Course from '../models/Course';
import TestSeries from '../models/TestSeries';
import Payment from '../models/Payment';
import Enrollment from '../models/Enrollment';
import logger from '../utils/logger';

// Get dashboard statistics
export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - 7);

    // Get user stats
    const [totalUsers, newUsersThisWeek, newUsersThisMonth] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      User.countDocuments({ role: 'user', createdAt: { $gte: startOfWeek } }),
      User.countDocuments({ role: 'user', createdAt: { $gte: startOfMonth } }),
    ]);

    // Get course stats
    const [totalCourses, publishedCourses, draftCourses] = await Promise.all([
      Course.countDocuments(),
      Course.countDocuments({ isPublished: true }),
      Course.countDocuments({ isPublished: false }),
    ]);

    // Get test series stats
    const [totalTestSeries, publishedTestSeries] = await Promise.all([
      TestSeries.countDocuments(),
      TestSeries.countDocuments({ isPublished: true }),
    ]);

    // Get payment stats
    const [
      totalPayments,
      completedPayments,
      totalRevenue,
      revenueThisMonth,
    ] = await Promise.all([
      Payment.countDocuments(),
      Payment.countDocuments({ status: 'completed' }),
      Payment.aggregate([
        { $match: { status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      Payment.aggregate([
        { $match: { status: 'completed', createdAt: { $gte: startOfMonth } } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
    ]);

    // Get enrollment stats
    const [totalEnrollments, activeEnrollments] = await Promise.all([
      Enrollment.countDocuments(),
      Enrollment.countDocuments({ isActive: true }),
    ]);

    // Get recent payments
    const recentPayments = await Payment.find({ status: 'completed' })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('user', 'name email')
      .populate('course', 'title')
      .populate('testSeries', 'title')
      .lean();

    // Get recent enrollments
    const recentEnrollments = await Enrollment.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('user', 'name email')
      .populate('course', 'title')
      .populate('testSeries', 'title')
      .lean();

    // Get category-wise course distribution
    const coursesByCategory = await Course.aggregate([
      { $group: { _id: '$examCategory', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    res.json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          newThisWeek: newUsersThisWeek,
          newThisMonth: newUsersThisMonth,
        },
        courses: {
          total: totalCourses,
          published: publishedCourses,
          draft: draftCourses,
        },
        testSeries: {
          total: totalTestSeries,
          published: publishedTestSeries,
        },
        payments: {
          total: totalPayments,
          completed: completedPayments,
        },
        revenue: {
          total: totalRevenue[0]?.total || 0,
          thisMonth: revenueThisMonth[0]?.total || 0,
        },
        enrollments: {
          total: totalEnrollments,
          active: activeEnrollments,
        },
        recentPayments,
        recentEnrollments,
        coursesByCategory,
      },
    });
  } catch (error: any) {
    logger.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      error: { message: error.message, code: 'DASHBOARD_STATS_ERROR' },
    });
  }
};

export default {
  getDashboardStats,
};
