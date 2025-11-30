import { Router } from 'express';
import {
  getProfileController,
  updateProfileController,
  updateStudentInfoController,
  getDashboardController,
} from '../controllers/user.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// All user routes require authentication
router.use(authenticate);

// Profile routes
router.get('/profile', getProfileController);
router.put('/profile', updateProfileController);

// Student info
router.put('/student-info', updateStudentInfoController);

// Dashboard
router.get('/dashboard', getDashboardController);

export default router;
