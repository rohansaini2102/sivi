import { Request, Response } from 'express';
import mongoose, { Types } from 'mongoose';
import TestSeries from '../models/TestSeries';
import Exam from '../models/Exam';
import ExamAttempt from '../models/ExamAttempt';
import Question from '../models/Question';
import ComprehensionPassage from '../models/ComprehensionPassage';
import Enrollment from '../models/Enrollment';
import logger from '../utils/logger';
import {
  startExamAttemptSchema,
  saveAnswerSchema,
  markForReviewSchema,
  navigateSchema,
  heartbeatSchema,
} from '../validators/testSeriesBuilder.validator';

// ==================== HELPER FUNCTIONS ====================

// Shuffle array (Fisher-Yates algorithm)
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Calculate score for a single answer
function calculateAnswerScore(
  selectedOptions: string[],
  correctAnswers: string[],
  questionType: string,
  positiveMarks: number,
  negativeMarks: number,
  algorithm: 'partial' | 'all_or_none' | 'proportional'
): { marks: number; isCorrect: boolean; isPartiallyCorrect: boolean } {
  // No answer selected
  if (selectedOptions.length === 0) {
    return { marks: 0, isCorrect: false, isPartiallyCorrect: false };
  }

  // Single choice question
  if (questionType === 'single' || questionType === 'comprehension') {
    const isCorrect = selectedOptions[0] === correctAnswers[0];
    return {
      marks: isCorrect ? positiveMarks : -negativeMarks,
      isCorrect,
      isPartiallyCorrect: false,
    };
  }

  // Multiple correct question
  const correctSelected = selectedOptions.filter(o => correctAnswers.includes(o));
  const incorrectSelected = selectedOptions.filter(o => !correctAnswers.includes(o));

  switch (algorithm) {
    case 'all_or_none': {
      const isExactMatch =
        correctSelected.length === correctAnswers.length &&
        incorrectSelected.length === 0;
      return {
        marks: isExactMatch ? positiveMarks : (selectedOptions.length > 0 ? -negativeMarks : 0),
        isCorrect: isExactMatch,
        isPartiallyCorrect: false,
      };
    }

    case 'partial': {
      if (incorrectSelected.length > 0) {
        return { marks: -negativeMarks, isCorrect: false, isPartiallyCorrect: false };
      }
      const partialMarks = (correctSelected.length / correctAnswers.length) * positiveMarks;
      return {
        marks: partialMarks,
        isCorrect: correctSelected.length === correctAnswers.length,
        isPartiallyCorrect: correctSelected.length > 0 && correctSelected.length < correctAnswers.length,
      };
    }

    case 'proportional': {
      const marks =
        (correctSelected.length * (positiveMarks / correctAnswers.length)) -
        (incorrectSelected.length * negativeMarks);
      return {
        marks: Math.max(0, marks),
        isCorrect: marks >= positiveMarks,
        isPartiallyCorrect: marks > 0 && marks < positiveMarks,
      };
    }

    default:
      return { marks: 0, isCorrect: false, isPartiallyCorrect: false };
  }
}

// Calculate grade from percentage
function calculateGrade(percentage: number): 'S' | 'A' | 'B' | 'C' | 'F' {
  if (percentage >= 90) return 'S';
  if (percentage >= 75) return 'A';
  if (percentage >= 60) return 'B';
  if (percentage >= 40) return 'C';
  return 'F';
}

// ==================== ENROLLED TEST SERIES ====================

// Get user's enrolled test series
export const getEnrolledTestSeries = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;

    const enrollments = await Enrollment.find({
      user: userId,
      itemType: 'test_series',
      isActive: true,
      validUntil: { $gt: new Date() },
    })
      .populate({
        path: 'testSeries',
        select: 'title slug thumbnail examCategory totalExams language',
      })
      .lean();

    // Get attempt counts for each test series
    const testSeriesWithProgress = await Promise.all(
      enrollments
        .filter(e => e.testSeries)
        .map(async (enrollment) => {
          const testSeries = enrollment.testSeries as any;
          const attemptedExams = await ExamAttempt.countDocuments({
            user: userId,
            testSeries: testSeries._id,
            status: { $in: ['completed', 'auto_submitted'] },
          });

          return {
            ...testSeries,
            enrolledAt: enrollment.createdAt,
            validUntil: enrollment.validUntil,
            progress: {
              attemptedExams,
              totalExams: testSeries.totalExams || 0,
              percentage: testSeries.totalExams ? Math.round((attemptedExams / testSeries.totalExams) * 100) : 0,
            },
          };
        })
    );

    res.json({
      success: true,
      data: { testSeries: testSeriesWithProgress },
    });
  } catch (error: any) {
    logger.error('Get enrolled test series error:', error);
    res.status(400).json({
      success: false,
      error: { message: error.message, code: 'GET_ENROLLED_ERROR' },
    });
  }
};

