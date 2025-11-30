import { Router } from 'express';

const router = Router();

// GET /api/store/courses
router.get('/courses', (req, res) => {
  res.json({ message: 'Get courses - To be implemented' });
});

// GET /api/store/courses/:slug
router.get('/courses/:slug', (req, res) => {
  res.json({ message: `Get course ${req.params.slug} - To be implemented` });
});

// GET /api/store/test-series
router.get('/test-series', (req, res) => {
  res.json({ message: 'Get test series - To be implemented' });
});

// GET /api/store/test-series/:slug
router.get('/test-series/:slug', (req, res) => {
  res.json({ message: `Get test series ${req.params.slug} - To be implemented` });
});

// GET /api/store/bundles
router.get('/bundles', (req, res) => {
  res.json({ message: 'Get bundles - To be implemented' });
});

// GET /api/store/search
router.get('/search', (req, res) => {
  res.json({ message: 'Search - To be implemented' });
});

export default router;
