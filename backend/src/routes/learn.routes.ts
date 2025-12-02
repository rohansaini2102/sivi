import { Router } from 'express';
import { getEnrollments, checkEnrollment } from '../controllers/learn.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// GET /api/learn/enrollments
router.get('/enrollments', authenticate, getEnrollments);

// GET /api/learn/check-enrollment
router.get('/check-enrollment', authenticate, checkEnrollment);

// GET /api/learn/course/:courseId
router.get('/course/:courseId', (req, res) => {
  res.json({ message: `Get course ${req.params.courseId} - To be implemented` });
});

// GET /api/learn/lesson/:lessonId
router.get('/lesson/:lessonId', (req, res) => {
  res.json({ message: `Get lesson ${req.params.lessonId} - To be implemented` });
});

// POST /api/learn/lesson/:lessonId/complete
router.post('/lesson/:lessonId/complete', (req, res) => {
  res.json({ message: `Complete lesson ${req.params.lessonId} - To be implemented` });
});

// GET /api/learn/quiz/:quizId
router.get('/quiz/:quizId', (req, res) => {
  res.json({ message: `Get quiz ${req.params.quizId} - To be implemented` });
});

// POST /api/learn/quiz/:quizId/submit
router.post('/quiz/:quizId/submit', (req, res) => {
  res.json({ message: `Submit quiz ${req.params.quizId} - To be implemented` });
});

// GET /api/learn/progress/:courseId
router.get('/progress/:courseId', (req, res) => {
  res.json({ message: `Get progress for ${req.params.courseId} - To be implemented` });
});

export default router;
