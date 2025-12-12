import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Course from '../models/Course';
import Subject from '../models/Subject';
import Chapter from '../models/Chapter';
import Lesson from '../models/Lesson';
import Quiz from '../models/Quiz';
import { uploadThumbnail, uploadPDF, deleteFromR2 } from '../services/upload.service';
import logger from '../utils/logger';

// ==================== COURSE BUILDER LIST ====================

// Get courses for builder (with content stats)
export const getCoursesForBuilder = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20, search, status } = req.query;

    const filter: any = {};

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
      ];
    }

    if (status === 'published') {
      filter.isPublished = true;
    } else if (status === 'draft') {
      filter.isPublished = false;
    }

    const total = await Course.countDocuments(filter);

    const courses = await Course.find(filter)
      .sort({ updatedAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .select('title slug thumbnail isPublished examCategory totalLessons totalDuration createdAt updatedAt')
      .lean();

    // Get content stats for each course
    const coursesWithStats = await Promise.all(
      courses.map(async (course) => {
        const [subjectCount, chapterCount, lessonCount, quizCount] = await Promise.all([
          Subject.countDocuments({ course: course._id }),
          Chapter.countDocuments({ course: course._id }),
          Lesson.countDocuments({ course: course._id }),
          Quiz.countDocuments({ course: course._id }),
        ]);

        return {
          ...course,
          stats: {
            totalSubjects: subjectCount,
            totalChapters: chapterCount,
            totalLessons: lessonCount,
            totalQuizzes: quizCount,
          },
        };
      })
    );

    res.json({
      success: true,
      data: {
        courses: coursesWithStats,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages: Math.ceil(total / Number(limit)),
        },
      },
    });
  } catch (error: any) {
    logger.error('Get courses for builder error:', error);
    res.status(400).json({
      success: false,
      error: { message: error.message, code: 'GET_COURSES_ERROR' },
    });
  }
};

// Get course with full structure for builder
export const getCourseStructure = async (req: Request, res: Response) => {
  try {
    const { courseId } = req.params;

    const course = await Course.findById(courseId)
      .select('title slug thumbnail isPublished examCategory')
      .lean();

    if (!course) {
      return res.status(404).json({
        success: false,
        error: { message: 'Course not found', code: 'COURSE_NOT_FOUND' },
      });
    }

    // Get subjects with chapters and lessons
    const subjects = await Subject.find({ course: courseId })
      .sort({ order: 1 })
      .lean();

    const subjectsWithContent = await Promise.all(
      subjects.map(async (subject) => {
        const chapters = await Chapter.find({ subject: subject._id })
          .sort({ order: 1 })
          .lean();

        const chaptersWithLessons = await Promise.all(
          chapters.map(async (chapter) => {
            const lessons = await Lesson.find({ chapter: chapter._id })
              .sort({ order: 1 })
              .select('title titleHi type order isFree isPublished duration content contentHi pdfUrl pdfName pdfSize allowDownload quiz')
              .lean();

            return {
              ...chapter,
              lessons,
            };
          })
        );

        return {
          ...subject,
          chapters: chaptersWithLessons,
        };
      })
    );

    res.json({
      success: true,
      data: {
        course,
        subjects: subjectsWithContent,
      },
    });
  } catch (error: any) {
    logger.error('Get course structure error:', error);
    res.status(400).json({
      success: false,
      error: { message: error.message, code: 'GET_COURSE_STRUCTURE_ERROR' },
    });
  }
};

// ==================== SUBJECT CRUD ====================

// List subjects for a course
export const listSubjects = async (req: Request, res: Response) => {
  try {
    const { courseId } = req.params;

    const subjects = await Subject.find({ course: courseId })
      .sort({ order: 1 })
      .lean();

    res.json({
      success: true,
      data: subjects,
    });
  } catch (error: any) {
    logger.error('List subjects error:', error);
    res.status(400).json({
      success: false,
      error: { message: error.message, code: 'LIST_SUBJECTS_ERROR' },
    });
  }
};

