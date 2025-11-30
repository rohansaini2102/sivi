import { Router } from 'express';

const router = Router();

// GET /api/test/enrolled
router.get('/enrolled', (req, res) => {
  res.json({ message: 'Get enrolled test series - To be implemented' });
});

// GET /api/test/series/:id/exams
router.get('/series/:id/exams', (req, res) => {
  res.json({ message: `Get exams for series ${req.params.id} - To be implemented` });
});

// POST /api/test/exam/:examId/start
router.post('/exam/:examId/start', (req, res) => {
  res.json({ message: `Start exam ${req.params.examId} - To be implemented` });
});

// PUT /api/test/attempt/:attemptId/answer
router.put('/attempt/:attemptId/answer', (req, res) => {
  res.json({ message: `Save answer for attempt ${req.params.attemptId} - To be implemented` });
});

// POST /api/test/attempt/:attemptId/submit
router.post('/attempt/:attemptId/submit', (req, res) => {
  res.json({ message: `Submit attempt ${req.params.attemptId} - To be implemented` });
});

// GET /api/test/attempt/:attemptId/result
router.get('/attempt/:attemptId/result', (req, res) => {
  res.json({ message: `Get result for attempt ${req.params.attemptId} - To be implemented` });
});

// GET /api/test/exam/:examId/leaderboard
router.get('/exam/:examId/leaderboard', (req, res) => {
  res.json({ message: `Get leaderboard for exam ${req.params.examId} - To be implemented` });
});

export default router;
