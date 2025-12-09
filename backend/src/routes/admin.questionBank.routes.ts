import { Router } from 'express';
import multer from 'multer';
import { authenticate, requireRole, checkPasswordChange } from '../middleware/auth.middleware';
import * as questionBankController from '../controllers/admin.questionBank.controller';

const router = Router();

// Configure multer for file uploads (memory storage)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max file size
  },
  fileFilter: (_req, file, cb) => {
    // Accept CSV and Excel files
    const allowedMimeTypes = [
      'text/csv',
      'application/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ];
    const allowedExtensions = ['.csv', '.xlsx', '.xls'];

    const ext = file.originalname.toLowerCase().slice(file.originalname.lastIndexOf('.'));

    if (allowedMimeTypes.includes(file.mimetype) || allowedExtensions.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV and Excel files are allowed'));
    }
  },
});

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

// Bulk Import - with file upload middleware
router.post('/bulk-import', upload.single('file'), questionBankController.bulkImportQuestions);

// Export - POST to allow sending filters/IDs in body
router.post('/export', questionBankController.exportQuestions);

export default router;
