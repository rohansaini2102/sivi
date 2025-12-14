import { Router } from 'express';
import { authenticate, requireRole, checkPasswordChange } from '../middleware/auth.middleware';
import { uploadThumbnail, handleMulterError } from '../middleware/upload.middleware';
import * as testSeriesBuilderController from '../controllers/admin.testSeriesBuilder.controller';

const router = Router();

// All routes require authentication and admin role
router.use(authenticate);
router.use(requireRole('admin', 'super_admin'));
router.use(checkPasswordChange);

// ==================== TEST SERIES BUILDER ====================

// Test series listing for builder
router.get('/series', testSeriesBuilderController.getTestSeriesForBuilder);
router.get('/series/:testSeriesId/structure', testSeriesBuilderController.getTestSeriesStructure);

// ==================== EXAMS ====================

router.get('/series/:testSeriesId/exams', testSeriesBuilderController.listExams);
router.post('/series/:testSeriesId/exams', testSeriesBuilderController.createExam);
router.get('/exams/:examId', testSeriesBuilderController.getExam);
router.get('/exams/:examId/full', testSeriesBuilderController.getExamFull);
router.put('/exams/:examId', testSeriesBuilderController.updateExam);
router.delete('/exams/:examId', testSeriesBuilderController.deleteExam);
router.patch('/exams/:examId/order', testSeriesBuilderController.reorderExam);
router.patch('/exams/:examId/publish', testSeriesBuilderController.toggleExamPublish);

// ==================== EXAM SECTIONS ====================

router.get('/exams/:examId/sections', testSeriesBuilderController.listSections);
router.post('/exams/:examId/sections', testSeriesBuilderController.createSection);
router.put('/sections/:examId/:sectionId', testSeriesBuilderController.updateSection);
router.delete('/sections/:examId/:sectionId', testSeriesBuilderController.deleteSection);
router.patch('/sections/:examId/:sectionId/order', testSeriesBuilderController.reorderSection);

// ==================== SECTION QUESTIONS ====================

router.get('/sections/:examId/:sectionId/questions', testSeriesBuilderController.getSectionQuestions);
router.post('/sections/:examId/:sectionId/questions', testSeriesBuilderController.addQuestionToSection);
router.post('/sections/:examId/:sectionId/questions/bulk', testSeriesBuilderController.bulkAddQuestionsToSection);
router.delete('/sections/:examId/:sectionId/questions/:questionId', testSeriesBuilderController.removeQuestionFromSection);
router.patch('/sections/:examId/:sectionId/questions/reorder', testSeriesBuilderController.reorderSectionQuestions);

// ==================== COMPREHENSION PASSAGES ====================

router.get('/comprehensions', testSeriesBuilderController.listComprehensionPassages);
router.post('/comprehensions', testSeriesBuilderController.createComprehensionPassage);
router.get('/comprehensions/:passageId', testSeriesBuilderController.getComprehensionPassage);
router.put('/comprehensions/:passageId', testSeriesBuilderController.updateComprehensionPassage);
router.delete('/comprehensions/:passageId', testSeriesBuilderController.deleteComprehensionPassage);
router.post('/comprehensions/:passageId/questions', testSeriesBuilderController.addQuestionToPassage);
router.delete('/comprehensions/:passageId/questions/:questionId', testSeriesBuilderController.removeQuestionFromPassage);

// ==================== QUESTION BANK (Enhanced) ====================

router.get('/questions', testSeriesBuilderController.listQuestions);
router.post('/questions', testSeriesBuilderController.createQuestion);
router.get('/questions/:questionId', testSeriesBuilderController.getQuestion);
router.put('/questions/:questionId', testSeriesBuilderController.updateQuestion);
router.delete('/questions/:questionId', testSeriesBuilderController.deleteQuestion);

// ==================== FILE UPLOADS ====================

router.post('/upload/question-image', uploadThumbnail, handleMulterError, testSeriesBuilderController.uploadQuestionImage);

export default router;
