import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { requireTestSeriesEnrollment } from '../middleware/enrollment.middleware';

const router = Router();

// ==================== ENROLLED TEST SERIES ====================

// GET /api/test/enrolled - Get user's enrolled test series
router.get('/enrolled', authenticate, (req, res) => {
  res.json({ message: 'Get enrolled test series - To be implemented' });
});

// ==================== TEST SERIES CONTENT ====================

// GET /api/test/series/:testSeriesId/exams - Get exams in a test series (requires enrollment)
router.get('/series/:testSeriesId/exams', authenticate, requireTestSeriesEnrollment, (req, res) => {
  res.json({ message: `Get exams for series ${req.params.testSeriesId} - To be implemented` });
});

// ==================== EXAM OPERATIONS ====================

// POST /api/test/exam/:examId/start - Start an exam attempt (requires enrollment)
router.post('/exam/:examId/start', authenticate, (req, res) => {
  // TODO: Add enrollment check when implementing - need to get testSeriesId from exam
  res.json({ message: `Start exam ${req.params.examId} - To be implemented` });
});

// GET /api/test/exam/:examId/leaderboard - Get exam leaderboard
router.get('/exam/:examId/leaderboard', authenticate, (req, res) => {
  res.json({ message: `Get leaderboard for exam ${req.params.examId} - To be implemented` });
});

// ==================== ATTEMPT OPERATIONS ====================

// PUT /api/test/attempt/:attemptId/answer - Save answer for an attempt
router.put('/attempt/:attemptId/answer', authenticate, (req, res) => {
  // TODO: Add attempt ownership + enrollment check when implementing
  res.json({ message: `Save answer for attempt ${req.params.attemptId} - To be implemented` });
});

// POST /api/test/attempt/:attemptId/submit - Submit an attempt
router.post('/attempt/:attemptId/submit', authenticate, (req, res) => {
  // TODO: Add attempt ownership + enrollment check when implementing
  res.json({ message: `Submit attempt ${req.params.attemptId} - To be implemented` });
});

// GET /api/test/attempt/:attemptId/result - Get attempt result
router.get('/attempt/:attemptId/result', authenticate, (req, res) => {
  // TODO: Add attempt ownership check when implementing
  res.json({ message: `Get result for attempt ${req.params.attemptId} - To be implemented` });
});

export default router;