// Get test series with exams (checks enrollment for non-free content)
export const getTestSeriesWithExams = async (req: Request, res: Response) => {
  try {
    const { testSeriesId } = req.params;
    const userId = req.user!.userId;

    const testSeries = await TestSeries.findById(testSeriesId)
      .select('title slug thumbnail description examCategory totalExams language features price discountPrice isFree')
      .lean();

    if (!testSeries) {
      return res.status(404).json({
        success: false,
        error: { message: 'Test series not found', code: 'NOT_FOUND' },
      });
    }

    // Check enrollment
    const enrollment = await Enrollment.findOne({
      user: userId,
      itemType: 'test_series',
      testSeries: testSeriesId,
      isActive: true,
      validUntil: { $gt: new Date() },
    });

    const isEnrolled = !!enrollment;

    // Get exams
    const exams = await Exam.find({
      testSeries: testSeriesId,
      isPublished: true,
    })
      .sort({ order: 1 })
      .select('title titleHi order duration totalQuestions totalMarks passingPercentage isFree attemptCount avgScore')
      .lean();

    // Get user's attempts for each exam
    const examIds = exams.map(e => e._id);
    const attempts = await ExamAttempt.find({
      user: userId,
      exam: { $in: examIds },
    })
      .select('exam status score percentage completedAt')
      .lean();

    const attemptMap = new Map();
    attempts.forEach(a => {
      const existing = attemptMap.get(a.exam.toString());
      if (!existing || (a.status === 'completed' && a.score > (existing.score || 0))) {
        attemptMap.set(a.exam.toString(), a);
      }
    });

    const examsWithAttempts = exams.map(exam => ({
      ...exam,
      isLocked: !isEnrolled && !exam.isFree,
      attempt: attemptMap.get(exam._id.toString()) || null,
    }));

    res.json({
      success: true,
      data: {
        testSeries,
        isEnrolled,
        exams: examsWithAttempts,
      },
    });
  } catch (error: any) {
    logger.error('Get test series with exams error:', error);
    res.status(400).json({
      success: false,
      error: { message: error.message, code: 'GET_TEST_SERIES_ERROR' },
    });
  }
};

// Get user's progress in test series
export const getTestSeriesProgress = async (req: Request, res: Response) => {
  try {
    const { testSeriesId } = req.params;
    const userId = req.user!.userId;

    // Get all completed attempts
    const attempts = await ExamAttempt.find({
      user: userId,
      testSeries: testSeriesId,
      status: { $in: ['completed', 'auto_submitted'] },
    })
      .populate('exam', 'title')
      .sort({ completedAt: -1 })
      .lean();

    // Calculate stats
    const totalAttempts = attempts.length;
    const avgScore = totalAttempts > 0
      ? attempts.reduce((sum, a) => sum + (a.percentage || 0), 0) / totalAttempts
      : 0;
    const highestScore = totalAttempts > 0
      ? Math.max(...attempts.map(a => a.percentage || 0))
      : 0;

    res.json({
      success: true,
      data: {
        totalAttempts,
        avgScore: Math.round(avgScore * 100) / 100,
        highestScore,
        attempts: attempts,
      },
    });
  } catch (error: any) {
    logger.error('Get test series progress error:', error);
    res.status(400).json({
      success: false,
      error: { message: error.message, code: 'GET_PROGRESS_ERROR' },
    });
  }
};

// ==================== EXAM OPERATIONS ====================

