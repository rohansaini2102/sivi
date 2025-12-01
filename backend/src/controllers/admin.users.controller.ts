import { Request, Response } from 'express';
import { z } from 'zod';
import User from '../models/User';
import Enrollment from '../models/Enrollment';
import Payment from '../models/Payment';
import logger from '../utils/logger';

// Query params schema
const listUsersQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  search: z.string().optional(),
  role: z.enum(['user', 'admin', 'super_admin', 'all']).optional(),
  status: z.enum(['active', 'inactive', 'all']).optional(), // Frontend sends 'active'/'inactive'
  sortBy: z.enum(['createdAt', 'name', 'email']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// List all users
export const listUsers = async (req: Request, res: Response) => {
  try {
    const query = listUsersQuerySchema.parse(req.query);
    const { page, limit, search, role, status, sortBy, sortOrder } = query;

    // Build filter
    const filter: any = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    if (role && role !== 'all') {
      filter.role = role;
    }

    // Convert status string to isActive boolean
    if (status && status !== 'all') {
      filter.isActive = status === 'active';
    }

    // Build sort
    const sort: any = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Get total count
    const total = await User.countDocuments(filter);

    // Get users
    const users = await User.find(filter)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit)
      .select('name email phone role avatar isVerified isActive createdAt')
      .lean();

    // Get enrollment counts for each user (separated by type)
    const userIds = users.map((u) => u._id);

    // Get course enrollments
    const courseEnrollments = await Enrollment.aggregate([
      { $match: { user: { $in: userIds }, course: { $exists: true, $ne: null } } },
      { $group: { _id: '$user', count: { $sum: 1 } } },
    ]);

    // Get test series enrollments
    const testSeriesEnrollments = await Enrollment.aggregate([
      { $match: { user: { $in: userIds }, testSeries: { $exists: true, $ne: null } } },
      { $group: { _id: '$user', count: { $sum: 1 } } },
    ]);

    const courseEnrollmentMap = new Map(
      courseEnrollments.map((e) => [e._id.toString(), e.count])
    );

    const testSeriesEnrollmentMap = new Map(
      testSeriesEnrollments.map((e) => [e._id.toString(), e.count])
    );

    // Add enrollment counts to users (matching frontend expected format)
    const usersWithEnrollments = users.map((user) => ({
      ...user,
      enrolledCourses: courseEnrollmentMap.get(user._id.toString()) || 0,
      enrolledTestSeries: testSeriesEnrollmentMap.get(user._id.toString()) || 0,
    }));

    res.json({
      success: true,
      data: {
        users: usersWithEnrollments,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error: any) {
    logger.error('List users error:', error);
    res.status(400).json({
      success: false,
      error: { message: error.message, code: 'LIST_USERS_ERROR' },
    });
  }
};

// Get single user by ID with details
export const getUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id)
      .select('-password')
      .lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        error: { message: 'User not found', code: 'USER_NOT_FOUND' },
      });
    }

    // Get user's enrollments
    const enrollments = await Enrollment.find({ user: id })
      .populate('course', 'title thumbnail')
      .populate('testSeries', 'title thumbnail')
      .lean();

    // Get user's payments
    const payments = await Payment.find({ user: id })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    res.json({
      success: true,
      data: {
        user,
        enrollments,
        payments,
      },
    });
  } catch (error: any) {
    logger.error('Get user error:', error);
    res.status(400).json({
      success: false,
      error: { message: error.message, code: 'GET_USER_ERROR' },
    });
  }
};

// Toggle user active status
export const toggleUserStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: { message: 'User not found', code: 'USER_NOT_FOUND' },
      });
    }

    // Don't allow deactivating yourself
    if (user._id.toString() === req.user!.userId.toString()) {
      return res.status(400).json({
        success: false,
        error: { message: 'Cannot deactivate your own account', code: 'CANNOT_DEACTIVATE_SELF' },
      });
    }

    user.isActive = !user.isActive;
    await user.save();

    logger.info(`User status toggled: ${id} to ${user.isActive} by ${req.user!.userId}`);

    res.json({
      success: true,
      data: { isActive: user.isActive },
      message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
    });
  } catch (error: any) {
    logger.error('Toggle user status error:', error);
    res.status(400).json({
      success: false,
      error: { message: error.message, code: 'TOGGLE_USER_STATUS_ERROR' },
    });
  }
};

export default {
  listUsers,
  getUserById,
  toggleUserStatus,
};
