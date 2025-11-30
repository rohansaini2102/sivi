import crypto from 'crypto';
import User, { IUser } from '../models/User';
import OTP from '../models/OTP';
import { hashOTP, compareOTP, hashPassword, comparePassword } from '../utils/hash';
import { generateTokens } from '../utils/jwt';
import { sendOTPEmail, sendAdminOTPEmail } from './email.service';
import { CONSTANTS } from '../config/constants';

// Generate 6-digit OTP
export const generateOTP = (): string => {
  return crypto.randomInt(100000, 999999).toString();
};

// Create and store OTP record
export const createOTPRecord = async (
  identifier: string,
  type: 'email' | 'phone'
): Promise<{ success: boolean; otp?: string; error?: string }> => {
  try {
    // Delete any existing OTP for this identifier
    await OTP.deleteMany({ identifier: identifier.toLowerCase(), type });

    // Generate new OTP
    const otp = generateOTP();
    const hashedOTP = await hashOTP(otp);

    // Create OTP record with 10 min expiry
    await OTP.create({
      identifier: identifier.toLowerCase(),
      type,
      otp: hashedOTP,
      expiresAt: new Date(Date.now() + CONSTANTS.OTP_EXPIRY_MINUTES * 60 * 1000),
      attempts: 0,
      isUsed: false,
    });

    return { success: true, otp };
  } catch (error) {
    console.error('Error creating OTP:', error);
    return { success: false, error: 'Failed to create OTP' };
  }
};

// Verify OTP
export const verifyOTPRecord = async (
  identifier: string,
  type: 'email' | 'phone',
  otp: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const otpRecord = await OTP.findOne({
      identifier: identifier.toLowerCase(),
      type,
      isUsed: false,
    });

    if (!otpRecord) {
      return { success: false, error: 'OTP not found or expired' };
    }

    // Check if OTP expired
    if (otpRecord.expiresAt < new Date()) {
      await OTP.deleteOne({ _id: otpRecord._id });
      return { success: false, error: 'OTP expired' };
    }

    // Check attempts
    if (otpRecord.attempts >= CONSTANTS.OTP_MAX_ATTEMPTS) {
      await OTP.deleteOne({ _id: otpRecord._id });
      return { success: false, error: 'Too many attempts. Please request a new OTP.' };
    }

    // Verify OTP
    const isValid = await compareOTP(otp, otpRecord.otp);

    if (!isValid) {
      // Increment attempts
      await OTP.updateOne({ _id: otpRecord._id }, { $inc: { attempts: 1 } });
      return { success: false, error: 'Invalid OTP' };
    }

    // Mark as used
    await OTP.updateOne({ _id: otpRecord._id }, { isUsed: true });

    return { success: true };
  } catch (error) {
    console.error('Error verifying OTP:', error);
    return { success: false, error: 'Failed to verify OTP' };
  }
};

// Find or create user by email/phone
export const findOrCreateUser = async (
  identifier: string,
  type: 'email' | 'phone',
  name?: string
): Promise<{ user: IUser; isNewUser: boolean }> => {
  const query = type === 'email'
    ? { email: identifier.toLowerCase() }
    : { phone: identifier };

  let user = await User.findOne(query);
  let isNewUser = false;

  if (!user) {
    // Create new user
    const userData: Partial<IUser> = {
      name: name || 'User',
      isVerified: true,
      isActive: true,
    };

    if (type === 'email') {
      userData.email = identifier.toLowerCase();
    } else {
      userData.phone = identifier;
    }

    user = await User.create(userData);
    isNewUser = true;
  } else {
    // Update last login
    user.lastLogin = new Date();
    await user.save();
  }

  return { user, isNewUser };
};

// Send OTP via email
export const sendOTP = async (
  identifier: string,
  type: 'email' | 'phone'
): Promise<{ success: boolean; message?: string; error?: string }> => {
  // Create OTP record
  const result = await createOTPRecord(identifier, type);

  if (!result.success || !result.otp) {
    return { success: false, error: result.error };
  }

  // Send OTP
  if (type === 'email') {
    const emailResult = await sendOTPEmail(identifier, result.otp);
    if (!emailResult.success) {
      return { success: false, error: 'Failed to send OTP email' };
    }
  } else {
    // Phone OTP via MSG91 - to be implemented
    // For now, log OTP for testing
    console.log(`[DEV] Phone OTP for ${identifier}: ${result.otp}`);
  }

  return { success: true, message: 'OTP sent successfully' };
};

// Verify OTP and login/register user
export const verifyOTPAndLogin = async (
  identifier: string,
  type: 'email' | 'phone',
  otp: string,
  name?: string
): Promise<{
  success: boolean;
  accessToken?: string;
  refreshToken?: string;
  user?: Partial<IUser>;
  isNewUser?: boolean;
  error?: string;
}> => {
  // Verify OTP
  const verifyResult = await verifyOTPRecord(identifier, type, otp);

  if (!verifyResult.success) {
    return { success: false, error: verifyResult.error };
  }

  // Find or create user
  const { user, isNewUser } = await findOrCreateUser(identifier, type, name);

  // Generate tokens
  const tokens = generateTokens(user._id.toString(), user.role);

  return {
    success: true,
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      isVerified: user.isVerified,
      mustChangePassword: user.mustChangePassword,
    },
    isNewUser,
  };
};

