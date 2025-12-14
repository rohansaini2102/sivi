import { Request, Response, NextFunction } from 'express';
import Enrollment from '../models/Enrollment';
import Quiz from '../models/Quiz';
import Lesson from '../models/Lesson';
import Chapter from '../models/Chapter';
import QuizAttempt from '../models/QuizAttempt';
import Exam from '../models/Exam';
import ExamAttempt from '../models/ExamAttempt';

/**
 * Middleware to check if user has an active enrollment for a course
 * Use this on routes that require course access
 */
export const requireCourseEnrollment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { message: 'Authentication required' },
      });
    }

    // courseId can come from params, body, or query
    const courseId = req.params.courseId || req.body.courseId || req.query.courseId;

    if (!courseId) {
      return res.status(400).json({
        success: false,
        error: { message: 'Course ID is required' },
      });
    }

    const enrollment = await Enrollment.findOne({
      user: req.user.userId,
      itemType: 'course',
      course: courseId,
      isActive: true,
      validUntil: { $gt: new Date() },
    });

    if (!enrollment) {
      return res.status(403).json({
        success: false,
        error: {
          message: 'You do not have access to this course. Please purchase to continue.',
          code: 'NOT_ENROLLED',
        },
      });
    }

    // Attach enrollment to request for use in controller
    (req as any).enrollment = enrollment;
    next();
  } catch (error) {
    console.error('Enrollment check error:', error);
    return res.status(500).json({
      success: false,
      error: { message: 'Error checking enrollment' },
    });
  }
};

/**
 * Middleware to check if user has an active enrollment for a test series
 * Use this on routes that require test series access
 */
export const requireTestSeriesEnrollment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { message: 'Authentication required' },
      });
    }

    // testSeriesId can come from params, body, or query
    const testSeriesId = req.params.testSeriesId || req.params.id || req.body.testSeriesId || req.query.testSeriesId;

    if (!testSeriesId) {
      return res.status(400).json({
        success: false,
        error: { message: 'Test Series ID is required' },
      });
    }

    const enrollment = await Enrollment.findOne({
      user: req.user.userId,
      itemType: 'test_series',
      testSeries: testSeriesId,
      isActive: true,
      validUntil: { $gt: new Date() },
    });

    if (!enrollment) {
      return res.status(403).json({
        success: false,
        error: {
          message: 'You do not have access to this test series. Please purchase to continue.',
          code: 'NOT_ENROLLED',
        },
      });
    }

    // Attach enrollment to request for use in controller
    (req as any).enrollment = enrollment;
    next();
  } catch (error) {
    console.error('Test series enrollment check error:', error);
    return res.status(500).json({
      success: false,
      error: { message: 'Error checking enrollment' },
    });
  }
};

/**
 * Helper function to check if user has enrollment for a course
 * Returns the enrollment if found, null otherwise
 */
export const checkCourseEnrollment = async (
  userId: string,
  courseId: string
): Promise<any | null> => {
  return Enrollment.findOne({
    user: userId,
    itemType: 'course',
    course: courseId,
    isActive: true,
    validUntil: { $gt: new Date() },
  });
};

/**
 * Helper function to check if user has enrollment for a test series
 * Returns the enrollment if found, null otherwise
 */
export const checkTestSeriesEnrollment = async (
  userId: string,
  testSeriesId: string
): Promise<any | null> => {
  return Enrollment.findOne({
    user: userId,
    itemType: 'test_series',
    testSeries: testSeriesId,
    isActive: true,
    validUntil: { $gt: new Date() },
  });
};

/**
 * Helper function to get courseId from a quizId
 * Quiz -> Lesson -> Chapter -> Course
 */
export const getCourseIdFromQuiz = async (quizId: string): Promise<string | null> => {
  const quiz = await Quiz.findById(quizId).select('lesson course');
  if (!quiz) return null;

  // If quiz has course directly, use it
  if (quiz.course) return quiz.course.toString();

  // Otherwise, traverse: Quiz -> Lesson -> Chapter -> Course
  if (quiz.lesson) {
    const lesson = await Lesson.findById(quiz.lesson).select('chapter course');
    if (lesson?.course) return lesson.course.toString();

    if (lesson?.chapter) {
      const chapter = await Chapter.findById(lesson.chapter).select('course');
      if (chapter?.course) return chapter.course.toString();
    }
  }

  return null;
};