// Get exam info (pre-start)
export const getExamInfo = async (req: Request, res: Response) => {
  try {
    const { examId } = req.params;

    const exam = await Exam.findById(examId)
      .select('title titleHi description descriptionHi duration totalQuestions totalMarks defaultPositiveMarks defaultNegativeMarks passingPercentage sections shuffleQuestions shuffleOptions multipleCorrectAlgorithm')
      .lean();

    if (!exam) {
      return res.status(404).json({
        success: false,
        error: { message: 'Exam not found', code: 'EXAM_NOT_FOUND' },
      });
    }

    // Get section info without questions
    const sections = exam.sections?.map(s => ({
      _id: s._id,
      title: s.title,
      titleHi: s.titleHi,
      questionCount: s.questions?.length || 0,
      instructions: s.instructions,
      instructionsHi: s.instructionsHi,
    })) || [];

    res.json({
      success: true,
      data: {
        exam: {
          ...exam,
          sections,
        },
      },
    });
  } catch (error: any) {
    logger.error('Get exam info error:', error);
    res.status(400).json({
      success: false,
      error: { message: error.message, code: 'GET_EXAM_INFO_ERROR' },
    });
  }
};

// Start or resume exam
export const startExam = async (req: Request, res: Response) => {
  try {
    const { examId } = req.params;
    const userId = req.user!.userId;
    const { language } = startExamAttemptSchema.parse(req.body);

    // Check for existing in-progress attempt
    let attempt = await ExamAttempt.findOne({
      user: userId,
      exam: examId,
      status: 'in_progress',
    });

    if (attempt) {
      // Resume existing attempt
      const remainingTime = Math.max(0, attempt.timeLimit - Math.floor((Date.now() - attempt.startedAt.getTime()) / 1000));

      // Check if time expired
      if (remainingTime <= 0) {
        // Auto-submit the expired attempt
        attempt.status = 'auto_submitted';
        attempt.completedAt = new Date();
        await attempt.save();

        // Create new attempt
        attempt = null;
      } else {
        // Update lastActiveAt
        attempt.lastActiveAt = new Date();
        await attempt.save();

        // Load exam with full details for resume
        const resumeExam = await Exam.findById(examId)
          .populate({
            path: 'sections.questions',
            select: 'question questionHindi questionType imageUrl options optionsHindi comprehensionPassage',
            populate: {
              path: 'comprehensionPassage',
              select: 'title titleHi passage passageHi imageUrl',
            },
          })
          .lean();

        if (!resumeExam) {
          return res.status(404).json({
            success: false,
            error: { message: 'Exam not found', code: 'EXAM_NOT_FOUND' },
          });
        }

        // Prepare sections for response
        const resumeSections = resumeExam.sections.map((section) => ({
          _id: section._id,
          title: section.title,
          titleHi: section.titleHi,
          order: section.order,
          instructions: section.instructions,
          instructionsHi: section.instructionsHi,
          questions: (section.questions as any[]).map((q) => ({
            _id: q._id,
            question: q.question,
            questionHindi: q.questionHindi,
            questionType: q.questionType || 'single',
            imageUrl: q.imageUrl,
            options: q.options,
            comprehensionPassage: q.comprehensionPassage,
          })),
        }));

        return res.json({
          success: true,
          data: {
            attemptId: attempt._id,
            isResume: true,
            exam: {
              _id: resumeExam._id,
              title: resumeExam.title,
              titleHi: resumeExam.titleHi,
              duration: resumeExam.duration,
              totalQuestions: attempt.totalQuestions,
              totalMarks: resumeExam.totalMarks,
              defaultPositiveMarks: resumeExam.defaultPositiveMarks,
              defaultNegativeMarks: resumeExam.defaultNegativeMarks,
              allowSectionNavigation: resumeExam.allowSectionNavigation ?? true,
              shuffleQuestions: resumeExam.shuffleQuestions,
              shuffleOptions: resumeExam.shuffleOptions,
            },
            sections: resumeSections,
            answers: attempt.answers,
            currentSectionIndex: attempt.currentSectionIndex,
            currentQuestionIndex: attempt.currentQuestionIndex,
            timeRemaining: remainingTime,
            language: attempt.language,
          },
        });
      }
    }

    // Get exam with full details
    const exam = await Exam.findById(examId)
      .populate({
        path: 'sections.questions',
        select: 'question questionHindi questionType imageUrl options optionsHindi correctAnswers explanation explanationHindi comprehensionPassage',
        populate: {
          path: 'comprehensionPassage',
          select: 'title titleHi passage passageHi imageUrl',
        },
      })
      .lean();

    if (!exam) {
      return res.status(404).json({
        success: false,
        error: { message: 'Exam not found', code: 'EXAM_NOT_FOUND' },
      });
    }

    // Prepare questions with shuffling if enabled
    let questionOrder: string[] = [];
    const optionOrders = new Map<string, string[]>();

    const allQuestions: any[] = [];
    exam.sections.forEach((section) => {
      let sectionQuestions = section.questions as any[];

      if (exam.shuffleQuestions) {
        sectionQuestions = shuffleArray(sectionQuestions);
      }

      sectionQuestions.forEach((q) => {
        allQuestions.push({ ...q, sectionId: section._id });
        questionOrder.push(q._id.toString());

        if (exam.shuffleOptions && q.options) {
          const shuffledIds = shuffleArray<string>(q.options.map((o: any) => o.id as string));
          optionOrders.set(q._id.toString(), shuffledIds);
        }
      });
    });

    // Initialize answers array
    const answers = allQuestions.map((q) => ({
      questionId: q._id,
      sectionId: q.sectionId,
      selectedOptions: [],
      isCorrect: false,
      isPartiallyCorrect: false,
      marksObtained: 0,
      timeTaken: 0,
      markedForReview: false,
    }));

    // Create new attempt
    const newAttempt = new ExamAttempt({
      user: userId,
      exam: examId,
      testSeries: exam.testSeries,
      status: 'in_progress',
      answers,
      currentSectionIndex: 0,
      currentQuestionIndex: 0,
      totalQuestions: allQuestions.length,
      maxScore: exam.totalMarks,
      timeLimit: exam.duration * 60, // Convert to seconds
      language,
      questionOrder: exam.shuffleQuestions ? questionOrder : undefined,
      optionOrders: exam.shuffleOptions ? optionOrders : undefined,
    });

    await newAttempt.save();

    // Prepare sections for response (remove correctAnswers)
    const sectionsForResponse = exam.sections.map((section) => ({
      _id: section._id,
      title: section.title,
      titleHi: section.titleHi,
      order: section.order,
      instructions: section.instructions,
      instructionsHi: section.instructionsHi,
      questions: (section.questions as any[]).map((q) => ({
        _id: q._id,
        question: q.question,
        questionHindi: q.questionHindi,
        questionType: q.questionType || 'single',
        imageUrl: q.imageUrl,
        options: q.options,
        comprehensionPassage: q.comprehensionPassage,
      })),
    }));

    res.status(201).json({
      success: true,
      data: {
        attemptId: newAttempt._id,
        isResume: false,
        exam: {
          _id: exam._id,
          title: exam.title,
          titleHi: exam.titleHi,
          duration: exam.duration,
          totalQuestions: allQuestions.length,
          totalMarks: exam.totalMarks,
          defaultPositiveMarks: exam.defaultPositiveMarks,
          defaultNegativeMarks: exam.defaultNegativeMarks,
          allowSectionNavigation: exam.allowSectionNavigation ?? true,
          shuffleQuestions: exam.shuffleQuestions,
          shuffleOptions: exam.shuffleOptions,
        },
        sections: sectionsForResponse,
        answers: [],
        currentSectionIndex: 0,
        currentQuestionIndex: 0,
        timeRemaining: exam.duration * 60,
        language,
      },
    });
  } catch (error: any) {
    logger.error('Start exam error:', error);
    res.status(400).json({
      success: false,
      error: { message: error.message, code: 'START_EXAM_ERROR' },
    });
  }
};

