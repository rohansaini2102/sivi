import { Request, Response } from 'express';
import Course from '../models/Course';
import TestSeries from '../models/TestSeries';
import { listCoursesQuerySchema } from '../validators/course.validator';
import { listTestSeriesQuerySchema } from '../validators/testSeries.validator';
import logger from '../utils/logger';

// Get published courses (public)
export const getCourses = async (req: Request, res: Response) => {
  try {
    const query = listCoursesQuerySchema.parse(req.query);
    const { page, limit, search, category, sortBy, sortOrder } = query;

    // Build filter - only published courses
    const filter: any = { isPublished: true };

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { shortDescription: { $regex: search, $options: 'i' } },
      ];
    }

    if (category && category !== 'all') {
      filter.examCategory = category;
    }

    // Build sort
    const sort: any = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Get total count
    const total = await Course.countDocuments(filter);

    // Get courses
    const courses = await Course.find(filter)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit)
      .select('title slug shortDescription thumbnail examCategory price discountPrice validityDays language level features isFree isFeatured totalLessons totalDuration enrollmentCount rating ratingCount createdAt')
      .lean();

    res.json({
      success: true,
      data: {
        courses,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error: any) {
    logger.error('Get courses error:', error);
    res.status(400).json({
      success: false,
      error: { message: error.message, code: 'GET_COURSES_ERROR' },
    });
  }
};

// Get single course by slug (public)
export const getCourseBySlug = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;

    const course = await Course.findOne({ slug, isPublished: true })
      .populate('subjects', 'title description')
      .lean();

    if (!course) {
      return res.status(404).json({
        success: false,
        error: { message: 'Course not found', code: 'COURSE_NOT_FOUND' },
      });
    }

    res.json({
      success: true,
      data: course,
    });
  } catch (error: any) {
    logger.error('Get course by slug error:', error);
    res.status(400).json({
      success: false,
      error: { message: error.message, code: 'GET_COURSE_ERROR' },
    });
  }
};

// Get published test series (public)
export const getTestSeries = async (req: Request, res: Response) => {
  try {
    const query = listTestSeriesQuerySchema.parse(req.query);
    const { page, limit, search, category, sortBy, sortOrder } = query;

    // Build filter - only published test series
    const filter: any = { isPublished: true };

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { shortDescription: { $regex: search, $options: 'i' } },
      ];
    }

    if (category && category !== 'all') {
      filter.examCategory = category;
    }

    // Build sort
    const sort: any = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Get total count
    const total = await TestSeries.countDocuments(filter);

    // Get test series
    const testSeries = await TestSeries.find(filter)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit)
      .select('title slug shortDescription thumbnail examCategory price discountPrice validityDays language features totalExams freeExams isFree isFeatured enrollmentCount rating ratingCount createdAt')
      .lean();

    res.json({
      success: true,
      data: {
        testSeries,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error: any) {
    logger.error('Get test series error:', error);
    res.status(400).json({
      success: false,
      error: { message: error.message, code: 'GET_TEST_SERIES_ERROR' },
    });
  }
};

// Get single test series by slug (public)
export const getTestSeriesBySlug = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;

    const testSeries = await TestSeries.findOne({ slug, isPublished: true })
      .populate('exams', 'title description totalQuestions duration isFree')
      .lean();

    if (!testSeries) {
      return res.status(404).json({
        success: false,
        error: { message: 'Test series not found', code: 'TEST_SERIES_NOT_FOUND' },
      });
    }

    res.json({
      success: true,
      data: testSeries,
    });
  } catch (error: any) {
    logger.error('Get test series by slug error:', error);
    res.status(400).json({
      success: false,
      error: { message: error.message, code: 'GET_TEST_SERIES_ERROR' },
    });
  }
};

// Search courses and test series (public)
export const search = async (req: Request, res: Response) => {
  try {
    const { q, limit = 10 } = req.query;

    if (!q || typeof q !== 'string') {
      return res.json({
        success: true,
        data: { courses: [], testSeries: [] },
      });
    }

    const searchRegex = { $regex: q, $options: 'i' };
    const limitNum = Math.min(Number(limit) || 10, 20);

    // Search courses
    const courses = await Course.find({
      isPublished: true,
      $or: [
        { title: searchRegex },
        { shortDescription: searchRegex },
      ],
    })
      .select('title slug thumbnail examCategory price discountPrice')
      .limit(limitNum)
      .lean();

    // Search test series
    const testSeries = await TestSeries.find({
      isPublished: true,
      $or: [
        { title: searchRegex },
        { shortDescription: searchRegex },
      ],
    })
      .select('title slug thumbnail examCategory price discountPrice')
      .limit(limitNum)
      .lean();

    res.json({
      success: true,
      data: { courses, testSeries },
    });
  } catch (error: any) {
    logger.error('Search error:', error);
    res.status(400).json({
      success: false,
      error: { message: error.message, code: 'SEARCH_ERROR' },
    });
  }
};

// Get featured items (public)
export const getFeatured = async (req: Request, res: Response) => {
  try {
    // Get featured courses
    const courses = await Course.find({ isPublished: true, isFeatured: true })
      .select('title slug shortDescription thumbnail examCategory price discountPrice validityDays enrollmentCount rating')
      .limit(6)
      .lean();

    // Get featured test series
    const testSeries = await TestSeries.find({ isPublished: true, isFeatured: true })
      .select('title slug shortDescription thumbnail examCategory price discountPrice totalExams freeExams enrollmentCount rating')
      .limit(6)
      .lean();

    res.json({
      success: true,
      data: { courses, testSeries },
    });
  } catch (error: any) {
    logger.error('Get featured error:', error);
    res.status(400).json({
      success: false,
      error: { message: error.message, code: 'GET_FEATURED_ERROR' },
    });
  }
};

export default {
  getCourses,
  getCourseBySlug,
  getTestSeries,
  getTestSeriesBySlug,
  search,
  getFeatured,
};
