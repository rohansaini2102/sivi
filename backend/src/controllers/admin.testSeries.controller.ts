import { Request, Response } from 'express';
import TestSeries from '../models/TestSeries';
import { generateUniqueSlug } from '../utils/slug';
import { uploadThumbnail, deleteFromR2 } from '../services/upload.service';
import {
  createTestSeriesSchema,
  updateTestSeriesSchema,
  listTestSeriesQuerySchema,
} from '../validators/testSeries.validator';
import logger from '../utils/logger';

// List all test series (admin)
export const listTestSeries = async (req: Request, res: Response) => {
  try {
    const query = listTestSeriesQuerySchema.parse(req.query);
    const { page, limit, search, category, isPublished, isFeatured, sortBy, sortOrder } = query;

    // Build filter
    const filter: any = {};

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    if (category && category !== 'all') {
      filter.examCategory = category;
    }

    if (typeof isPublished === 'boolean') {
      filter.isPublished = isPublished;
    }

    if (typeof isFeatured === 'boolean') {
      filter.isFeatured = isFeatured;
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
      .select('-description') // Exclude full description for list
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
    logger.error('List test series error:', error);
    res.status(400).json({
      success: false,
      error: { message: error.message, code: 'LIST_TEST_SERIES_ERROR' },
    });
  }
};

// Get single test series by ID (admin)
export const getTestSeriesById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const testSeries = await TestSeries.findById(id).lean();

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
    logger.error('Get test series error:', error);
    res.status(400).json({
      success: false,
      error: { message: error.message, code: 'GET_TEST_SERIES_ERROR' },
    });
  }
};

// Create test series
export const createTestSeries = async (req: Request, res: Response) => {
  try {
    // Parse and validate body
    let parsedData;
    try {
      parsedData = JSON.parse(req.body.data || '{}');
      logger.info('Parsed test series data:', {
        keys: Object.keys(parsedData),
        hasTitle: !!parsedData.title
      });
    } catch (error) {
      logger.error('Failed to parse req.body.data:', error);
      return res.status(400).json({
        success: false,
        error: { message: 'Invalid data format', code: 'INVALID_JSON' },
      });
    }

    const validatedData = createTestSeriesSchema.parse(parsedData);

    // Generate unique slug
    const slug = await generateUniqueSlug(validatedData.title, TestSeries);

    // Handle thumbnail - check file upload OR pre-uploaded URL
    let thumbnailUrl = '';
    if (req.file) {
      // New file uploaded in this request
      const { url } = await uploadThumbnail(req.file);
      thumbnailUrl = url;
    } else if (parsedData.thumbnailUrl) {
      // Pre-uploaded URL from ImageUpload component
      thumbnailUrl = parsedData.thumbnailUrl;
      logger.info('Using pre-uploaded thumbnail:', thumbnailUrl);
    }

    // Create test series
    const testSeries = new TestSeries({
      ...validatedData,
      slug,
      thumbnail: thumbnailUrl,
      createdBy: req.user!.userId,
    });

    await testSeries.save();

    logger.info(`Test series created: ${testSeries._id} by ${req.user!.userId}`);

    res.status(201).json({
      success: true,
      data: testSeries,
      message: 'Test series created successfully',
    });
  } catch (error: any) {
    logger.error('Create test series error:', error);

    // Handle Zod validation errors
    if (error.errors) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Validation error',
          code: 'VALIDATION_ERROR',
          details: error.errors,
        },
      });
    }

    res.status(400).json({
      success: false,
      error: { message: error.message, code: 'CREATE_TEST_SERIES_ERROR' },
    });
  }
};

