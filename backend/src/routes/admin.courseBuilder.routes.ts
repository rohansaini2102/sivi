import { Router } from 'express';
import { authenticate, requireRole, checkPasswordChange } from '../middleware/auth.middleware';
import { uploadThumbnail, uploadPDF as uploadPDFMiddleware, handleMulterError } from '../middleware/upload.middleware';
import * as courseBuilderController from '../controllers/admin.courseBuilder.controller';
import * as quizController from '../controllers/admin.quiz.controller';

const router = Router();

// PDF upload middleware instance
const uploadPDFSingle = uploadPDFMiddleware.single('file');

// All routes require authentication and admin role
router.use(authenticate);
router.use(requireRole('admin', 'super_admin'));
router.use(checkPasswordChange);

// ==================== COURSE BUILDER ====================

// Course listing for builder
router.get('/courses', courseBuilderController.getCoursesForBuilder);
router.get('/courses/:courseId/structure', courseBuilderController.getCourseStructure);

// ==================== SUBJECTS ====================

router.get('/courses/:courseId/subjects', courseBuilderController.listSubjects);
router.post('/courses/:courseId/subjects', courseBuilderController.createSubject);
router.put('/subjects/:subjectId', courseBuilderController.updateSubject);
router.delete('/subjects/:subjectId', courseBuilderController.deleteSubject);
router.patch('/subjects/:subjectId/order', courseBuilderController.reorderSubject);

// ==================== CHAPTERS ====================

router.get('/subjects/:subjectId/chapters', courseBuilderController.listChapters);
router.post('/subjects/:subjectId/chapters', courseBuilderController.createChapter);
router.put('/chapters/:chapterId', courseBuilderController.updateChapter);
router.delete('/chapters/:chapterId', courseBuilderController.deleteChapter);
router.patch('/chapters/:chapterId/order', courseBuilderController.reorderChapter);

// ==================== LESSONS ====================

router.get('/chapters/:chapterId/lessons', courseBuilderController.listLessons);
router.get('/lessons/:lessonId', courseBuilderController.getLesson);
router.post('/chapters/:chapterId/lessons', courseBuilderController.createLesson);
router.put('/lessons/:lessonId', courseBuilderController.updateLesson);
router.delete('/lessons/:lessonId', courseBuilderController.deleteLesson);
router.patch('/lessons/:lessonId/order', courseBuilderController.reorderLesson);

// ==================== QUIZZES ====================

router.post('/lessons/:lessonId/quiz', quizController.createQuiz);
router.get('/quizzes/:quizId', quizController.getQuiz);
router.put('/quizzes/:quizId', quizController.updateQuiz);
router.delete('/quizzes/:quizId', quizController.deleteQuiz);

// Quiz Questions
router.get('/quizzes/:quizId/questions', quizController.getQuizQuestions);
router.post('/quizzes/:quizId/questions', quizController.addQuestionToQuiz);
router.post('/quizzes/:quizId/questions/bulk', quizController.addQuestionsToQuiz);
router.delete('/quizzes/:quizId/questions/:questionId', quizController.removeQuestionFromQuiz);
router.patch('/quizzes/:quizId/questions/reorder', quizController.reorderQuizQuestions);
router.post('/quizzes/:quizId/questions/create', quizController.createQuestionForQuiz);

// ==================== FILE UPLOADS ====================

router.post('/upload/pdf', uploadPDFSingle, handleMulterError, courseBuilderController.uploadPDFFile);
router.post('/upload/image', uploadThumbnail, handleMulterError, courseBuilderController.uploadImage);

export default router;
