import { Router } from 'express';
import { authenticate, requireRole, checkPasswordChange } from '../middleware/auth.middleware';

const router = Router();

// All admin routes require authentication and admin role
router.use(authenticate);
router.use(requireRole('admin', 'super_admin'));
router.use(checkPasswordChange);

// Dashboard
router.get('/dashboard', (req, res) => {
  res.json({ message: 'Admin dashboard - To be implemented' });
});

// Courses CRUD
router.get('/courses', (req, res) => {
  res.json({ message: 'Get all courses - To be implemented' });
});

router.post('/courses', (req, res) => {
  res.json({ message: 'Create course - To be implemented' });
});

router.put('/courses/:id', (req, res) => {
  res.json({ message: `Update course ${req.params.id} - To be implemented` });
});

router.delete('/courses/:id', (req, res) => {
  res.json({ message: `Delete course ${req.params.id} - To be implemented` });
});

// Test Series CRUD
router.get('/test-series', (req, res) => {
  res.json({ message: 'Get all test series - To be implemented' });
});

router.post('/test-series', (req, res) => {
  res.json({ message: 'Create test series - To be implemented' });
});

// Questions
router.get('/questions', (req, res) => {
  res.json({ message: 'Get questions - To be implemented' });
});

router.post('/questions', (req, res) => {
  res.json({ message: 'Create question - To be implemented' });
});

router.post('/questions/bulk-import', (req, res) => {
  res.json({ message: 'Bulk import questions - To be implemented' });
});

// Users
router.get('/users', (req, res) => {
  res.json({ message: 'Get all users - To be implemented' });
});

// Analytics
router.get('/analytics', (req, res) => {
  res.json({ message: 'Get analytics - To be implemented' });
});

// Upload
router.post('/upload', (req, res) => {
  res.json({ message: 'Upload file - To be implemented' });
});

export default router;