// Create subject
export const createSubject = async (req: Request, res: Response) => {
  try {
    const { courseId } = req.params;
    const { title, titleHi, description, descriptionHi, icon } = req.body;

    // Verify course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        error: { message: 'Course not found', code: 'COURSE_NOT_FOUND' },
      });
    }

    // Get next order
    const lastSubject = await Subject.findOne({ course: courseId })
      .sort({ order: -1 })
      .select('order');
    const order = lastSubject ? lastSubject.order + 1 : 0;

    const subject = new Subject({
      title,
      titleHi,
      description,
      descriptionHi,
      icon,
      course: courseId,
      order,
    });

    await subject.save();

    // Update course stats
    await Course.findByIdAndUpdate(courseId, {
      $push: { subjects: subject._id },
    });

    logger.info(`Subject created: ${subject._id} for course ${courseId}`);

    res.status(201).json({
      success: true,
      data: subject,
      message: 'Subject created successfully',
    });
  } catch (error: any) {
    logger.error('Create subject error:', error);
    res.status(400).json({
      success: false,
      error: { message: error.message, code: 'CREATE_SUBJECT_ERROR' },
    });
  }
};

// Update subject
export const updateSubject = async (req: Request, res: Response) => {
  try {
    const { subjectId } = req.params;
    const { title, titleHi, description, descriptionHi, icon, isPublished } = req.body;

    const subject = await Subject.findByIdAndUpdate(
      subjectId,
      {
        title,
        titleHi,
        description,
        descriptionHi,
        icon,
        ...(typeof isPublished === 'boolean' && { isPublished }),
      },
      { new: true }
    );

    if (!subject) {
      return res.status(404).json({
        success: false,
        error: { message: 'Subject not found', code: 'SUBJECT_NOT_FOUND' },
      });
    }

    logger.info(`Subject updated: ${subjectId}`);

    res.json({
      success: true,
      data: subject,
      message: 'Subject updated successfully',
    });
  } catch (error: any) {
    logger.error('Update subject error:', error);
    res.status(400).json({
      success: false,
      error: { message: error.message, code: 'UPDATE_SUBJECT_ERROR' },
    });
  }
};

// Delete subject
export const deleteSubject = async (req: Request, res: Response) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { subjectId } = req.params;

    const subject = await Subject.findById(subjectId);
    if (!subject) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        error: { message: 'Subject not found', code: 'SUBJECT_NOT_FOUND' },
      });
    }

    // Delete all lessons in this subject
    const lessons = await Lesson.find({ subject: subjectId });
    for (const lesson of lessons) {
      // Delete associated PDFs from R2
      if (lesson.pdfUrl) {
        await deleteFromR2(lesson.pdfUrl);
      }
      // Delete associated quizzes
      if (lesson.quiz) {
        await Quiz.findByIdAndDelete(lesson.quiz, { session });
      }
    }
    await Lesson.deleteMany({ subject: subjectId }, { session });

    // Delete all chapters in this subject
    await Chapter.deleteMany({ subject: subjectId }, { session });

    // Delete subject
    await Subject.findByIdAndDelete(subjectId, { session });

    // Update course
    await Course.findByIdAndUpdate(
      subject.course,
      { $pull: { subjects: subjectId } },
      { session }
    );

    await session.commitTransaction();

    logger.info(`Subject deleted: ${subjectId} with all chapters and lessons`);

    res.json({
      success: true,
      message: 'Subject and all its content deleted successfully',
    });
  } catch (error: any) {
    await session.abortTransaction();
    logger.error('Delete subject error:', error);
    res.status(400).json({
      success: false,
      error: { message: error.message, code: 'DELETE_SUBJECT_ERROR' },
    });
  } finally {
    session.endSession();
  }
};

