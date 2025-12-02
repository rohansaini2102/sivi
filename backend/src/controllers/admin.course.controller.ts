import { Request, Response } from 'express';
import Course from '../models/Course';
import { generateUniqueSlug } from '../utils/slug';
import { uploadThumbnail, deleteFromR2 } from '../services/upload.service';
import {
  createCourseSchema,
  updateCourseSchema,
  listCoursesQuerySchema,
} from '../validators/course.validator';
import logger from '../utils/logger';

// List all courses (admin)
export const listCourses = async (req: Request, res: Response) => {
  try {
    const query = listCoursesQuerySchema.parse(req.query);
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
    const total = await Course.countDocuments(filter);

    // Get courses
    const courses = await Course.find(filter)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit)
      .select('-description') // Exclude full description for list
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
    logger.error('List courses error:', error);
    res.status(400).json({
      success: false,
      error: { message: error.message, code: 'LIST_COURSES_ERROR' },
    });
  }
};

// Get single course by ID (admin)
export const getCourseById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const course = await Course.findById(id).lean();

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
    logger.error('Get course error:', error);
    res.status(400).json({
      success: false,
      error: { message: error.message, code: 'GET_COURSE_ERROR' },
    });
  }
};

// Create course
export const createCourse = async (req: Request, res: Response) => {
  try {
    // Parse and validate body
    let parsedData;
    try {
      parsedData = JSON.parse(req.body.data || '{}');
      logger.info('Parsed course data:', {
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

    const validatedData = createCourseSchema.parse(parsedData);

    // Generate unique slug
    const slug = await generateUniqueSlug(validatedData.title, Course);

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

    // Create course
    const course = new Course({
      ...validatedData,
      slug,
      thumbnail: thumbnailUrl,
      createdBy: req.user!.userId,
    });

    await course.save();

    logger.info(`Course created: ${course._id} by ${req.user!.userId}`);

    res.status(201).json({
      success: true,
      data: course,
      message: 'Course created successfully',
    });
  } catch (error: any) {
    logger.error('Create course error:', error);

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
      error: { message: error.message, code: 'CREATE_COURSE_ERROR' },
    });
  }
};

// Update course
export const updateCourse = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Find existing course
    const existingCourse = await Course.findById(id);
    if (!existingCourse) {
      return res.status(404).json({
        success: false,
        error: { message: 'Course not found', code: 'COURSE_NOT_FOUND' },
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

    const validatedData = updateCourseSchema.parse(parsedData);

    // Generate new slug if title changed
    let slug = existingCourse.slug;
    if (validatedData.title && validatedData.title !== existingCourse.title) {
      slug = await generateUniqueSlug(validatedData.title, Course, id);
    }

    // Handle thumbnail upload
    let thumbnailUrl = existingCourse.thumbnail;
    if (req.file) {
      // Delete old thumbnail if exists
      if (existingCourse.thumbnail) {
        await deleteFromR2(existingCourse.thumbnail);
      }
      // Upload new thumbnail
      const { url } = await uploadThumbnail(req.file);
      thumbnailUrl = url;
    } else if (parsedData.thumbnailUrl && parsedData.thumbnailUrl !== existingCourse.thumbnail) {
      // Updated to pre-uploaded URL
      thumbnailUrl = parsedData.thumbnailUrl;
      logger.info('Updating to pre-uploaded thumbnail:', thumbnailUrl);
    }

    // Update course
    const updatedCourse = await Course.findByIdAndUpdate(
      id,
      {
        ...validatedData,
        slug,
        thumbnail: thumbnailUrl,
      },
      { new: true }
    );

    logger.info(`Course updated: ${id} by ${req.user!.userId}`);

    res.json({
      success: true,
      data: updatedCourse,
      message: 'Course updated successfully',
    });
  } catch (error: any) {
    logger.error('Update course error:', {
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
      error: { message: error.message, code: 'UPDATE_COURSE_ERROR' },
    });
  }
};

// Delete course
export const deleteCourse = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({
        success: false,
        error: { message: 'Course not found', code: 'COURSE_NOT_FOUND' },
      });
    }

    // Delete thumbnail from R2
    if (course.thumbnail) {
      await deleteFromR2(course.thumbnail);
    }

    // Delete course
    await Course.findByIdAndDelete(id);

    logger.info(`Course deleted: ${id} by ${req.user!.userId}`);

    res.json({
      success: true,
      message: 'Course deleted successfully',
    });
  } catch (error: any) {
    logger.error('Delete course error:', error);
    res.status(400).json({
      success: false,
      error: { message: error.message, code: 'DELETE_COURSE_ERROR' },
    });
  }
};

// Toggle publish status
export const togglePublish = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({
        success: false,
        error: { message: 'Course not found', code: 'COURSE_NOT_FOUND' },
      });
    }

    course.isPublished = !course.isPublished;
    await course.save();

    logger.info(`Course publish toggled: ${id} to ${course.isPublished} by ${req.user!.userId}`);

    res.json({
      success: true,
      data: { isPublished: course.isPublished },
      message: `Course ${course.isPublished ? 'published' : 'unpublished'} successfully`,
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
  listCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  togglePublish,
};