// Get exam leaderboard
export const getExamLeaderboard = async (req: Request, res: Response) => {
  try {
    const { examId } = req.params;
    const { limit = 50 } = req.query;

    const leaderboard = await ExamAttempt.find({
      exam: examId,
      status: { $in: ['completed', 'auto_submitted'] },
    })
      .sort({ score: -1, totalTimeTaken: 1 })
      .limit(Number(limit))
      .populate('user', 'name avatar')
      .select('user score percentage totalTimeTaken completedAt')
      .lean();

    // Add rank
    const rankedLeaderboard = leaderboard.map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }));

    res.json({
      success: true,
      data: { leaderboard: rankedLeaderboard },
    });
  } catch (error: any) {
    logger.error('Get exam leaderboard error:', error);
    res.status(400).json({
      success: false,
      error: { message: error.message, code: 'GET_LEADERBOARD_ERROR' },
    });
  }
};

// ==================== ATTEMPT OPERATIONS ====================

// Get attempt state (for CBT interface)
export const getAttemptState = async (req: Request, res: Response) => {
  try {
    const { attemptId } = req.params;

    const attempt = await ExamAttempt.findById(attemptId)
      .populate({
        path: 'exam',
        select: 'title titleHi sections duration defaultPositiveMarks defaultNegativeMarks',
        populate: {
          path: 'sections.questions',
          select: 'question questionHindi questionType imageUrl options optionsHindi comprehensionPassage',
          populate: {
            path: 'comprehensionPassage',
            select: 'title titleHi passage passageHi imageUrl',
          },
        },
      })
      .lean();

    if (!attempt) {
      return res.status(404).json({
        success: false,
        error: { message: 'Attempt not found', code: 'ATTEMPT_NOT_FOUND' },
      });
    }

    // Calculate remaining time
    const remainingTime = Math.max(0, attempt.timeLimit - Math.floor((Date.now() - new Date(attempt.startedAt).getTime()) / 1000));

    // If time expired and still in progress, mark as auto_submitted
    if (remainingTime <= 0 && attempt.status === 'in_progress') {
      await ExamAttempt.findByIdAndUpdate(attemptId, {
        status: 'auto_submitted',
        completedAt: new Date(),
      });

      return res.status(400).json({
        success: false,
        error: { message: 'Exam time has expired', code: 'TIME_EXPIRED' },
      });
    }

    // Transform questions (remove correctAnswers for in-progress attempts)
    const exam = attempt.exam as any;
    const sections = exam.sections.map((section: any) => ({
      _id: section._id,
      title: section.title,
      titleHi: section.titleHi,
      questions: section.questions.map((q: any) => ({
        _id: q._id,
        question: attempt.language === 'hi' && q.questionHindi ? q.questionHindi : q.question,
        questionType: q.questionType,
        imageUrl: q.imageUrl,
        options: q.options.map((o: any) => ({
          id: o.id,
          text: attempt.language === 'hi' && o.textHi ? o.textHi : o.text,
        })),
        comprehensionPassage: q.comprehensionPassage ? {
          title: attempt.language === 'hi' && q.comprehensionPassage.titleHi ? q.comprehensionPassage.titleHi : q.comprehensionPassage.title,
          passage: attempt.language === 'hi' && q.comprehensionPassage.passageHi ? q.comprehensionPassage.passageHi : q.comprehensionPassage.passage,
          imageUrl: q.comprehensionPassage.imageUrl,
        } : null,
      })),
    }));

    // Build answer state map
    const answerState = attempt.answers.reduce((acc: any, ans: any) => {
      acc[ans.questionId.toString()] = {
        selectedOptions: ans.selectedOptions,
        markedForReview: ans.markedForReview,
        visited: !!ans.visitedAt,
      };
      return acc;
    }, {});

    res.json({
      success: true,
      data: {
        attemptId: attempt._id,
        status: attempt.status,
        examTitle: exam.title,
        examTitleHi: exam.titleHi,
        sections,
        answerState,
        currentSectionIndex: attempt.currentSectionIndex,
        currentQuestionIndex: attempt.currentQuestionIndex,
        remainingTime,
        language: attempt.language,
      },
    });
  } catch (error: any) {
    logger.error('Get attempt state error:', error);
    res.status(400).json({
      success: false,
      error: { message: error.message, code: 'GET_ATTEMPT_STATE_ERROR' },
    });
  }
};