/**
 * Helper function to check if a lesson/chapter is free (trial content)
 */
export const isContentFree = async (
  lessonId?: string,
  chapterId?: string
): Promise<boolean> => {
  if (lessonId) {
    const lesson = await Lesson.findById(lessonId).select('isFree chapter');
    if (lesson?.isFree) return true;

    if (lesson?.chapter) {
      const chapter = await Chapter.findById(lesson.chapter).select('isFree');
      return chapter?.isFree || false;
    }
  }

  if (chapterId) {
    const chapter = await Chapter.findById(chapterId).select('isFree');
    return chapter?.isFree || false;
  }

  return false;
};

/**
 * Middleware that checks quiz access:
 * 1. Gets courseId from quiz
 * 2. Checks if content is free (trial)
 * 3. If not free, checks enrollment
 */
export const requireQuizAccess = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { message: 'Authentication required' },
      });
    }

    const quizId = req.params.quizId;
    if (!quizId) {
      return res.status(400).json({
        success: false,
        error: { message: 'Quiz ID is required' },
      });
    }

    // Get the quiz and its lesson to check if it's free content
    const quiz = await Quiz.findById(quizId).select('lesson course');
    if (!quiz) {
      return res.status(404).json({
        success: false,
        error: { message: 'Quiz not found' },
      });
    }

    // Check if this is free/trial content
    if (quiz.lesson) {
      const isFree = await isContentFree(quiz.lesson.toString());
      if (isFree) {
        // Free content - allow access
        return next();
      }
    }

    // Not free content - check enrollment
    const courseId = await getCourseIdFromQuiz(quizId);
    if (!courseId) {
      return res.status(404).json({
        success: false,
        error: { message: 'Could not determine course for this quiz' },
      });
    }

    const enrollment = await checkCourseEnrollment(req.user.userId, courseId);
    if (!enrollment) {
      return res.status(403).json({
        success: false,
        error: {
          message: 'You do not have access to this quiz. Please purchase the course to continue.',
          code: 'NOT_ENROLLED',
        },
      });
    }

    // Attach enrollment and courseId to request
    (req as any).enrollment = enrollment;
    (req as any).courseId = courseId;
    next();
  } catch (error) {
    console.error('Quiz access check error:', error);
    return res.status(500).json({
      success: false,
      error: { message: 'Error checking quiz access' },
    });
  }
};

/**
 * Middleware that checks quiz attempt access:
 * 1. Verifies the attempt belongs to the authenticated user
 * 2. Gets courseId from the attempt
 * 3. Checks if content is free (trial)
 * 4. If not free, checks enrollment
 */
export const requireQuizAttemptAccess = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { message: 'Authentication required' },
      });
    }

    const attemptId = req.params.attemptId;
    if (!attemptId) {
      return res.status(400).json({
        success: false,
        error: { message: 'Attempt ID is required' },
      });
    }

    // Get the attempt and verify ownership
    const attempt = await QuizAttempt.findById(attemptId).select('user course lesson');
    if (!attempt) {
      return res.status(404).json({
        success: false,
        error: { message: 'Quiz attempt not found' },
      });
    }

    // Verify the attempt belongs to the authenticated user
    if (attempt.user.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        error: { message: 'You do not have access to this quiz attempt' },
      });
    }

    // Check if this is free/trial content
    if (attempt.lesson) {
      const isFree = await isContentFree(attempt.lesson.toString());
      if (isFree) {
        // Free content - allow access
        (req as any).attempt = attempt;
        return next();
      }
    }

    // Not free content - check enrollment
    const courseId = attempt.course?.toString();
    if (!courseId) {
      return res.status(404).json({
        success: false,
        error: { message: 'Could not determine course for this attempt' },
      });
    }

    const enrollment = await checkCourseEnrollment(req.user.userId, courseId);
    if (!enrollment) {
      return res.status(403).json({
        success: false,
        error: {
          message: 'You do not have access to this quiz. Please purchase the course to continue.',
          code: 'NOT_ENROLLED',
        },
      });
    }

    // Attach attempt and enrollment to request
    (req as any).attempt = attempt;
    (req as any).enrollment = enrollment;
    (req as any).courseId = courseId;
    next();
  } catch (error) {
    console.error('Quiz attempt access check error:', error);
    return res.status(500).json({
      success: false,
      error: { message: 'Error checking quiz attempt access' },
    });
  }
};

