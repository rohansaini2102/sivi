import { Router } from 'express';
import * as storeController from '../controllers/store.controller';

const router = Router();

// GET /api/store/courses - List published courses
router.get('/courses', storeController.getCourses);

// GET /api/store/courses/:slug - Get single course by slug
router.get('/courses/:slug', storeController.getCourseBySlug);

// GET /api/store/test-series - List published test series
router.get('/test-series', storeController.getTestSeries);

// GET /api/store/test-series/:slug - Get single test series by slug
router.get('/test-series/:slug', storeController.getTestSeriesBySlug);

// GET /api/store/search - Search courses and test series
router.get('/search', storeController.search);

// GET /api/store/featured - Get featured items
router.get('/featured', storeController.getFeatured);

// Bundles (placeholder - to be implemented later)
router.get('/bundles', (req, res) => {
  res.json({ message: 'Get bundles - To be implemented' });
});

export default router;