// Save answer
export const saveAnswer = async (req: Request, res: Response) => {
  try {
    const { attemptId } = req.params;
    const { questionId, selectedOptions, timeTaken } = saveAnswerSchema.parse(req.body);

    const attempt = await ExamAttempt.findById(attemptId);
    if (!attempt) {
      return res.status(404).json({
        success: false,
        error: { message: 'Attempt not found', code: 'ATTEMPT_NOT_FOUND' },
      });
    }

    if (attempt.status !== 'in_progress') {
      return res.status(400).json({
        success: false,
        error: { message: 'Cannot modify a completed attempt', code: 'ATTEMPT_COMPLETED' },
      });
    }

    // Find and update the answer
    const answerIndex = attempt.answers.findIndex(
      a => a.questionId.toString() === questionId
    );

    if (answerIndex === -1) {
      return res.status(404).json({
        success: false,
        error: { message: 'Question not found in attempt', code: 'QUESTION_NOT_FOUND' },
      });
    }

    attempt.answers[answerIndex].selectedOptions = selectedOptions;
    attempt.answers[answerIndex].answeredAt = new Date();
    if (timeTaken !== undefined) {
      attempt.answers[answerIndex].timeTaken = timeTaken;
    }
    if (!attempt.answers[answerIndex].visitedAt) {
      attempt.answers[answerIndex].visitedAt = new Date();
    }

    attempt.lastActiveAt = new Date();
    await attempt.save();

    res.json({
      success: true,
      data: { message: 'Answer saved' },
    });
  } catch (error: any) {
    logger.error('Save answer error:', error);
    res.status(400).json({
      success: false,
      error: { message: error.message, code: 'SAVE_ANSWER_ERROR' },
    });
  }
};

