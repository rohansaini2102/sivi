import { z } from 'zod';

// Send OTP Schema
export const sendOTPSchema = z.object({
  type: z.enum(['email', 'phone']),
  value: z.string().min(1, 'Value is required'),
}).refine((data) => {
  if (data.type === 'email') {
    return z.string().email().safeParse(data.value).success;
  }
  if (data.type === 'phone') {
    // Indian phone number format: +91 followed by 10 digits starting with 6-9
    return /^(\+91)?[6-9]\d{9}$/.test(data.value.replace(/\s/g, ''));
  }
  return false;
}, {
  message: 'Invalid email or phone number format',
});

// Verify OTP Schema
export const verifyOTPSchema = z.object({
  type: z.enum(['email', 'phone']),
  value: z.string().min(1, 'Value is required'),
  otp: z.string().length(6, 'OTP must be 6 digits'),
  name: z.string().min(2, 'Name must be at least 2 characters').max(100).optional(),
});

// Admin Login Schema (email + password)
export const adminLoginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

// Change Password Schema
export const changePasswordSchema = z.object({
  oldPassword: z.string().min(6, 'Old password must be at least 6 characters'),
  newPassword: z.string()
    .min(8, 'New password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
});

// Student Info Schema
export const studentInfoSchema = z.object({
  fatherName: z.string().max(100).optional(),
  dateOfBirth: z.string().datetime().optional().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional()),
  gender: z.enum(['male', 'female', 'other']).optional(),
  address: z.string().max(500).optional(),
  city: z.string().max(100).optional(),
  state: z.string().max(100).optional(),
  pincode: z.string().regex(/^\d{6}$/, 'Pincode must be 6 digits').optional(),
  qualification: z.string().max(100).optional(),
  preparingFor: z.array(z.string()).optional(),
});

// Update Profile Schema
export const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  language: z.enum(['hi', 'en']).optional(),
  avatar: z.string().url().optional(),
  preferences: z.object({
    examCategory: z.string().optional(),
    notifications: z.boolean().optional(),
    darkMode: z.boolean().optional(),
  }).optional(),
});

// Type exports
export type SendOTPInput = z.infer<typeof sendOTPSchema>;
export type VerifyOTPInput = z.infer<typeof verifyOTPSchema>;
export type AdminLoginInput = z.infer<typeof adminLoginSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type StudentInfoInput = z.infer<typeof studentInfoSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