// Update test series
export const updateTestSeries = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Find existing test series
    const existingTestSeries = await TestSeries.findById(id);
    if (!existingTestSeries) {
      return res.status(404).json({
        success: false,
        error: { message: 'Test series not found', code: 'TEST_SERIES_NOT_FOUND' },
      });
    }

    // Parse and validate body
    let parsedData;
    try {
      parsedData = JSON.parse(req.body.data || '{}');
    } catch (error) {
      logger.error('Failed to parse req.body.data:', error);
      return res.status(400).json({
        success: false,
        error: { message: 'Invalid data format', code: 'INVALID_JSON' },
      });
    }

    const validatedData = updateTestSeriesSchema.parse(parsedData);

    // Generate new slug if title changed
    let slug = existingTestSeries.slug;
    if (validatedData.title && validatedData.title !== existingTestSeries.title) {
      slug = await generateUniqueSlug(validatedData.title, TestSeries, id);
    }

    // Handle thumbnail upload
    let thumbnailUrl = existingTestSeries.thumbnail;
    if (req.file) {
      // Delete old thumbnail if exists
      if (existingTestSeries.thumbnail) {
        await deleteFromR2(existingTestSeries.thumbnail);
      }
      // Upload new thumbnail
      const { url } = await uploadThumbnail(req.file);
      thumbnailUrl = url;
    } else if (parsedData.thumbnailUrl && parsedData.thumbnailUrl !== existingTestSeries.thumbnail) {
      // Updated to pre-uploaded URL
      thumbnailUrl = parsedData.thumbnailUrl;
      logger.info('Updating to pre-uploaded thumbnail:', thumbnailUrl);
    }

    // Update test series
    const updatedTestSeries = await TestSeries.findByIdAndUpdate(
      id,
      {
        ...validatedData,
        slug,
        thumbnail: thumbnailUrl,
      },
      { new: true }
    );

    logger.info(`Test series updated: ${id} by ${req.user!.userId}`);

    res.json({
      success: true,
      data: updatedTestSeries,
      message: 'Test series updated successfully',
    });
  } catch (error: any) {
    logger.error('Update test series error:', {
      error: error.message,
      hasReqFile: !!req.file,
      hasReqBodyData: !!req.body.data,
      bodyKeys: Object.keys(req.body),
    });

    if (error.errors) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Validation error',
          code: 'VALIDATION_ERROR',
          details: error.errors,
        },
      });
    }

    res.status(400).json({
      success: false,
      error: { message: error.message, code: 'UPDATE_TEST_SERIES_ERROR' },
    });
  }
};

// Delete test series
export const deleteTestSeries = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const testSeries = await TestSeries.findById(id);
    if (!testSeries) {
      return res.status(404).json({
        success: false,
        error: { message: 'Test series not found', code: 'TEST_SERIES_NOT_FOUND' },
      });
    }

    // Delete thumbnail from R2
    if (testSeries.thumbnail) {
      await deleteFromR2(testSeries.thumbnail);
    }

    // Delete test series
    await TestSeries.findByIdAndDelete(id);

    logger.info(`Test series deleted: ${id} by ${req.user!.userId}`);

    res.json({
      success: true,
      message: 'Test series deleted successfully',
    });
  } catch (error: any) {
    logger.error('Delete test series error:', error);
    res.status(400).json({
      success: false,
      error: { message: error.message, code: 'DELETE_TEST_SERIES_ERROR' },
    });
  }
};

// Toggle publish status
export const togglePublish = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const testSeries = await TestSeries.findById(id);
    if (!testSeries) {
      return res.status(404).json({
        success: false,
        error: { message: 'Test series not found', code: 'TEST_SERIES_NOT_FOUND' },
      });
    }

    testSeries.isPublished = !testSeries.isPublished;
    await testSeries.save();

    logger.info(`Test series publish toggled: ${id} to ${testSeries.isPublished} by ${req.user!.userId}`);

    res.json({
      success: true,
      data: { isPublished: testSeries.isPublished },
      message: `Test series ${testSeries.isPublished ? 'published' : 'unpublished'} successfully`,
    });
  } catch (error: any) {
    logger.error('Toggle publish error:', error);
    res.status(400).json({
      success: false,
      error: { message: error.message, code: 'TOGGLE_PUBLISH_ERROR' },
    });
  }
};

export default {
  listTestSeries,
  getTestSeriesById,
  createTestSeries,
  updateTestSeries,
  deleteTestSeries,
  togglePublish,
};
