import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import {
  sendOTPSchema,
  verifyOTPSchema,
  adminLoginSchema,
  changePasswordSchema,
} from '../validators/auth.validator';
import {
  sendOTP,
  verifyOTPAndLogin,
  adminLoginWithPassword,
  adminVerifyPasswordAndSendOTP,
  adminVerifyOTPAndLogin,
  changeAdminPassword,
} from '../services/auth.service';
import { generateTokens, verifyRefreshToken } from '../utils/jwt';
import User from '../models/User';

// Mask email for response
const maskEmail = (email: string): string => {
  const [local, domain] = email.split('@');
  const masked = local.slice(0, 2) + '***' + local.slice(-1);
  return `${masked}@${domain}`;
};

// Mask phone for response
const maskPhone = (phone: string): string => {
  return phone.slice(0, 4) + '****' + phone.slice(-2);
};

// POST /api/auth/send-otp
export const sendOTPController = async (req: Request, res: Response) => {
  try {
    // Validate input
    const validation = sendOTPSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: { message: validation.error.errors[0].message },
      });
    }

    const { type, value } = validation.data;

    // Send OTP
    const result = await sendOTP(value, type);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: { message: result.error },
      });
    }

    const maskedValue = type === 'email' ? maskEmail(value) : maskPhone(value);

    return res.status(200).json({
      success: true,
      data: {
        message: 'OTP sent successfully',
        maskedValue,
        expiresIn: 600, // 10 minutes in seconds
      },
    });
  } catch (error) {
    console.error('Send OTP error:', error);
    return res.status(500).json({
      success: false,
      error: { message: 'Failed to send OTP' },
    });
  }
};

// POST /api/auth/verify-otp
export const verifyOTPController = async (req: Request, res: Response) => {
  try {
    // Validate input
    const validation = verifyOTPSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: { message: validation.error.errors[0].message },
      });
    }

    const { type, value, otp, name } = validation.data;

    // Verify OTP and login
    const result = await verifyOTPAndLogin(value, type, otp, name);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: { message: result.error },
      });
    }

    // Set refresh token in httpOnly cookie
    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // 'none' required for cross-origin (Vercel → Cloud Run)
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return res.status(200).json({
      success: true,
      data: {
        accessToken: result.accessToken,
        user: result.user,
        isNewUser: result.isNewUser,
      },
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    return res.status(500).json({
      success: false,
      error: { message: 'Failed to verify OTP' },
    });
  }
};

// POST /api/auth/admin/verify-password (Step 1 of 2FA)
export const adminVerifyPasswordController = async (req: Request, res: Response) => {
  try {
    // Validate input
    const validation = adminLoginSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: { message: validation.error.errors[0].message },
      });
    }

    const { email, password } = validation.data;

    // Verify password and send OTP
    const result = await adminVerifyPasswordAndSendOTP(email, password);

    if (!result.success) {
      return res.status(401).json({
        success: false,
        error: { message: result.error },
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        message: 'OTP sent to your email',
        tempToken: result.tempToken,
        maskedEmail: maskEmail(email),
      },
    });
  } catch (error) {
    console.error('Admin verify password error:', error);
    return res.status(500).json({
      success: false,
      error: { message: 'Failed to verify password' },
    });
  }
};

// POST /api/auth/admin/verify-otp (Step 2 of 2FA)
export const adminVerifyOTPController = async (req: Request, res: Response) => {
  try {
    const { email, otp, tempToken } = req.body;

    if (!email || !otp || !tempToken) {
      return res.status(400).json({
        success: false,
        error: { message: 'Email, OTP, and tempToken are required' },
      });
    }

    // Verify temp token
    try {
      const decoded = jwt.verify(tempToken, process.env.JWT_SECRET!) as { email: string; purpose: string };
      if (decoded.purpose !== 'admin-2fa' || decoded.email !== email.toLowerCase()) {
        return res.status(401).json({
          success: false,
          error: { message: 'Invalid or expired session. Please login again.' },
        });
      }
    } catch (err) {
      return res.status(401).json({
        success: false,
        error: { message: 'Session expired. Please login again.' },
      });
    }

    // Verify OTP and complete login
    const result = await adminVerifyOTPAndLogin(email, otp);

    if (!result.success) {
      return res.status(401).json({
        success: false,
        error: { message: result.error },
      });
    }

    // Set refresh token in httpOnly cookie
    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // 'none' required for cross-origin (Vercel → Cloud Run)
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return res.status(200).json({
      success: true,
      data: {
        accessToken: result.accessToken,
        user: result.user,
      },
    });
  } catch (error) {
    console.error('Admin verify OTP error:', error);
    return res.status(500).json({
      success: false,
      error: { message: 'Failed to verify OTP' },
    });
  }
};

// POST /api/auth/admin/change-password
export const changePasswordController = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { message: 'Authentication required' },
      });
    }

    // Validate input
    const validation = changePasswordSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: { message: validation.error.errors[0].message },
      });
    }

    const { oldPassword, newPassword } = validation.data;

    // Change password
    const result = await changeAdminPassword(req.user.userId, oldPassword, newPassword);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: { message: result.error },
      });
    }

    return res.status(200).json({
      success: true,
      data: { message: 'Password changed successfully' },
    });
  } catch (error) {
    console.error('Change password error:', error);
    return res.status(500).json({
      success: false,
      error: { message: 'Failed to change password' },
    });
  }
};

// POST /api/auth/refresh
export const refreshTokenController = async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        error: { message: 'Refresh token not found' },
      });
    }

    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);

    if (!decoded) {
      return res.status(401).json({
        success: false,
        error: { message: 'Invalid or expired refresh token' },
      });
    }

    // Get user
    const user = await User.findById(decoded.userId);

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        error: { message: 'User not found or inactive' },
      });
    }

    // Generate new tokens
    const tokens = generateTokens(user._id.toString(), user.role);

    // Set new refresh token in cookie
    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // 'none' required for cross-origin (Vercel → Cloud Run)
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return res.status(200).json({
      success: true,
      data: { accessToken: tokens.accessToken },
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    return res.status(500).json({
      success: false,
      error: { message: 'Failed to refresh token' },
    });
  }
};

// POST /api/auth/logout
export const logoutController = async (req: Request, res: Response) => {
  try {
    // Clear refresh token cookie
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // 'none' required for cross-origin (Vercel → Cloud Run)
    });

    return res.status(200).json({
      success: true,
      data: { message: 'Logged out successfully' },
    });
  } catch (error) {
    console.error('Logout error:', error);
    return res.status(500).json({
      success: false,
      error: { message: 'Failed to logout' },
    });
  }
};

// GET /api/auth/me
export const getMeController = async (req: Request, res: Response) => {
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
    console.error('Get me error:', error);
    return res.status(500).json({
      success: false,
      error: { message: 'Failed to get user' },
    });
  }
};