// Toggle mark for review
export const toggleMarkForReview = async (req: Request, res: Response) => {
  try {
    const { attemptId } = req.params;
    const { questionId, markedForReview } = markForReviewSchema.parse(req.body);

    const attempt = await ExamAttempt.findById(attemptId);
    if (!attempt || attempt.status !== 'in_progress') {
      return res.status(400).json({
        success: false,
        error: { message: 'Invalid attempt', code: 'INVALID_ATTEMPT' },
      });
    }

    const answerIndex = attempt.answers.findIndex(
      a => a.questionId.toString() === questionId
    );

    if (answerIndex === -1) {
      return res.status(404).json({
        success: false,
        error: { message: 'Question not found', code: 'QUESTION_NOT_FOUND' },
      });
    }

    attempt.answers[answerIndex].markedForReview = markedForReview;
    attempt.lastActiveAt = new Date();
    await attempt.save();

    res.json({
      success: true,
      data: { markedForReview },
    });
  } catch (error: any) {
    logger.error('Toggle mark for review error:', error);
    res.status(400).json({
      success: false,
      error: { message: error.message, code: 'TOGGLE_REVIEW_ERROR' },
    });
  }
};

// Navigate to question
export const navigateToQuestion = async (req: Request, res: Response) => {
  try {
    const { attemptId } = req.params;
    const { sectionIndex, questionIndex } = navigateSchema.parse(req.body);

    const result = await ExamAttempt.findByIdAndUpdate(
      attemptId,
      {
        $set: {
          currentSectionIndex: sectionIndex,
          currentQuestionIndex: questionIndex,
          lastActiveAt: new Date(),
        },
      },
      { new: true }
    );

    if (!result) {
      return res.status(404).json({
        success: false,
        error: { message: 'Attempt not found', code: 'ATTEMPT_NOT_FOUND' },
      });
    }

    res.json({
      success: true,
      data: { sectionIndex, questionIndex },
    });
  } catch (error: any) {
    logger.error('Navigate error:', error);
    res.status(400).json({
      success: false,
      error: { message: error.message, code: 'NAVIGATE_ERROR' },
    });
  }
};

// Heartbeat (keep-alive and timer sync)
export const heartbeat = async (req: Request, res: Response) => {
  try {
    const { attemptId } = req.params;
    const data = heartbeatSchema.parse(req.body);

    const attempt = await ExamAttempt.findById(attemptId);
    if (!attempt) {
      return res.status(404).json({
        success: false,
        error: { message: 'Attempt not found', code: 'ATTEMPT_NOT_FOUND' },
      });
    }

    // Calculate server-side remaining time
    const serverRemainingTime = Math.max(
      0,
      attempt.timeLimit - Math.floor((Date.now() - attempt.startedAt.getTime()) / 1000)
    );

    // Check if time expired
    if (serverRemainingTime <= 0 && attempt.status === 'in_progress') {
      // Auto-submit
      attempt.status = 'auto_submitted';
      attempt.completedAt = new Date();
      await attempt.save();

      return res.json({
        success: true,
        data: {
          shouldSubmit: true,
          serverTime: serverRemainingTime,
        },
      });
    }

    // Update lastActiveAt and navigation state
    attempt.lastActiveAt = new Date();
    if (data.currentSectionIndex !== undefined) {
      attempt.currentSectionIndex = data.currentSectionIndex;
    }
    if (data.currentQuestionIndex !== undefined) {
      attempt.currentQuestionIndex = data.currentQuestionIndex;
    }
    await attempt.save();

    res.json({
      success: true,
      data: {
        shouldSubmit: false,
        serverTime: serverRemainingTime,
      },
    });
  } catch (error: any) {
    logger.error('Heartbeat error:', error);
    res.status(400).json({
      success: false,
      error: { message: error.message, code: 'HEARTBEAT_ERROR' },
    });
  }
};