// Reorder subject
export const reorderSubject = async (req: Request, res: Response) => {
  try {
    const { subjectId } = req.params;
    const { newOrder } = req.body;

    const subject = await Subject.findById(subjectId);
    if (!subject) {
      return res.status(404).json({
        success: false,
        error: { message: 'Subject not found', code: 'SUBJECT_NOT_FOUND' },
      });
    }

    const oldOrder = subject.order;

    // Shift other subjects
    if (newOrder > oldOrder) {
      // Moving down
      await Subject.updateMany(
        { course: subject.course, order: { $gt: oldOrder, $lte: newOrder } },
        { $inc: { order: -1 } }
      );
    } else if (newOrder < oldOrder) {
      // Moving up
      await Subject.updateMany(
        { course: subject.course, order: { $gte: newOrder, $lt: oldOrder } },
        { $inc: { order: 1 } }
      );
    }

    // Update subject order
    subject.order = newOrder;
    await subject.save();

    res.json({
      success: true,
      message: 'Subject reordered successfully',
    });
  } catch (error: any) {
    logger.error('Reorder subject error:', error);
    res.status(400).json({
      success: false,
      error: { message: error.message, code: 'REORDER_SUBJECT_ERROR' },
    });
  }
};

// ==================== CHAPTER CRUD ====================

// List chapters for a subject
export const listChapters = async (req: Request, res: Response) => {
  try {
    const { subjectId } = req.params;

    const chapters = await Chapter.find({ subject: subjectId })
      .sort({ order: 1 })
      .lean();

    res.json({
      success: true,
      data: chapters,
    });
  } catch (error: any) {
    logger.error('List chapters error:', error);
    res.status(400).json({
      success: false,
      error: { message: error.message, code: 'LIST_CHAPTERS_ERROR' },
    });
  }
};

// Create chapter
export const createChapter = async (req: Request, res: Response) => {
  try {
    const { subjectId } = req.params;
    const { title, titleHi, description, descriptionHi, isFree } = req.body;

    // Verify subject exists
    const subject = await Subject.findById(subjectId);
    if (!subject) {
      return res.status(404).json({
        success: false,
        error: { message: 'Subject not found', code: 'SUBJECT_NOT_FOUND' },
      });
    }

    // Get next order
    const lastChapter = await Chapter.findOne({ subject: subjectId })
      .sort({ order: -1 })
      .select('order');
    const order = lastChapter ? lastChapter.order + 1 : 0;

    const chapter = new Chapter({
      title,
      titleHi,
      description,
      descriptionHi,
      isFree: isFree || false,
      course: subject.course,
      subject: subjectId,
      order,
    });

    await chapter.save();

    // Update subject
    await Subject.findByIdAndUpdate(subjectId, {
      $push: { chapters: chapter._id },
      $inc: { totalChapters: 1 },
    });

    logger.info(`Chapter created: ${chapter._id} for subject ${subjectId}`);

    res.status(201).json({
      success: true,
      data: chapter,
      message: 'Chapter created successfully',
    });
  } catch (error: any) {
    logger.error('Create chapter error:', error);
    res.status(400).json({
      success: false,
      error: { message: error.message, code: 'CREATE_CHAPTER_ERROR' },
    });
  }
};

// Update chapter
export const updateChapter = async (req: Request, res: Response) => {
  try {
    const { chapterId } = req.params;
    const { title, titleHi, description, descriptionHi, isFree, isPublished } = req.body;

    const chapter = await Chapter.findByIdAndUpdate(
      chapterId,
      {
        title,
        titleHi,
        description,
        descriptionHi,
        ...(typeof isFree === 'boolean' && { isFree }),
        ...(typeof isPublished === 'boolean' && { isPublished }),
      },
      { new: true }
    );

    if (!chapter) {
      return res.status(404).json({
        success: false,
        error: { message: 'Chapter not found', code: 'CHAPTER_NOT_FOUND' },
      });
    }

    logger.info(`Chapter updated: ${chapterId}`);

    res.json({
      success: true,
      data: chapter,
      message: 'Chapter updated successfully',
    });
  } catch (error: any) {
    logger.error('Update chapter error:', error);
    res.status(400).json({
      success: false,
      error: { message: error.message, code: 'UPDATE_CHAPTER_ERROR' },
    });
  }
};

