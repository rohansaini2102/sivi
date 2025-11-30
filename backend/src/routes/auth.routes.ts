import { Router } from 'express';
import {
  sendOTPController,
  verifyOTPController,
  adminVerifyPasswordController,
  adminVerifyOTPController,
  changePasswordController,
  refreshTokenController,
  logoutController,
  getMeController,
} from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Public routes
router.post('/send-otp', sendOTPController);
router.post('/verify-otp', verifyOTPController);
router.post('/refresh', refreshTokenController);
router.post('/logout', logoutController);

// Admin 2FA routes
router.post('/admin/verify-password', adminVerifyPasswordController); // Step 1: Verify password, send OTP
router.post('/admin/verify-otp', adminVerifyOTPController); // Step 2: Verify OTP, complete login
router.post('/admin/change-password', authenticate, changePasswordController);

// Protected routes
router.get('/me', authenticate, getMeController);

export default router;