// Submit exam
export const submitExam = async (req: Request, res: Response) => {
  try {
    const { attemptId } = req.params;
    const { autoSubmitted } = req.body;

    const attempt = await ExamAttempt.findById(attemptId);
    if (!attempt) {
      return res.status(404).json({
        success: false,
        error: { message: 'Attempt not found', code: 'ATTEMPT_NOT_FOUND' },
      });
    }

    if (attempt.status !== 'in_progress') {
      return res.status(400).json({
        success: false,
        error: { message: 'Attempt already submitted', code: 'ALREADY_SUBMITTED' },
      });
    }

    // Get exam with questions for scoring
    const exam = await Exam.findById(attempt.exam)
      .populate({
        path: 'sections.questions',
        select: 'questionType correctAnswers',
      })
      .lean();

    if (!exam) {
      return res.status(404).json({
        success: false,
        error: { message: 'Exam not found', code: 'EXAM_NOT_FOUND' },
      });
    }

    // Build question map for scoring
    const questionMap = new Map<string, any>();
    exam.sections.forEach((section) => {
      (section.questions as any[]).forEach((q) => {
        questionMap.set(q._id.toString(), {
          ...q,
          sectionId: section._id,
        });
      });
    });

    // Score each answer
    let totalScore = 0;
    let correct = 0;
    let wrong = 0;
    let partiallyCorrect = 0;
    let attempted = 0;
    let skipped = 0;

    const sectionScores = new Map<string, any>();
    exam.sections.forEach((section) => {
      sectionScores.set(section._id.toString(), {
        sectionId: section._id,
        sectionTitle: section.title,
        attempted: 0,
        correct: 0,
        wrong: 0,
        partiallyCorrect: 0,
        skipped: 0,
        marksObtained: 0,
        maxMarks: (section.questions as any[]).length * exam.defaultPositiveMarks,
        percentage: 0,
      });
    });

    attempt.answers.forEach((answer) => {
      const question = questionMap.get(answer.questionId.toString());
      if (!question) return;

      const sectionScore = sectionScores.get(question.sectionId.toString());

      if (answer.selectedOptions.length === 0) {
        answer.isCorrect = false;
        answer.isPartiallyCorrect = false;
        answer.marksObtained = 0;
        skipped++;
        if (sectionScore) sectionScore.skipped++;
      } else {
        attempted++;
        if (sectionScore) sectionScore.attempted++;

        const result = calculateAnswerScore(
          answer.selectedOptions,
          question.correctAnswers || [question.correctAnswer],
          question.questionType || 'single',
          exam.defaultPositiveMarks,
          exam.defaultNegativeMarks,
          exam.multipleCorrectAlgorithm
        );

        answer.isCorrect = result.isCorrect;
        answer.isPartiallyCorrect = result.isPartiallyCorrect;
        answer.marksObtained = result.marks;
        totalScore += result.marks;

        if (result.isCorrect) {
          correct++;
          if (sectionScore) sectionScore.correct++;
        } else if (result.isPartiallyCorrect) {
          partiallyCorrect++;
          if (sectionScore) sectionScore.partiallyCorrect++;
        } else {
          wrong++;
          if (sectionScore) sectionScore.wrong++;
        }

        if (sectionScore) sectionScore.marksObtained += result.marks;
      }
    });

    // Calculate section percentages
    const sectionProgress = Array.from(sectionScores.values()).map((s) => ({
      ...s,
      percentage: s.maxMarks > 0 ? Math.max(0, Math.round((s.marksObtained / s.maxMarks) * 100)) : 0,
    }));

    // Calculate overall stats
    const maxScore = exam.totalMarks;
    const percentage = maxScore > 0 ? Math.max(0, Math.round((totalScore / maxScore) * 100)) : 0;
    const grade = calculateGrade(percentage);
    const passed = percentage >= exam.passingPercentage;

    // Calculate time taken
    const totalTimeTaken = Math.floor((Date.now() - attempt.startedAt.getTime()) / 1000);

    // Update attempt
    attempt.status = autoSubmitted ? 'auto_submitted' : 'completed';
    attempt.completedAt = new Date();
    attempt.totalTimeTaken = totalTimeTaken;
    attempt.attempted = attempted;
    attempt.correct = correct;
    attempt.wrong = wrong;
    attempt.partiallyCorrect = partiallyCorrect;
    attempt.skipped = skipped;
    attempt.score = totalScore; // Can be negative due to negative marking
    attempt.maxScore = maxScore;
    attempt.percentage = percentage;
    attempt.grade = grade;
    attempt.passed = passed;
    attempt.sectionProgress = sectionProgress;

    await attempt.save();

    // Update exam analytics
    await Exam.findByIdAndUpdate(exam._id, {
      $inc: { attemptCount: 1 },
    });

    // Calculate rank
    const rank = await ExamAttempt.countDocuments({
      exam: exam._id,
      status: { $in: ['completed', 'auto_submitted'] },
      score: { $gt: totalScore },
    }) + 1;

    const totalAttempts = await ExamAttempt.countDocuments({
      exam: exam._id,
      status: { $in: ['completed', 'auto_submitted'] },
    });

    const percentile = totalAttempts > 0
      ? Math.round(((totalAttempts - rank) / totalAttempts) * 100)
      : 0;

    // Update rank and percentile
    attempt.rank = rank;
    attempt.percentile = percentile;
    await attempt.save();

    res.json({
      success: true,
      data: {
        attemptId: attempt._id,
        score: attempt.score,
        maxScore: attempt.maxScore,
        percentage: attempt.percentage,
        grade: attempt.grade,
        passed: attempt.passed,
        rank,
        percentile,
      },
    });
  } catch (error: any) {
    logger.error('Submit exam error:', error);
    res.status(400).json({
      success: false,
      error: { message: error.message, code: 'SUBMIT_EXAM_ERROR' },
    });
  }
};

