import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { requireTestSeriesEnrollment, requireExamAccess, requireExamAttemptAccess } from '../middleware/enrollment.middleware';
import * as testController from '../controllers/test.controller';

const router = Router();

// ==================== ENROLLED TEST SERIES ====================

// GET /api/test/enrolled - Get user's enrolled test series
router.get('/enrolled', authenticate, testController.getEnrolledTestSeries);

// GET /api/test/series/:testSeriesId - Get test series details with exams
router.get('/series/:testSeriesId', authenticate, testController.getTestSeriesWithExams);

// GET /api/test/series/:testSeriesId/progress - Get user's progress in test series
router.get('/series/:testSeriesId/progress', authenticate, requireTestSeriesEnrollment, testController.getTestSeriesProgress);

// ==================== EXAM OPERATIONS ====================

// GET /api/test/exam/:examId/info - Get exam info (pre-start)
router.get('/exam/:examId/info', authenticate, requireExamAccess, testController.getExamInfo);

// POST /api/test/exam/:examId/start - Start or resume an exam attempt
router.post('/exam/:examId/start', authenticate, requireExamAccess, testController.startExam);

// GET /api/test/exam/:examId/leaderboard - Get exam leaderboard
router.get('/exam/:examId/leaderboard', authenticate, testController.getExamLeaderboard);

// ==================== ATTEMPT OPERATIONS ====================

// GET /api/test/attempt/:attemptId - Get current attempt state
router.get('/attempt/:attemptId', authenticate, requireExamAttemptAccess, testController.getAttemptState);

// PUT /api/test/attempt/:attemptId/answer - Save answer for an attempt
router.put('/attempt/:attemptId/answer', authenticate, requireExamAttemptAccess, testController.saveAnswer);

// PUT /api/test/attempt/:attemptId/mark-review - Toggle mark for review
router.put('/attempt/:attemptId/mark-review', authenticate, requireExamAttemptAccess, testController.toggleMarkForReview);

// PUT /api/test/attempt/:attemptId/navigate - Navigate to section/question
router.put('/attempt/:attemptId/navigate', authenticate, requireExamAttemptAccess, testController.navigateToQuestion);

// POST /api/test/attempt/:attemptId/heartbeat - Keep-alive and timer sync
router.post('/attempt/:attemptId/heartbeat', authenticate, requireExamAttemptAccess, testController.heartbeat);

// POST /api/test/attempt/:attemptId/submit - Submit an attempt
router.post('/attempt/:attemptId/submit', authenticate, requireExamAttemptAccess, testController.submitExam);

// GET /api/test/attempt/:attemptId/result - Get attempt result
router.get('/attempt/:attemptId/result', authenticate, requireExamAttemptAccess, testController.getExamResult);

export default router;