// Delete chapter
export const deleteChapter = async (req: Request, res: Response) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { chapterId } = req.params;

    const chapter = await Chapter.findById(chapterId);
    if (!chapter) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        error: { message: 'Chapter not found', code: 'CHAPTER_NOT_FOUND' },
      });
    }

    // Delete all lessons in this chapter
    const lessons = await Lesson.find({ chapter: chapterId });
    for (const lesson of lessons) {
      if (lesson.pdfUrl) {
        await deleteFromR2(lesson.pdfUrl);
      }
      if (lesson.quiz) {
        await Quiz.findByIdAndDelete(lesson.quiz, { session });
      }
    }
    await Lesson.deleteMany({ chapter: chapterId }, { session });

    // Delete chapter
    await Chapter.findByIdAndDelete(chapterId, { session });

    // Update subject
    await Subject.findByIdAndUpdate(
      chapter.subject,
      {
        $pull: { chapters: chapterId },
        $inc: { totalChapters: -1, totalLessons: -lessons.length },
      },
      { session }
    );

    await session.commitTransaction();

    logger.info(`Chapter deleted: ${chapterId} with ${lessons.length} lessons`);

    res.json({
      success: true,
      message: 'Chapter and all its lessons deleted successfully',
    });
  } catch (error: any) {
    await session.abortTransaction();
    logger.error('Delete chapter error:', error);
    res.status(400).json({
      success: false,
      error: { message: error.message, code: 'DELETE_CHAPTER_ERROR' },
    });
  } finally {
    session.endSession();
  }
};

// Reorder chapter
export const reorderChapter = async (req: Request, res: Response) => {
  try {
    const { chapterId } = req.params;
    const { newOrder } = req.body;

    const chapter = await Chapter.findById(chapterId);
    if (!chapter) {
      return res.status(404).json({
        success: false,
        error: { message: 'Chapter not found', code: 'CHAPTER_NOT_FOUND' },
      });
    }

    const oldOrder = chapter.order;

    if (newOrder > oldOrder) {
      await Chapter.updateMany(
        { subject: chapter.subject, order: { $gt: oldOrder, $lte: newOrder } },
        { $inc: { order: -1 } }
      );
    } else if (newOrder < oldOrder) {
      await Chapter.updateMany(
        { subject: chapter.subject, order: { $gte: newOrder, $lt: oldOrder } },
        { $inc: { order: 1 } }
      );
    }

    chapter.order = newOrder;
    await chapter.save();

    res.json({
      success: true,
      message: 'Chapter reordered successfully',
    });
  } catch (error: any) {
    logger.error('Reorder chapter error:', error);
    res.status(400).json({
      success: false,
      error: { message: error.message, code: 'REORDER_CHAPTER_ERROR' },
    });
  }
};

// ==================== LESSON CRUD ====================

// List lessons for a chapter
export const listLessons = async (req: Request, res: Response) => {
  try {
    const { chapterId } = req.params;

    const lessons = await Lesson.find({ chapter: chapterId })
      .sort({ order: 1 })
      .lean();

    res.json({
      success: true,
      data: lessons,
    });
  } catch (error: any) {
    logger.error('List lessons error:', error);
    res.status(400).json({
      success: false,
      error: { message: error.message, code: 'LIST_LESSONS_ERROR' },
    });
  }
};

// Get single lesson with full content
export const getLesson = async (req: Request, res: Response) => {
  try {
    const { lessonId } = req.params;

    const lesson = await Lesson.findById(lessonId)
      .populate('quiz')
      .lean();

    if (!lesson) {
      return res.status(404).json({
        success: false,
        error: { message: 'Lesson not found', code: 'LESSON_NOT_FOUND' },
      });
    }

    res.json({
      success: true,
      data: lesson,
    });
  } catch (error: any) {
    logger.error('Get lesson error:', error);
    res.status(400).json({
      success: false,
      error: { message: error.message, code: 'GET_LESSON_ERROR' },
    });
  }
};

