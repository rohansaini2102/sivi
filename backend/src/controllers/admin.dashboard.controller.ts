import { Request, Response } from 'express';
import User from '../models/User';
import Course from '../models/Course';
import TestSeries from '../models/TestSeries';
import Payment from '../models/Payment';
import Enrollment from '../models/Enrollment';
import Question from '../models/Question';
import Exam from '../models/Exam';
import logger from '../utils/logger';

// Get dashboard statistics
export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - 7);
    const startOfLastWeek = new Date(now);
    startOfLastWeek.setDate(now.getDate() - 14);

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
      revenueLastMonth,
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
      Payment.aggregate([
        { $match: { status: 'completed', createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth } } },
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

    // Get recent users (newly registered)
    const recentUsers = await User.find({ role: 'user' })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name email createdAt')
      .lean();

    // Get enrollment counts for recent users
    const recentUsersWithEnrollments = await Promise.all(
      recentUsers.map(async (user: any) => {
        const enrollmentCount = await Enrollment.countDocuments({ user: user._id, isActive: true });
        return {
          ...user,
          enrolledCount: enrollmentCount,
        };
      })
    );

    // Get question bank stats
    const [totalQuestions, questionsAddedThisWeek] = await Promise.all([
      Question.countDocuments(),
      Question.countDocuments({ createdAt: { $gte: startOfWeek } }),
    ]);

    // Get total exams count
    const totalExams = await Exam.countDocuments();

    // Get draft test series count
    const draftTestSeries = await TestSeries.countDocuments({ isPublished: false });

    // Calculate user growth percentage
    const usersLastWeek = await User.countDocuments({
      role: 'user',
      createdAt: { $gte: startOfLastWeek, $lt: startOfWeek },
    });
    const userGrowthPercent = usersLastWeek > 0
      ? Math.round(((newUsersThisWeek - usersLastWeek) / usersLastWeek) * 100)
      : (newUsersThisWeek > 0 ? 100 : 0);

    // Calculate revenue growth percentage
    const lastMonthRevenue = revenueLastMonth[0]?.total || 0;
    const thisMonthRevenue = revenueThisMonth[0]?.total || 0;
    const revenueGrowthPercent = lastMonthRevenue > 0
      ? Math.round(((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100)
      : (thisMonthRevenue > 0 ? 100 : 0);

    res.json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          newThisWeek: newUsersThisWeek,
          newThisMonth: newUsersThisMonth,
          growthPercent: userGrowthPercent,
        },
        courses: {
          total: totalCourses,
          published: publishedCourses,
          draft: draftCourses,
        },
        testSeries: {
          total: totalTestSeries,
          published: publishedTestSeries,
          draft: draftTestSeries,
          totalExams: totalExams,
        },
        payments: {
          total: totalPayments,
          completed: completedPayments,
        },
        revenue: {
          total: totalRevenue[0]?.total || 0,
          thisMonth: thisMonthRevenue,
          lastMonth: lastMonthRevenue,
          growthPercent: revenueGrowthPercent,
        },
        enrollments: {
          total: totalEnrollments,
          active: activeEnrollments,
        },
        questions: {
          total: totalQuestions,
          addedThisWeek: questionsAddedThisWeek,
        },
        recentPayments,
        recentEnrollments,
        recentUsers: recentUsersWithEnrollments,
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