// Admin login with password
export const adminLoginWithPassword = async (
  email: string,
  password: string
): Promise<{
  success: boolean;
  accessToken?: string;
  refreshToken?: string;
  user?: Partial<IUser>;
  error?: string;
}> => {
  // Find admin user with password
  const user = await User.findOne({
    email: email.toLowerCase(),
    role: { $in: ['admin', 'super_admin'] },
  }).select('+password');

  if (!user) {
    return { success: false, error: 'Invalid email or password' };
  }

  if (!user.password) {
    return { success: false, error: 'Password not set. Use OTP login.' };
  }

  if (!user.isActive) {
    return { success: false, error: 'Account is inactive' };
  }

  // Verify password
  const isValidPassword = await comparePassword(password, user.password);

  if (!isValidPassword) {
    return { success: false, error: 'Invalid email or password' };
  }

  // Update last login
  user.lastLogin = new Date();
  await user.save();

  // Generate tokens
  const tokens = generateTokens(user._id.toString(), user.role);

  return {
    success: true,
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      mustChangePassword: user.mustChangePassword,
    },
  };
};

// Admin 2FA Step 1: Verify password and send OTP
export const adminVerifyPasswordAndSendOTP = async (
  email: string,
  password: string
): Promise<{
  success: boolean;
  tempToken?: string;
  error?: string;
}> => {
  // Find admin user with password
  const user = await User.findOne({
    email: email.toLowerCase(),
    role: { $in: ['admin', 'super_admin'] },
  }).select('+password');

  if (!user) {
    return { success: false, error: 'Invalid email or password' };
  }

  if (!user.password) {
    return { success: false, error: 'Password not set. Contact super admin.' };
  }

  if (!user.isActive) {
    return { success: false, error: 'Account is inactive' };
  }

  // Verify password
  const isValidPassword = await comparePassword(password, user.password);

  if (!isValidPassword) {
    return { success: false, error: 'Invalid email or password' };
  }

  // Create OTP record
  const otpResult = await createOTPRecord(email, 'email');

  if (!otpResult.success || !otpResult.otp) {
    return { success: false, error: 'Failed to generate OTP. Please try again.' };
  }

  // Send admin-specific OTP email
  const emailResult = await sendAdminOTPEmail(email, otpResult.otp, user.name);

  if (!emailResult.success) {
    return { success: false, error: 'Failed to send OTP. Please try again.' };
  }

  // Generate temporary token (valid for 10 minutes, just for 2FA purpose)
  const jwt = require('jsonwebtoken');
  const tempToken = jwt.sign(
    { email: email.toLowerCase(), purpose: 'admin-2fa' },
    process.env.JWT_SECRET!,
    { expiresIn: '10m' }
  );

  return { success: true, tempToken };
};

// Admin 2FA Step 2: Verify OTP and complete login
export const adminVerifyOTPAndLogin = async (
  email: string,
  otp: string
): Promise<{
  success: boolean;
  accessToken?: string;
  refreshToken?: string;
  user?: Partial<IUser>;
  error?: string;
}> => {
  // Verify OTP
  const verifyResult = await verifyOTPRecord(email, 'email', otp);

  if (!verifyResult.success) {
    return { success: false, error: verifyResult.error };
  }

  // Find admin user
  const user = await User.findOne({
    email: email.toLowerCase(),
    role: { $in: ['admin', 'super_admin'] },
  });

  if (!user) {
    return { success: false, error: 'Admin user not found' };
  }

  if (!user.isActive) {
    return { success: false, error: 'Account is inactive' };
  }

  // Update last login
  user.lastLogin = new Date();
  await user.save();

  // Generate tokens
  const tokens = generateTokens(user._id.toString(), user.role);

  return {
    success: true,
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      mustChangePassword: user.mustChangePassword,
    },
  };
};

// Change password for admin
export const changeAdminPassword = async (
  userId: string,
  oldPassword: string,
  newPassword: string
): Promise<{ success: boolean; error?: string }> => {
  const user = await User.findById(userId).select('+password');

  if (!user) {
    return { success: false, error: 'User not found' };
  }

  // Verify old password
  if (user.password) {
    const isValidPassword = await comparePassword(oldPassword, user.password);
    if (!isValidPassword) {
      return { success: false, error: 'Invalid current password' };
    }
  }

  // Hash and save new password
  const hashedPassword = await hashPassword(newPassword);
  user.password = hashedPassword;
  user.mustChangePassword = false;
  user.passwordChangedAt = new Date();
  await user.save();

  return { success: true };
};