// Create lesson
export const createLesson = async (req: Request, res: Response) => {
  try {
    const { chapterId } = req.params;
    const {
      title,
      titleHi,
      type,
      duration,
      isFree,
      content,
      contentHi,
      pdfUrl,
      pdfName,
      pdfSize,
      pdfPages,
      allowDownload,
    } = req.body;

    // Verify chapter exists
    const chapter = await Chapter.findById(chapterId).populate('subject');
    if (!chapter) {
      return res.status(404).json({
        success: false,
        error: { message: 'Chapter not found', code: 'CHAPTER_NOT_FOUND' },
      });
    }

    // Get next order
    const lastLesson = await Lesson.findOne({ chapter: chapterId })
      .sort({ order: -1 })
      .select('order');
    const order = lastLesson ? lastLesson.order + 1 : 0;

    const lesson = new Lesson({
      title,
      titleHi,
      type,
      course: chapter.course,
      subject: chapter.subject,
      chapter: chapterId,
      order,
      duration: duration || 10,
      isFree: isFree || false,
      // Notes content
      content,
      contentHi,
      // PDF fields
      pdfUrl,
      pdfName,
      pdfSize,
      pdfPages,
      allowDownload: allowDownload !== false,
    });

    await lesson.save();

    // Update chapter and subject stats
    await Chapter.findByIdAndUpdate(chapterId, {
      $push: { lessons: lesson._id },
      $inc: { totalLessons: 1, ...(type === 'quiz' && { totalQuizzes: 1 }) },
    });

    await Subject.findByIdAndUpdate(chapter.subject, {
      $inc: { totalLessons: 1 },
    });

    logger.info(`Lesson created: ${lesson._id} for chapter ${chapterId}`);

    res.status(201).json({
      success: true,
      data: lesson,
      message: 'Lesson created successfully',
    });
  } catch (error: any) {
    logger.error('Create lesson error:', error);
    res.status(400).json({
      success: false,
      error: { message: error.message, code: 'CREATE_LESSON_ERROR' },
    });
  }
};

// Update lesson
export const updateLesson = async (req: Request, res: Response) => {
  try {
    const { lessonId } = req.params;
    const {
      title,
      titleHi,
      type,
      duration,
      isFree,
      isPublished,
      content,
      contentHi,
      pdfUrl,
      pdfName,
      pdfSize,
      pdfPages,
      allowDownload,
    } = req.body;

    const existingLesson = await Lesson.findById(lessonId);
    if (!existingLesson) {
      return res.status(404).json({
        success: false,
        error: { message: 'Lesson not found', code: 'LESSON_NOT_FOUND' },
      });
    }

    // If PDF changed, delete old one
    if (pdfUrl && existingLesson.pdfUrl && pdfUrl !== existingLesson.pdfUrl) {
      await deleteFromR2(existingLesson.pdfUrl);
    }

    const lesson = await Lesson.findByIdAndUpdate(
      lessonId,
      {
        ...(title !== undefined && { title }),
        ...(titleHi !== undefined && { titleHi }),
        ...(type !== undefined && { type }),
        ...(duration !== undefined && { duration }),
        ...(typeof isFree === 'boolean' && { isFree }),
        ...(typeof isPublished === 'boolean' && { isPublished }),
        ...(content !== undefined && { content }),
        ...(contentHi !== undefined && { contentHi }),
        ...(pdfUrl !== undefined && { pdfUrl }),
        ...(pdfName !== undefined && { pdfName }),
        ...(pdfSize !== undefined && { pdfSize }),
        ...(pdfPages !== undefined && { pdfPages }),
        ...(typeof allowDownload === 'boolean' && { allowDownload }),
      },
      { new: true }
    );

    logger.info(`Lesson updated: ${lessonId}`);

    res.json({
      success: true,
      data: lesson,
      message: 'Lesson updated successfully',
    });
  } catch (error: any) {
    logger.error('Update lesson error:', error);
    res.status(400).json({
      success: false,
      error: { message: error.message, code: 'UPDATE_LESSON_ERROR' },
    });
  }
};