// Get exam result
export const getExamResult = async (req: Request, res: Response) => {
  try {
    const { attemptId } = req.params;

    const attempt = await ExamAttempt.findById(attemptId)
      .populate({
        path: 'exam',
        select: 'title titleHi duration totalQuestions totalMarks passingPercentage sections',
        populate: {
          path: 'sections.questions',
          select: 'question questionHindi questionType options correctAnswers explanation explanationHindi',
        },
      })
      .populate('user', 'name')
      .lean();

    if (!attempt) {
      return res.status(404).json({
        success: false,
        error: { message: 'Attempt not found', code: 'ATTEMPT_NOT_FOUND' },
      });
    }

    if (attempt.status === 'in_progress') {
      return res.status(400).json({
        success: false,
        error: { message: 'Exam not yet submitted', code: 'NOT_SUBMITTED' },
      });
    }

    // Count user's total attempts for this exam
    const attemptCount = await ExamAttempt.countDocuments({
      exam: (attempt.exam as any)._id,
      user: attempt.user,
      status: { $in: ['completed', 'auto_submitted'] },
    });

    // Transform for response
    const exam = attempt.exam as any;

    // Build answer review with correct answers
    const questionReview = attempt.answers.map((answer: any) => {
      // Find the question in sections
      let question: any = null;
      for (const section of exam.sections) {
        question = (section.questions as any[]).find(
          q => q._id.toString() === answer.questionId.toString()
        );
        if (question) break;
      }

      return {
        questionId: answer.questionId,
        question: attempt.language === 'hi' && question?.questionHindi ? question.questionHindi : question?.question,
        questionType: question?.questionType,
        options: question?.options,
        selectedOptions: answer.selectedOptions,
        correctAnswers: question?.correctAnswers,
        isCorrect: answer.isCorrect,
        isPartiallyCorrect: answer.isPartiallyCorrect,
        marksObtained: answer.marksObtained,
        timeTaken: answer.timeTaken,
        explanation: attempt.language === 'hi' && question?.explanationHindi ? question.explanationHindi : question?.explanation,
      };
    });

    res.json({
      success: true,
      data: {
        attempt: {
          _id: attempt._id,
          status: attempt.status,
          score: attempt.score,
          maxScore: attempt.maxScore,
          percentage: attempt.percentage,
          grade: attempt.grade,
          passed: attempt.passed,
          rank: attempt.rank,
          percentile: attempt.percentile,
          attempted: attempt.attempted,
          correct: attempt.correct,
          wrong: attempt.wrong,
          partiallyCorrect: attempt.partiallyCorrect,
          skipped: attempt.skipped,
          totalTimeTaken: attempt.totalTimeTaken,
          startedAt: attempt.startedAt,
          completedAt: attempt.completedAt,
          attemptCount,
        },
        exam: {
          title: exam.title,
          titleHi: exam.titleHi,
          totalQuestions: exam.totalQuestions,
          totalMarks: exam.totalMarks,
          passingPercentage: exam.passingPercentage,
        },
        sectionProgress: attempt.sectionProgress,
        questionReview,
      },
    });
  } catch (error: any) {
    logger.error('Get exam result error:', error);
    res.status(400).json({
      success: false,
      error: { message: error.message, code: 'GET_RESULT_ERROR' },
    });
  }
};
