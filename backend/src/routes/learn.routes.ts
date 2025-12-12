import { Router } from 'express';
import {
  getEnrollments,
  checkEnrollment,
  getCourseContent,
  getLessonContent,
  markLessonComplete,
  getCourseProgress,
  getQuizInfo,
  startQuiz,
  submitAnswer,
  submitQuiz,
  getQuizResult,
  getQuizAttempts,
  getDashboardProgress,
} from '../controllers/learn.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireQuizAccess, requireQuizAttemptAccess } from '../middleware/enrollment.middleware';

const router = Router();

// ==================== ENROLLMENTS ====================

// GET /api/learn/enrollments
router.get('/enrollments', authenticate, getEnrollments);

// GET /api/learn/check-enrollment
router.get('/check-enrollment', authenticate, checkEnrollment);

// ==================== COURSE CONTENT ====================

// GET /api/learn/courses/:courseId - Get course with full structure
router.get('/courses/:courseId', authenticate, getCourseContent);

// GET /api/learn/courses/:courseId/progress - Get user progress for course
router.get('/courses/:courseId/progress', authenticate, getCourseProgress);

// ==================== LESSONS ====================

// GET /api/learn/lessons/:lessonId - Get lesson content
router.get('/lessons/:lessonId', authenticate, getLessonContent);

// POST /api/learn/lessons/:lessonId/complete - Mark lesson as complete
router.post('/lessons/:lessonId/complete', authenticate, markLessonComplete);

// ==================== QUIZZES ====================

// GET /api/learn/quizzes/:quizId/info - Get quiz info for start screen
router.get('/quizzes/:quizId/info', authenticate, requireQuizAccess, getQuizInfo);

// POST /api/learn/quizzes/:quizId/start - Start quiz attempt
router.post('/quizzes/:quizId/start', authenticate, requireQuizAccess, startQuiz);

// GET /api/learn/quizzes/:quizId/attempts - Get user's quiz attempts history
router.get('/quizzes/:quizId/attempts', authenticate, requireQuizAccess, getQuizAttempts);

// ==================== QUIZ ATTEMPTS ====================

// POST /api/learn/quiz-attempts/:attemptId/answer - Submit answer (practice mode)
router.post('/quiz-attempts/:attemptId/answer', authenticate, requireQuizAttemptAccess, submitAnswer);

// POST /api/learn/quiz-attempts/:attemptId/submit - Submit entire quiz
router.post('/quiz-attempts/:attemptId/submit', authenticate, requireQuizAttemptAccess, submitQuiz);

// GET /api/learn/quiz-attempts/:attemptId/result - Get quiz result
router.get('/quiz-attempts/:attemptId/result', authenticate, requireQuizAttemptAccess, getQuizResult);

// ==================== DASHBOARD ====================

// GET /api/learn/dashboard/progress - Get all courses progress
router.get('/dashboard/progress', authenticate, getDashboardProgress);

export default router;