// Delete lesson
export const deleteLesson = async (req: Request, res: Response) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { lessonId } = req.params;

    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        error: { message: 'Lesson not found', code: 'LESSON_NOT_FOUND' },
      });
    }

    // Delete PDF from R2
    if (lesson.pdfUrl) {
      await deleteFromR2(lesson.pdfUrl);
    }

    // Delete associated quiz
    if (lesson.quiz) {
      await Quiz.findByIdAndDelete(lesson.quiz, { session });
    }

    // Delete lesson
    await Lesson.findByIdAndDelete(lessonId, { session });

    // Update chapter
    await Chapter.findByIdAndUpdate(
      lesson.chapter,
      {
        $pull: { lessons: lessonId },
        $inc: { totalLessons: -1, ...(lesson.type === 'quiz' && { totalQuizzes: -1 }) },
      },
      { session }
    );

    // Update subject
    await Subject.findByIdAndUpdate(
      lesson.subject,
      { $inc: { totalLessons: -1 } },
      { session }
    );

    await session.commitTransaction();

    logger.info(`Lesson deleted: ${lessonId}`);

    res.json({
      success: true,
      message: 'Lesson deleted successfully',
    });
  } catch (error: any) {
    await session.abortTransaction();
    logger.error('Delete lesson error:', error);
    res.status(400).json({
      success: false,
      error: { message: error.message, code: 'DELETE_LESSON_ERROR' },
    });
  } finally {
    session.endSession();
  }
};

// Reorder lesson
export const reorderLesson = async (req: Request, res: Response) => {
  try {
    const { lessonId } = req.params;
    const { newOrder } = req.body;

    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      return res.status(404).json({
        success: false,
        error: { message: 'Lesson not found', code: 'LESSON_NOT_FOUND' },
      });
    }

    const oldOrder = lesson.order;

    if (newOrder > oldOrder) {
      await Lesson.updateMany(
        { chapter: lesson.chapter, order: { $gt: oldOrder, $lte: newOrder } },
        { $inc: { order: -1 } }
      );
    } else if (newOrder < oldOrder) {
      await Lesson.updateMany(
        { chapter: lesson.chapter, order: { $gte: newOrder, $lt: oldOrder } },
        { $inc: { order: 1 } }
      );
    }

    lesson.order = newOrder;
    await lesson.save();

    res.json({
      success: true,
      message: 'Lesson reordered successfully',
    });
  } catch (error: any) {
    logger.error('Reorder lesson error:', error);
    res.status(400).json({
      success: false,
      error: { message: error.message, code: 'REORDER_LESSON_ERROR' },
    });
  }
};

// ==================== FILE UPLOAD ====================

// Upload PDF
export const uploadPDFFile = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: { message: 'No file uploaded', code: 'NO_FILE' },
      });
    }

    const { url, key } = await uploadPDF(req.file);

    res.json({
      success: true,
      data: {
        url,
        key,
        name: req.file.originalname,
        size: req.file.size,
      },
      message: 'PDF uploaded successfully',
    });
  } catch (error: any) {
    logger.error('Upload PDF error:', error);
    res.status(400).json({
      success: false,
      error: { message: error.message, code: 'UPLOAD_PDF_ERROR' },
    });
  }
};

// Upload image (for notes editor)
export const uploadImage = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: { message: 'No file uploaded', code: 'NO_FILE' },
      });
    }

    const { url } = await uploadThumbnail(req.file);

    res.json({
      success: true,
      data: { url },
      message: 'Image uploaded successfully',
    });
  } catch (error: any) {
    logger.error('Upload image error:', error);
    res.status(400).json({
      success: false,
      error: { message: error.message, code: 'UPLOAD_IMAGE_ERROR' },
    });
  }
};

export default {
  getCoursesForBuilder,
  getCourseStructure,
  listSubjects,
  createSubject,
  updateSubject,
  deleteSubject,
  reorderSubject,
  listChapters,
  createChapter,
  updateChapter,
  deleteChapter,
  reorderChapter,
  listLessons,
  getLesson,
  createLesson,
  updateLesson,
  deleteLesson,
  reorderLesson,
  uploadPDFFile,
  uploadImage,
};