/**
 * Helper function to get testSeriesId from an examId
 */
export const getTestSeriesIdFromExam = async (examId: string): Promise<string | null> => {
  const exam = await Exam.findById(examId).select('testSeries isFree');
  if (!exam) return null;
  return exam.testSeries?.toString() || null;
};

/**
 * Helper function to check if an exam is free
 */
export const isExamFree = async (examId: string): Promise<boolean> => {
  const exam = await Exam.findById(examId).select('isFree');
  return exam?.isFree || false;
};

/**
 * Middleware that checks exam access:
 * 1. Gets testSeriesId from exam
 * 2. Checks if exam is free
 * 3. If not free, checks enrollment
 */
export const requireExamAccess = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { message: 'Authentication required' },
      });
    }

    const examId = req.params.examId;
    if (!examId) {
      return res.status(400).json({
        success: false,
        error: { message: 'Exam ID is required' },
      });
    }

    // Get the exam
    const exam = await Exam.findById(examId).select('testSeries isFree isPublished');
    if (!exam) {
      return res.status(404).json({
        success: false,
        error: { message: 'Exam not found' },
      });
    }

    // Check if exam is published
    if (!exam.isPublished) {
      return res.status(403).json({
        success: false,
        error: { message: 'This exam is not available yet' },
      });
    }

    // Check if this is free content
    if (exam.isFree) {
      (req as any).exam = exam;
      return next();
    }

    // Not free - check enrollment
    const testSeriesId = exam.testSeries?.toString();
    if (!testSeriesId) {
      return res.status(404).json({
        success: false,
        error: { message: 'Could not determine test series for this exam' },
      });
    }

    const enrollment = await checkTestSeriesEnrollment(req.user.userId, testSeriesId);
    if (!enrollment) {
      return res.status(403).json({
        success: false,
        error: {
          message: 'You do not have access to this exam. Please purchase the test series to continue.',
          code: 'NOT_ENROLLED',
        },
      });
    }

    // Attach exam, enrollment, and testSeriesId to request
    (req as any).exam = exam;
    (req as any).enrollment = enrollment;
    (req as any).testSeriesId = testSeriesId;
    next();
  } catch (error) {
    console.error('Exam access check error:', error);
    return res.status(500).json({
      success: false,
      error: { message: 'Error checking exam access' },
    });
  }
};

/**
 * Middleware that checks exam attempt access:
 * 1. Verifies the attempt belongs to the authenticated user
 * 2. Gets testSeriesId from the attempt
 * 3. Checks if exam is free
 * 4. If not free, checks enrollment
 */
export const requireExamAttemptAccess = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { message: 'Authentication required' },
      });
    }

    const attemptId = req.params.attemptId;
    if (!attemptId) {
      return res.status(400).json({
        success: false,
        error: { message: 'Attempt ID is required' },
      });
    }

    // Get the attempt and verify ownership
    const attempt = await ExamAttempt.findById(attemptId)
      .select('user exam testSeries status');
    if (!attempt) {
      return res.status(404).json({
        success: false,
        error: { message: 'Exam attempt not found' },
      });
    }

    // Verify the attempt belongs to the authenticated user
    if (attempt.user.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        error: { message: 'You do not have access to this exam attempt' },
      });
    }

    // Check if the exam is free
    const isFree = await isExamFree(attempt.exam.toString());
    if (isFree) {
      (req as any).attempt = attempt;
      return next();
    }

    // Not free - check enrollment
    const testSeriesId = attempt.testSeries?.toString();
    if (!testSeriesId) {
      return res.status(404).json({
        success: false,
        error: { message: 'Could not determine test series for this attempt' },
      });
    }

    const enrollment = await checkTestSeriesEnrollment(req.user.userId, testSeriesId);
    if (!enrollment) {
      return res.status(403).json({
        success: false,
        error: {
          message: 'You do not have access to this exam. Please purchase the test series to continue.',
          code: 'NOT_ENROLLED',
        },
      });
    }

    // Attach attempt and enrollment to request
    (req as any).attempt = attempt;
    (req as any).enrollment = enrollment;
    (req as any).testSeriesId = testSeriesId;
    next();
  } catch (error) {
    console.error('Exam attempt access check error:', error);
    return res.status(500).json({
      success: false,
      error: { message: 'Error checking exam attempt access' },
    });
  }
};
