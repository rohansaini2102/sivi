import { Request, Response } from 'express';
import User from '../models/User';
import {
  studentInfoSchema,
  updateProfileSchema,
} from '../validators/auth.validator';

// GET /api/user/profile
export const getProfileController = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { message: 'Authentication required' },
      });
    }

    const user = await User.findById(req.user.userId).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: { message: 'User not found' },
      });
    }

    return res.status(200).json({
      success: true,
      data: { user },
    });
  } catch (error) {
    console.error('Get profile error:', error);
    return res.status(500).json({
      success: false,
      error: { message: 'Failed to get profile' },
    });
  }
};

// PUT /api/user/profile
export const updateProfileController = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { message: 'Authentication required' },
      });
    }

    // Validate input
    const validation = updateProfileSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: { message: validation.error.errors[0].message },
      });
    }

    const updateData = validation.data;

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: { message: 'User not found' },
      });
    }

    return res.status(200).json({
      success: true,
      data: { user },
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return res.status(500).json({
      success: false,
      error: { message: 'Failed to update profile' },
    });
  }
};

// PUT /api/user/student-info
export const updateStudentInfoController = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { message: 'Authentication required' },
      });
    }

    // Validate input
    const validation = studentInfoSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: { message: validation.error.errors[0].message },
      });
    }

    const studentInfo = validation.data;

    // Convert dateOfBirth string to Date if provided
    if (studentInfo.dateOfBirth && typeof studentInfo.dateOfBirth === 'string') {
      (studentInfo as any).dateOfBirth = new Date(studentInfo.dateOfBirth);
    }

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { $set: { studentInfo } },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: { message: 'User not found' },
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        message: 'Student info updated successfully',
        studentInfo: user.studentInfo,
      },
    });
  } catch (error) {
    console.error('Update student info error:', error);
    return res.status(500).json({
      success: false,
      error: { message: 'Failed to update student info' },
    });
  }
};

// GET /api/user/dashboard
export const getDashboardController = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { message: 'Authentication required' },
      });
    }

    const user = await User.findById(req.user.userId).select('name email phone stats studentInfo preferences');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: { message: 'User not found' },
      });
    }

    // TODO: Fetch enrollments, recent activity, etc.
    const dashboard = {
      user: {
        name: user.name,
        email: user.email,
        phone: user.phone,
        stats: user.stats,
        studentInfo: user.studentInfo,
        preferences: user.preferences,
      },
      enrollments: [], // To be populated from Enrollment model
      recentActivity: [], // To be populated
    };

    return res.status(200).json({
      success: true,
      data: dashboard,
    });
  } catch (error) {
    console.error('Get dashboard error:', error);
    return res.status(500).json({
      success: false,
      error: { message: 'Failed to get dashboard' },
    });
  }
};
