import { Router } from 'express';
import { authenticate, requireRole, checkPasswordChange } from '../middleware/auth.middleware';
import * as questionBankController from '../controllers/admin.questionBank.controller';

const router = Router();

// All routes require authentication and admin role
router.use(authenticate);
router.use(requireRole('admin', 'super_admin'));
router.use(checkPasswordChange);

// Question Bank CRUD
router.get('/', questionBankController.listQuestions);
router.get('/stats', questionBankController.getQuestionStats);
router.get('/template', questionBankController.getImportTemplate);
router.get('/:questionId', questionBankController.getQuestion);
router.post('/', questionBankController.createQuestion);
router.put('/:questionId', questionBankController.updateQuestion);
router.delete('/:questionId', questionBankController.deleteQuestion);
router.post('/:questionId/duplicate', questionBankController.duplicateQuestion);

// Bulk Import
router.post('/bulk-import', questionBankController.bulkImportQuestions);

export default router;
