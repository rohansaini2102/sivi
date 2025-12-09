import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Enrollment from '../models/Enrollment';
import Course from '../models/Course';
import Subject from '../models/Subject';
import Chapter from '../models/Chapter';
import Lesson from '../models/Lesson';
import Quiz from '../models/Quiz';
import Question from '../models/Question';
import UserProgress from '../models/UserProgress';
import QuizAttempt from '../models/QuizAttempt';
import logger from '../utils/logger';

/**
 * Get user's enrollments
 * GET /api/learn/enrollments
 */
export const getEnrollments = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { itemType, page = '1', limit = '10' } = req.query;

    logger.info(`User requesting enrollments: ${userId}`);

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);

    const query: any = { user: userId, isActive: true };

    // Filter by item type if provided
    if (itemType) {
      query.itemType = itemType;
    }

    // Only show valid (non-expired) enrollments
    query.validUntil = { $gte: new Date() };

    logger.info(`Fetching enrollments with query: ${JSON.stringify(query)}`);

    const enrollments = await Enrollment.find(query)
      .populate('testSeries', 'title slug thumbnail examCategory totalExams validityDays price discountPrice')
      .populate('course', 'title slug thumbnail category totalLessons')
      .populate('payment', 'orderId amount status')
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .lean();

    const total = await Enrollment.countDocuments(query);

    logger.info(`Found ${total} total enrollments, returning ${enrollments.length} items`);

    res.json({
      success: true,
      data: {
        enrollments,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error) {
    logger.error('Error fetching enrollments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch enrollments',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Check if user is enrolled in a specific item
 * GET /api/learn/check-enrollment
 */
export const checkEnrollment = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { itemId, itemType } = req.query;

    if (!itemId || !itemType) {
      return res.status(400).json({
        success: false,
        message: 'itemId and itemType are required',
      });
    }

    const query: any = {
      user: userId,
      itemType,
      isActive: true,
      validUntil: { $gte: new Date() },
    };

    // Set the correct field based on item type
    if (itemType === 'test_series') {
      query.testSeries = itemId;
    } else if (itemType === 'course') {
      query.course = itemId;
    } else if (itemType === 'bundle') {
      query.bundle = itemId;
    }

    const enrollment = await Enrollment.findOne(query)
      .populate('testSeries', 'title slug thumbnail validityDays')
      .populate('course', 'title slug thumbnail')
      .populate('payment', 'orderId amount')
      .lean();

    res.json({
      success: true,
      data: {
        isEnrolled: !!enrollment,
        enrollment: enrollment || null,
      },
    });
  } catch (error) {
    logger.error('Error checking enrollment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check enrollment',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// ==================== COURSE CONTENT ====================

/**
 * Get course with full structure for learning
 * GET /api/learn/courses/:courseId
 */
export const getCourseContent = async (req: Request, res: Response) => {
  try {
    const { courseId } = req.params;
    const userId = req.user?.userId;

    // Get course details
    const course = await Course.findById(courseId)
      .select('title slug thumbnail description examCategory totalLessons')
      .lean();

    if (!course) {
      return res.status(404).json({
        success: false,
        error: { message: 'Course not found', code: 'COURSE_NOT_FOUND' },
      });
    }

    // Check enrollment (for paid content access)
    const enrollment = await Enrollment.findOne({
      user: userId,
      course: courseId,
      isActive: true,
      validUntil: { $gte: new Date() },
    });

    const isEnrolled = !!enrollment;

    // Get subjects with chapters and lessons
    const subjects = await Subject.find({ course: courseId, isPublished: true })
      .sort({ order: 1 })
      .lean();

    const subjectsWithContent = await Promise.all(
      subjects.map(async (subject) => {
        const chapters = await Chapter.find({ subject: subject._id, isPublished: true })
          .sort({ order: 1 })
          .lean();

        const chaptersWithLessons = await Promise.all(
          chapters.map(async (chapter) => {
            const lessons = await Lesson.find({ chapter: chapter._id, isPublished: true })
              .sort({ order: 1 })
              .select('title titleHi type order isFree duration')
              .lean();

            // Mark lessons as accessible or locked
            const lessonsWithAccess = lessons.map((lesson) => ({
              ...lesson,
              isAccessible: isEnrolled || lesson.isFree || chapter.isFree,
            }));

            return {
              ...chapter,
              lessons: lessonsWithAccess,
            };
          })
        );

        return {
          ...subject,
          chapters: chaptersWithLessons,
        };
      })
    );

    // Get user progress if enrolled
    let progress = null;
    if (isEnrolled && userId) {
      progress = await UserProgress.findOne({ user: userId, course: courseId })
        .select('completedLessons percentage lastAccessedLesson subjectProgress')
        .lean();
    }

    res.json({
      success: true,
      data: {
        course,
        subjects: subjectsWithContent,
        isEnrolled,
        progress,
      },
    });
  } catch (error: any) {
    logger.error('Get course content error:', error);
    res.status(500).json({
      success: false,
      error: { message: error.message, code: 'GET_COURSE_ERROR' },
    });
  }
};

/**
 * Get lesson content
 * GET /api/learn/lessons/:lessonId
 */
export const getLessonContent = async (req: Request, res: Response) => {
  try {
    const { lessonId } = req.params;
    const { language = 'en' } = req.query;
    const userId = req.user?.userId;

    const lesson = await Lesson.findById(lessonId)
      .populate('chapter', 'isFree')
      .lean();

    if (!lesson) {
      return res.status(404).json({
        success: false,
        error: { message: 'Lesson not found', code: 'LESSON_NOT_FOUND' },
      });
    }

    // Check access
    const chapter = lesson.chapter as any;
    const isFreeAccess = lesson.isFree || chapter?.isFree;

    if (!isFreeAccess) {
      // Check enrollment
      const enrollment = await Enrollment.findOne({
        user: userId,
        course: lesson.course,
        isActive: true,
        validUntil: { $gte: new Date() },
      });

      if (!enrollment) {
        return res.status(403).json({
          success: false,
          error: { message: 'Please enroll to access this content', code: 'NOT_ENROLLED' },
        });
      }
    }

    // Prepare content based on language
    let content: any = {
      _id: lesson._id,
      title: language === 'hi' && lesson.titleHi ? lesson.titleHi : lesson.title,
      type: lesson.type,
      duration: lesson.duration,
    };

    if (lesson.type === 'notes') {
      content.content = language === 'hi' && lesson.contentHi ? lesson.contentHi : lesson.content;
      content.hasHindi = !!lesson.contentHi;
    } else if (lesson.type === 'pdf') {
      content.pdfUrl = lesson.pdfUrl;
      content.pdfName = lesson.pdfName;
      content.pdfPages = lesson.pdfPages;
      content.allowDownload = lesson.allowDownload;
    } else if (lesson.type === 'quiz') {
      // Return quiz info, not full content
      const quiz = await Quiz.findById(lesson.quiz)
        .select('title titleHi mode totalQuestions duration passingPercentage')
        .lean();
      content.quiz = quiz;
    }

    // Update last accessed
    if (userId) {
      await UserProgress.findOneAndUpdate(
        { user: userId, course: lesson.course },
        {
          lastAccessedLesson: lessonId,
          lastAccessedAt: new Date(),
        },
        { upsert: true }
      );
    }

    res.json({
      success: true,
      data: content,
    });
  } catch (error: any) {
    logger.error('Get lesson content error:', error);
    res.status(500).json({
      success: false,
      error: { message: error.message, code: 'GET_LESSON_ERROR' },
    });
  }
};

/**
 * Mark lesson as complete
 * POST /api/learn/lessons/:lessonId/complete
 */
export const markLessonComplete = async (req: Request, res: Response) => {
  try {
    const { lessonId } = req.params;
    const userId = req.user!.userId;

    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      return res.status(404).json({
        success: false,
        error: { message: 'Lesson not found', code: 'LESSON_NOT_FOUND' },
      });
    }

    // Get or create progress
    let progress = await UserProgress.findOne({ user: userId, course: lesson.course });

    if (!progress) {
      // Initialize progress
      const subjects = await Subject.find({ course: lesson.course });
      const chapters = await Chapter.find({ course: lesson.course });

      progress = new UserProgress({
        user: userId,
        course: lesson.course,
        completedLessons: [],
        subjectProgress: subjects.map((s) => ({
          subjectId: s._id,
          completedLessons: 0,
          totalLessons: s.totalLessons,
          percentage: 0,
        })),
        chapterProgress: chapters.map((c) => ({
          chapterId: c._id,
          subjectId: c.subject,
          completedLessons: 0,
          totalLessons: c.totalLessons,
          percentage: 0,
        })),
      });
    }

    // Check if already completed
    if (progress.completedLessons.includes(lesson._id)) {
      return res.json({
        success: true,
        message: 'Lesson already completed',
        data: { percentage: progress.percentage },
      });
    }

    // Add to completed lessons
    progress.completedLessons.push(lesson._id);

    // Update chapter progress
    const chapterIdx = progress.chapterProgress.findIndex(
      (cp) => cp.chapterId.toString() === lesson.chapter.toString()
    );
    if (chapterIdx >= 0) {
      progress.chapterProgress[chapterIdx].completedLessons += 1;
      progress.chapterProgress[chapterIdx].percentage = Math.round(
        (progress.chapterProgress[chapterIdx].completedLessons /
          progress.chapterProgress[chapterIdx].totalLessons) *
          100
      );
    }

    // Update subject progress
    const subjectIdx = progress.subjectProgress.findIndex(
      (sp) => sp.subjectId.toString() === lesson.subject.toString()
    );
    if (subjectIdx >= 0) {
      progress.subjectProgress[subjectIdx].completedLessons += 1;
      progress.subjectProgress[subjectIdx].percentage = Math.round(
        (progress.subjectProgress[subjectIdx].completedLessons /
          progress.subjectProgress[subjectIdx].totalLessons) *
          100
      );
    }

    // Update overall progress
    const totalLessons = await Lesson.countDocuments({ course: lesson.course, isPublished: true });
    progress.percentage = Math.round((progress.completedLessons.length / totalLessons) * 100);

    // Check if completed
    if (progress.percentage >= 100) {
      progress.isCompleted = true;
      progress.completedAt = new Date();
    }

    await progress.save();

    logger.info(`Lesson ${lessonId} marked complete by user ${userId}`);

    res.json({
      success: true,
      message: 'Lesson marked as complete',
      data: {
        percentage: progress.percentage,
        isCompleted: progress.isCompleted,
      },
    });
  } catch (error: any) {
    logger.error('Mark lesson complete error:', error);
    res.status(500).json({
      success: false,
      error: { message: error.message, code: 'MARK_COMPLETE_ERROR' },
    });
  }
};

/**
 * Get user progress for a course
 * GET /api/learn/courses/:courseId/progress
 */
export const getCourseProgress = async (req: Request, res: Response) => {
  try {
    const { courseId } = req.params;
    const userId = req.user!.userId;

    const progress = await UserProgress.findOne({ user: userId, course: courseId })
      .populate('lastAccessedLesson', 'title type')
      .lean();

    if (!progress) {
      return res.json({
        success: true,
        data: {
          percentage: 0,
          completedLessons: [],
          subjectProgress: [],
          chapterProgress: [],
        },
      });
    }

    res.json({
      success: true,
      data: progress,
    });
  } catch (error: any) {
    logger.error('Get course progress error:', error);
    res.status(500).json({
      success: false,
      error: { message: error.message, code: 'GET_PROGRESS_ERROR' },
    });
  }
};

// ==================== QUIZ ====================

/**
 * Get quiz info for start screen
 * GET /api/learn/quizzes/:quizId/info
 */
export const getQuizInfo = async (req: Request, res: Response) => {
  try {
    const { quizId } = req.params;

    const quiz = await Quiz.findById(quizId)
      .select('title titleHi mode totalQuestions duration passingPercentage correctMarks wrongMarks')
      .lean();

    if (!quiz) {
      return res.status(404).json({
        success: false,
        error: { message: 'Quiz not found', code: 'QUIZ_NOT_FOUND' },
      });
    }

    res.json({
      success: true,
      data: {
        _id: quiz._id,
        title: quiz.title,
        titleHi: quiz.titleHi,
        mode: quiz.mode,
        totalQuestions: quiz.totalQuestions,
        duration: quiz.duration,
        passingPercentage: quiz.passingPercentage,
        correctMarks: quiz.correctMarks,
        wrongMarks: quiz.wrongMarks,
      },
    });
  } catch (error: any) {
    logger.error('Get quiz info error:', error);
    res.status(500).json({
      success: false,
      error: { message: error.message, code: 'GET_QUIZ_INFO_ERROR' },
    });
  }
};

/**
 * Start quiz attempt
 * POST /api/learn/quizzes/:quizId/start
 */
export const startQuiz = async (req: Request, res: Response) => {
  try {
    const { quizId } = req.params;
    const { language = 'en', mode: requestedMode } = req.body;
    const userId = req.user!.userId;

    const quiz = await Quiz.findById(quizId).populate('questions');
    if (!quiz) {
      return res.status(404).json({
        success: false,
        error: { message: 'Quiz not found', code: 'QUIZ_NOT_FOUND' },
      });
    }

    // Allow user to override mode if provided and valid
    const effectiveMode = (requestedMode === 'practice' || requestedMode === 'exam')
      ? requestedMode
      : quiz.mode;

    // Check for existing in-progress attempt
    const existingAttempt = await QuizAttempt.findOne({
      user: userId,
      quiz: quizId,
      status: 'in_progress',
    });

    if (existingAttempt) {
      // Return existing attempt in the same format as new attempt
      const questions = await Question.find({ _id: { $in: quiz.questions } }).lean();

      // Transform questions to array format (same as new attempt)
      const questionsForUser = questions.map((q: any) => {
        const optionsArray = [
          { id: 'a', text: q.options.a, textHi: q.optionsHindi?.a },
          { id: 'b', text: q.options.b, textHi: q.optionsHindi?.b },
          { id: 'c', text: q.options.c, textHi: q.optionsHindi?.c },
          { id: 'd', text: q.options.d, textHi: q.optionsHindi?.d },
        ];

        return {
          _id: q._id,
          question: q.question,
          questionHi: q.questionHindi,
          options: optionsArray,
          explanation: q.explanation,
          explanationHi: q.explanationHindi,
        };
      });

      // Convert answers array to object format { questionId: selectedOption }
      const answersObj: Record<string, string> = {};
      existingAttempt.answers.forEach((a: any) => {
        if (a.selectedOption) {
          answersObj[a.questionId.toString()] = a.selectedOption;
        }
      });

      return res.json({
        success: true,
        data: {
          _id: existingAttempt._id,
          quiz: {
            _id: quiz._id,
            mode: existingAttempt.mode || quiz.mode, // Use attempt's mode (user-selected)
            duration: quiz.duration,
            correctMarks: quiz.correctMarks,
            wrongMarks: quiz.wrongMarks,
            passingPercentage: quiz.passingPercentage,
            showExplanationAfterEach: quiz.showExplanationAfterEach,
          },
          questions: quiz.shuffleQuestions ? shuffleArray(questionsForUser) : questionsForUser,
          answers: answersObj,
          startedAt: existingAttempt.startedAt,
          status: existingAttempt.status,
          currentStreak: existingAttempt.currentStreak,
          bestStreak: existingAttempt.maxStreak,
          totalPoints: existingAttempt.totalPoints,
          correctCount: existingAttempt.correct,
          incorrectCount: existingAttempt.wrong,
        },
      });
    }

    // Check max attempts
    if (!quiz.allowRetake || (quiz.maxAttempts > 0)) {
      const attemptCount = await QuizAttempt.countDocuments({
        user: userId,
        quiz: quizId,
        status: 'completed',
      });

      if (quiz.maxAttempts > 0 && attemptCount >= quiz.maxAttempts) {
        return res.status(400).json({
          success: false,
          error: { message: 'Maximum attempts reached', code: 'MAX_ATTEMPTS' },
        });
      }
    }

    // Get questions
    let questions = await Question.find({ _id: { $in: quiz.questions } }).lean();

    // Shuffle if enabled
    if (quiz.shuffleQuestions) {
      questions = shuffleArray(questions);
    }

    // Create attempt
    const attempt = new QuizAttempt({
      user: userId,
      quiz: quizId,
      lesson: quiz.lesson,
      course: quiz.course,
      mode: effectiveMode,
      totalQuestions: questions.length,
      maxScore: questions.length * quiz.correctMarks,
      timeLimit: quiz.duration * 60, // Convert to seconds
      language,
      answers: questions.map((q) => ({
        questionId: q._id,
        selectedOption: null,
        isCorrect: false,
        timeTaken: 0,
        markedForReview: false,
      })),
    });

    await attempt.save();

    // Format questions for response - transform to array format for frontend
    const questionsForUser = questions.map((q: any) => {
      // Transform options object to array format
      const optionsArray = [
        { id: 'a', text: q.options.a, textHi: q.optionsHindi?.a },
        { id: 'b', text: q.options.b, textHi: q.optionsHindi?.b },
        { id: 'c', text: q.options.c, textHi: q.optionsHindi?.c },
        { id: 'd', text: q.options.d, textHi: q.optionsHindi?.d },
      ];

      return {
        _id: q._id,
        question: q.question,
        questionHi: q.questionHindi,
        options: optionsArray,
        explanation: q.explanation,
        explanationHi: q.explanationHindi,
      };
    });

    logger.info(`Quiz attempt started: ${attempt._id} by user ${userId}`);

    // Return format matching frontend interface
    res.json({
      success: true,
      data: {
        _id: attempt._id,
        quiz: {
          _id: quiz._id,
          mode: effectiveMode,
          duration: quiz.duration,
          correctMarks: quiz.correctMarks,
          wrongMarks: quiz.wrongMarks,
          passingPercentage: quiz.passingPercentage,
          showExplanationAfterEach: quiz.showExplanationAfterEach,
        },
        questions: questionsForUser,
        answers: {}, // Empty object - frontend tracks locally
        startedAt: attempt.startedAt,
        status: 'in_progress',
      },
    });
  } catch (error: any) {
    logger.error('Start quiz error:', error);
    res.status(500).json({
      success: false,
      error: { message: error.message, code: 'START_QUIZ_ERROR' },
    });
  }
};

/**
 * Submit answer (practice mode - immediate feedback)
 * POST /api/learn/quiz-attempts/:attemptId/answer
 */
export const submitAnswer = async (req: Request, res: Response) => {
  try {
    const { attemptId } = req.params;
    // Accept questionId from frontend (not questionIndex)
    const { questionId, selectedOption, timeTaken } = req.body;
    const userId = req.user!.userId;

    const attempt = await QuizAttempt.findOne({ _id: attemptId, user: userId });
    if (!attempt) {
      return res.status(404).json({
        success: false,
        error: { message: 'Attempt not found', code: 'ATTEMPT_NOT_FOUND' },
      });
    }

    if (attempt.status !== 'in_progress') {
      return res.status(400).json({
        success: false,
        error: { message: 'Quiz already completed', code: 'QUIZ_COMPLETED' },
      });
    }

    if (attempt.mode !== 'practice') {
      return res.status(400).json({
        success: false,
        error: { message: 'Use submit endpoint for exam mode', code: 'WRONG_MODE' },
      });
    }

    // Find answer by questionId (not by index)
    const answerIndex = attempt.answers.findIndex(
      (a) => a.questionId.toString() === questionId
    );

    if (answerIndex === -1) {
      return res.status(400).json({
        success: false,
        error: { message: 'Invalid question ID', code: 'INVALID_QUESTION' },
      });
    }

    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({
        success: false,
        error: { message: 'Question not found', code: 'QUESTION_NOT_FOUND' },
      });
    }

    const isCorrect = selectedOption === question.correctAnswer;

    // Update answer
    attempt.answers[answerIndex].selectedOption = selectedOption;
    attempt.answers[answerIndex].isCorrect = isCorrect;
    attempt.answers[answerIndex].timeTaken = timeTaken || 0;

    // Calculate points with streak bonus
    const basePoints = 10;
    let streakBonus = 0;

    // Update stats
    if (isCorrect) {
      attempt.correct += 1;
      attempt.currentStreak += 1;
      if (attempt.currentStreak > attempt.maxStreak) {
        attempt.maxStreak = attempt.currentStreak;
      }
      streakBonus = attempt.currentStreak > 1 ? (attempt.currentStreak - 1) * 2 : 0;
      attempt.bonusPoints += streakBonus;
      attempt.totalPoints += basePoints + streakBonus;
    } else {
      attempt.wrong += 1;
      attempt.currentStreak = 0;
    }

    attempt.attempted += 1;
    attempt.currentQuestionIndex = answerIndex + 1;

    await attempt.save();

    // Update question analytics
    await Question.findByIdAndUpdate(question._id, {
      $inc: {
        timesAnswered: 1,
        ...(isCorrect && { timesCorrect: 1 }),
      },
    });

    // Get quiz for explanation setting
    const quiz = await Quiz.findById(attempt.quiz);

    // Return format matching frontend's AnswerResult interface
    res.json({
      success: true,
      data: {
        isCorrect,
        correctOption: question.correctAnswer, // 'a', 'b', 'c', or 'd'
        explanation: question.explanation,
        explanationHi: question.explanationHindi,
        pointsEarned: isCorrect ? basePoints + streakBonus : 0,
        streak: attempt.currentStreak,
        bonusPoints: streakBonus,
      },
    });
  } catch (error: any) {
    logger.error('Submit answer error:', error);
    res.status(500).json({
      success: false,
      error: { message: error.message, code: 'SUBMIT_ANSWER_ERROR' },
    });
  }
};

/**
 * Submit entire quiz (exam mode or practice mode finish)
 * POST /api/learn/quiz-attempts/:attemptId/submit
 */
export const submitQuiz = async (req: Request, res: Response) => {
  try {
    const { attemptId } = req.params;
    // Frontend sends: { answers: { "questionId1": "a", "questionId2": "b" } }
    const { answers } = req.body; // Record<string, string> for exam mode
    const userId = req.user!.userId;

    const attempt = await QuizAttempt.findOne({ _id: attemptId, user: userId });
    if (!attempt) {
      return res.status(404).json({
        success: false,
        error: { message: 'Attempt not found', code: 'ATTEMPT_NOT_FOUND' },
      });
    }

    if (attempt.status !== 'in_progress') {
      return res.status(400).json({
        success: false,
        error: { message: 'Quiz already submitted', code: 'ALREADY_SUBMITTED' },
      });
    }

    const quiz = await Quiz.findById(attempt.quiz);
    if (!quiz) {
      return res.status(404).json({
        success: false,
        error: { message: 'Quiz not found', code: 'QUIZ_NOT_FOUND' },
      });
    }

    // Process exam mode answers - frontend sends object format {questionId: selectedOption}
    if (attempt.mode === 'exam' && answers && typeof answers === 'object') {
      for (let i = 0; i < attempt.answers.length; i++) {
        const qId = attempt.answers[i].questionId.toString();
        if (answers[qId]) {
          attempt.answers[i].selectedOption = answers[qId];
        }
      }
    }

    // Calculate results
    let correct = 0;
    let wrong = 0;
    let skipped = 0;
    let totalTimeTaken = 0;

    const questionIds = attempt.answers.map((a) => a.questionId);
    const questions = await Question.find({ _id: { $in: questionIds } });
    const questionMap = new Map(questions.map((q) => [q._id.toString(), q]));

    for (let i = 0; i < attempt.answers.length; i++) {
      const ans = attempt.answers[i];
      const question = questionMap.get(ans.questionId.toString());

      if (!question) continue;

      totalTimeTaken += ans.timeTaken;

      if (ans.selectedOption === null) {
        skipped++;
        attempt.answers[i].isCorrect = false;
      } else if (ans.selectedOption === question.correctAnswer) {
        correct++;
        attempt.answers[i].isCorrect = true;
      } else {
        wrong++;
        attempt.answers[i].isCorrect = false;
      }

      // Update question analytics
      if (ans.selectedOption !== null) {
        await Question.findByIdAndUpdate(question._id, {
          $inc: {
            timesAnswered: 1,
            ...(ans.selectedOption === question.correctAnswer && { timesCorrect: 1 }),
          },
        });
      }
    }

    // Calculate score with marking scheme
    const score =
      (correct * quiz.correctMarks) +
      (wrong * quiz.wrongMarks) +
      (skipped * quiz.unattemptedMarks);

    const maxScore = attempt.totalQuestions * quiz.correctMarks;
    const percentage = Math.max(0, Math.round((score / maxScore) * 100));

    // Determine grade
    let grade: 'S' | 'A' | 'B' | 'C' | 'F';
    if (percentage >= 90) grade = 'S';
    else if (percentage >= 75) grade = 'A';
    else if (percentage >= 50) grade = 'B';
    else if (percentage >= 35) grade = 'C';
    else grade = 'F';

    const passed = percentage >= quiz.passingPercentage;

    // Update attempt
    attempt.status = 'completed';
    attempt.correct = correct;
    attempt.wrong = wrong;
    attempt.skipped = skipped;
    attempt.attempted = correct + wrong;
    attempt.score = Math.max(0, score);
    attempt.maxScore = maxScore;
    attempt.percentage = percentage;
    attempt.grade = grade;
    attempt.passed = passed;
    attempt.completedAt = new Date();
    attempt.totalTimeTaken = totalTimeTaken;

    await attempt.save();

    // Update quiz stats
    await Quiz.findByIdAndUpdate(quiz._id, {
      $inc: { totalAttempts: 1 },
    });

    logger.info(`Quiz submitted: ${attemptId} by user ${userId}, score: ${score}/${maxScore}`);

    // Build questionResults for frontend
    const questionResults = attempt.answers.map((ans) => {
      const question = questionMap.get(ans.questionId.toString());
      return {
        questionId: ans.questionId.toString(),
        selectedOption: ans.selectedOption,
        correctOption: question?.correctAnswer || '',
        isCorrect: ans.isCorrect,
        explanation: question?.explanation,
      };
    });

    // Return format matching frontend's QuizResult interface
    res.json({
      success: true,
      data: {
        score: attempt.score,
        totalMarks: attempt.maxScore,
        percentage: attempt.percentage,
        grade: attempt.grade,
        correctCount: attempt.correct,
        incorrectCount: attempt.wrong,
        unansweredCount: attempt.skipped,
        timeTaken: attempt.totalTimeTaken,
        passed: attempt.passed,
        bestStreak: attempt.maxStreak,
        totalPoints: attempt.totalPoints,
        questionResults,
      },
    });
  } catch (error: any) {
    logger.error('Submit quiz error:', error);
    res.status(500).json({
      success: false,
      error: { message: error.message, code: 'SUBMIT_QUIZ_ERROR' },
    });
  }
};

/**
 * Get quiz result with answers
 * GET /api/learn/quiz-attempts/:attemptId/result
 */
export const getQuizResult = async (req: Request, res: Response) => {
  try {
    const { attemptId } = req.params;
    const userId = req.user!.userId;

    const attempt = await QuizAttempt.findOne({ _id: attemptId, user: userId })
      .populate('quiz', 'title showAnswersAtEnd')
      .lean();

    if (!attempt) {
      return res.status(404).json({
        success: false,
        error: { message: 'Attempt not found', code: 'ATTEMPT_NOT_FOUND' },
      });
    }

    const quiz = attempt.quiz as any;

    // Get questions for building questionResults
    const questionIds = attempt.answers.map((a) => a.questionId);
    const questions = await Question.find({ _id: { $in: questionIds } }).lean();
    const questionMap = new Map(questions.map((q) => [q._id.toString(), q]));

    // Build questionResults matching frontend's QuizResult interface
    const questionResults = attempt.answers.map((ans) => {
      const question = questionMap.get(ans.questionId.toString());
      return {
        questionId: ans.questionId.toString(),
        selectedOption: ans.selectedOption,
        correctOption: question?.correctAnswer || '',
        isCorrect: ans.isCorrect,
        explanation: question?.explanation,
      };
    });

    // Return format matching frontend's QuizResult interface
    res.json({
      success: true,
      data: {
        score: attempt.score,
        totalMarks: attempt.maxScore,
        percentage: attempt.percentage,
        grade: attempt.grade,
        correctCount: attempt.correct,
        incorrectCount: attempt.wrong,
        unansweredCount: attempt.skipped,
        timeTaken: attempt.totalTimeTaken,
        passed: attempt.passed,
        bestStreak: attempt.maxStreak,
        totalPoints: attempt.totalPoints,
        questionResults: quiz.showAnswersAtEnd ? questionResults : [],
      },
    });
  } catch (error: any) {
    logger.error('Get quiz result error:', error);
    res.status(500).json({
      success: false,
      error: { message: error.message, code: 'GET_RESULT_ERROR' },
    });
  }
};

/**
 * Get user's quiz attempts history
 * GET /api/learn/quizzes/:quizId/attempts
 */
export const getQuizAttempts = async (req: Request, res: Response) => {
  try {
    const { quizId } = req.params;
    const userId = req.user!.userId;

    const attempts = await QuizAttempt.find({
      user: userId,
      quiz: quizId,
      status: 'completed',
    })
      .sort({ completedAt: -1 })
      .select('score maxScore percentage grade passed totalTimeTaken completedAt')
      .lean();

    res.json({
      success: true,
      data: attempts,
    });
  } catch (error: any) {
    logger.error('Get quiz attempts error:', error);
    res.status(500).json({
      success: false,
      error: { message: error.message, code: 'GET_ATTEMPTS_ERROR' },
    });
  }
};

/**
 * Get all courses progress (dashboard)
 * GET /api/learn/dashboard/progress
 */
export const getDashboardProgress = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;

    const progress = await UserProgress.find({ user: userId })
      .populate('course', 'title slug thumbnail')
      .populate('lastAccessedLesson', 'title type')
      .sort({ lastAccessedAt: -1 })
      .lean();

    res.json({
      success: true,
      data: progress,
    });
  } catch (error: any) {
    logger.error('Get dashboard progress error:', error);
    res.status(500).json({
      success: false,
      error: { message: error.message, code: 'GET_DASHBOARD_ERROR' },
    });
  }
};

// Helper function to shuffle array
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
