import { Router, Request, Response } from 'express';
import { authenticate, requireRole, checkPasswordChange } from '../middleware/auth.middleware';
import { uploadThumbnail, handleMulterError } from '../middleware/upload.middleware';
import * as courseController from '../controllers/admin.course.controller';
import * as testSeriesController from '../controllers/admin.testSeries.controller';
import * as dashboardController from '../controllers/admin.dashboard.controller';
import * as usersController from '../controllers/admin.users.controller';
import * as paymentsController from '../controllers/admin.payments.controller';
import { uploadThumbnail as uploadToR2 } from '../services/upload.service';

const router = Router();

// All admin routes require authentication and admin role
router.use(authenticate);
router.use(requireRole('admin', 'super_admin'));
router.use(checkPasswordChange);

// Dashboard
router.get('/dashboard/stats', dashboardController.getDashboardStats);

// Courses CRUD
router.get('/courses', courseController.listCourses);
router.get('/courses/:id', courseController.getCourseById);
router.post('/courses', uploadThumbnail, handleMulterError, courseController.createCourse);
router.put('/courses/:id', uploadThumbnail, handleMulterError, courseController.updateCourse);
router.delete('/courses/:id', courseController.deleteCourse);
router.patch('/courses/:id/publish', courseController.togglePublish);

// Test Series CRUD
router.get('/test-series', testSeriesController.listTestSeries);
router.get('/test-series/:id', testSeriesController.getTestSeriesById);
router.post('/test-series', uploadThumbnail, handleMulterError, testSeriesController.createTestSeries);
router.put('/test-series/:id', uploadThumbnail, handleMulterError, testSeriesController.updateTestSeries);
router.delete('/test-series/:id', testSeriesController.deleteTestSeries);
router.patch('/test-series/:id/publish', testSeriesController.togglePublish);

// Users
router.get('/users', usersController.listUsers);
router.get('/users/:id', usersController.getUserById);
router.patch('/users/:id/status', usersController.toggleUserStatus);

// Payments
router.get('/payments', paymentsController.listPayments);
router.get('/payments/:id', paymentsController.getPaymentById);
router.post('/payments/:id/refund', paymentsController.processRefund);

// File Upload (generic)
router.post('/upload', uploadThumbnail, handleMulterError, async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: { message: 'No file provided', code: 'NO_FILE' },
      });
    }

    const { url, key } = await uploadToR2(req.file);

    res.json({
      success: true,
      data: { url, key },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: { message: error.message, code: 'UPLOAD_ERROR' },
    });
  }
});

// Questions (placeholder - to be implemented later)
router.get('/questions', (req, res) => {
  res.json({ message: 'Get questions - To be implemented' });
});

router.post('/questions', (req, res) => {
  res.json({ message: 'Create question - To be implemented' });
});

router.post('/questions/bulk-import', (req, res) => {
  res.json({ message: 'Bulk import questions - To be implemented' });
});

// Analytics (placeholder)
router.get('/analytics', (req, res) => {
  res.json({ message: 'Get analytics - To be implemented' });
});

export default router;
