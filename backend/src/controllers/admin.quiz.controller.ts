import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Quiz from '../models/Quiz';
import Question from '../models/Question';
import Lesson from '../models/Lesson';
import logger from '../utils/logger';

// ==================== QUIZ CRUD ====================

// Create quiz for a lesson
export const createQuiz = async (req: Request, res: Response) => {
  try {
    const { lessonId } = req.params;
    const {
      title,
      titleHi,
      description,
      descriptionHi,
      mode,
      duration,
      passingPercentage,
      shuffleQuestions,
      shuffleOptions,
      showExplanationAfterEach,
      allowRetake,
      maxAttempts,
      showAnswersAtEnd,
      correctMarks,
      wrongMarks,
      unattemptedMarks,
    } = req.body;

    // Verify lesson exists and is of type quiz
    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      return res.status(404).json({
        success: false,
        error: { message: 'Lesson not found', code: 'LESSON_NOT_FOUND' },
      });
    }

    if (lesson.type !== 'quiz') {
      return res.status(400).json({
        success: false,
        error: { message: 'Lesson is not of type quiz', code: 'INVALID_LESSON_TYPE' },
      });
    }

    // Check if quiz already exists for this lesson
    if (lesson.quiz) {
      return res.status(400).json({
        success: false,
        error: { message: 'Quiz already exists for this lesson', code: 'QUIZ_EXISTS' },
      });
    }

    const quiz = new Quiz({
      lesson: lessonId,
      course: lesson.course,
      title: title || lesson.title,
      titleHi: titleHi || lesson.titleHi,
      description,
      descriptionHi,
      mode: mode || 'practice',
      duration: duration || 0,
      passingPercentage: passingPercentage || 40,
      shuffleQuestions: shuffleQuestions !== false,
      shuffleOptions: shuffleOptions !== false,
      showExplanationAfterEach: showExplanationAfterEach !== false,
      allowRetake: allowRetake !== false,
      maxAttempts: maxAttempts || 0,
      showAnswersAtEnd: showAnswersAtEnd !== false,
      correctMarks: correctMarks || 1,
      wrongMarks: mode === 'exam' ? (wrongMarks ?? -0.25) : 0,
      unattemptedMarks: unattemptedMarks || 0,
      createdBy: req.user!.userId,
    });

    await quiz.save();

    // Link quiz to lesson
    await Lesson.findByIdAndUpdate(lessonId, { quiz: quiz._id });

    logger.info(`Quiz created: ${quiz._id} for lesson ${lessonId}`);

    res.status(201).json({
      success: true,
      data: quiz,
      message: 'Quiz created successfully',
    });
  } catch (error: any) {
    logger.error('Create quiz error:', error);
    res.status(400).json({
      success: false,
      error: { message: error.message, code: 'CREATE_QUIZ_ERROR' },
    });
  }
};

// Get quiz with questions
export const getQuiz = async (req: Request, res: Response) => {
  try {
    const { quizId } = req.params;

    const quiz = await Quiz.findById(quizId)
      .populate({
        path: 'questions',
        select: 'question questionHindi options optionsHindi correctAnswer explanation explanationHindi difficulty subject topic',
      })
      .lean();

    if (!quiz) {
      return res.status(404).json({
        success: false,
        error: { message: 'Quiz not found', code: 'QUIZ_NOT_FOUND' },
      });
    }

    res.json({
      success: true,
      data: quiz,
    });
  } catch (error: any) {
    logger.error('Get quiz error:', error);
    res.status(400).json({
      success: false,
      error: { message: error.message, code: 'GET_QUIZ_ERROR' },
    });
  }
};

// Update quiz settings
export const updateQuiz = async (req: Request, res: Response) => {
  try {
    const { quizId } = req.params;
    const {
      title,
      titleHi,
      description,
      descriptionHi,
      mode,
      duration,
      passingPercentage,
      shuffleQuestions,
      shuffleOptions,
      showExplanationAfterEach,
      allowRetake,
      maxAttempts,
      showAnswersAtEnd,
      correctMarks,
      wrongMarks,
      unattemptedMarks,
      isPublished,
    } = req.body;

    const quiz = await Quiz.findByIdAndUpdate(
      quizId,
      {
        title,
        titleHi,
        description,
        descriptionHi,
        mode,
        duration,
        passingPercentage,
        ...(typeof shuffleQuestions === 'boolean' && { shuffleQuestions }),
        ...(typeof shuffleOptions === 'boolean' && { shuffleOptions }),
        ...(typeof showExplanationAfterEach === 'boolean' && { showExplanationAfterEach }),
        ...(typeof allowRetake === 'boolean' && { allowRetake }),
        maxAttempts,
        ...(typeof showAnswersAtEnd === 'boolean' && { showAnswersAtEnd }),
        correctMarks,
        wrongMarks,
        unattemptedMarks,
        ...(typeof isPublished === 'boolean' && { isPublished }),
      },
      { new: true }
    );

    if (!quiz) {
      return res.status(404).json({
        success: false,
        error: { message: 'Quiz not found', code: 'QUIZ_NOT_FOUND' },
      });
    }

    logger.info(`Quiz updated: ${quizId}`);

    res.json({
      success: true,
      data: quiz,
      message: 'Quiz updated successfully',
    });
  } catch (error: any) {
    logger.error('Update quiz error:', error);
    res.status(400).json({
      success: false,
      error: { message: error.message, code: 'UPDATE_QUIZ_ERROR' },
    });
  }
};

// Delete quiz
export const deleteQuiz = async (req: Request, res: Response) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { quizId } = req.params;

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        error: { message: 'Quiz not found', code: 'QUIZ_NOT_FOUND' },
      });
    }

    // Remove quiz reference from questions
    await Question.updateMany(
      { usedInQuizzes: quizId },
      { $pull: { usedInQuizzes: quizId } },
      { session }
    );

    // Remove quiz reference from lesson
    await Lesson.findByIdAndUpdate(quiz.lesson, { $unset: { quiz: 1 } }, { session });

    // Delete quiz
    await Quiz.findByIdAndDelete(quizId, { session });

    await session.commitTransaction();

    logger.info(`Quiz deleted: ${quizId}`);

    res.json({
      success: true,
      message: 'Quiz deleted successfully',
    });
  } catch (error: any) {
    await session.abortTransaction();
    logger.error('Delete quiz error:', error);
    res.status(400).json({
      success: false,
      error: { message: error.message, code: 'DELETE_QUIZ_ERROR' },
    });
  } finally {
    session.endSession();
  }
};

// ==================== QUIZ QUESTIONS ====================

// Get questions for a quiz
export const getQuizQuestions = async (req: Request, res: Response) => {
  try {
    const { quizId } = req.params;

    const quiz = await Quiz.findById(quizId)
      .populate({
        path: 'questions',
        select: 'question questionHindi options optionsHindi correctAnswer explanation explanationHindi difficulty subject topic tags',
      })
      .lean();

    if (!quiz) {
      return res.status(404).json({
        success: false,
        error: { message: 'Quiz not found', code: 'QUIZ_NOT_FOUND' },
      });
    }

    res.json({
      success: true,
      data: quiz.questions,
    });
  } catch (error: any) {
    logger.error('Get quiz questions error:', error);
    res.status(400).json({
      success: false,
      error: { message: error.message, code: 'GET_QUIZ_QUESTIONS_ERROR' },
    });
  }
};

// Add question to quiz (from question bank)
export const addQuestionToQuiz = async (req: Request, res: Response) => {
  try {
    const { quizId } = req.params;
    const { questionId } = req.body;

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({
        success: false,
        error: { message: 'Quiz not found', code: 'QUIZ_NOT_FOUND' },
      });
    }

    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({
        success: false,
        error: { message: 'Question not found', code: 'QUESTION_NOT_FOUND' },
      });
    }

    // Check if question already in quiz
    if (quiz.questions.includes(questionId)) {
      return res.status(400).json({
        success: false,
        error: { message: 'Question already in quiz', code: 'QUESTION_EXISTS' },
      });
    }

    // Add question to quiz
    quiz.questions.push(questionId);
    quiz.totalQuestions = quiz.questions.length;
    await quiz.save();

    // Track usage in question
    await Question.findByIdAndUpdate(questionId, {
      $addToSet: { usedInQuizzes: quizId },
    });

    logger.info(`Question ${questionId} added to quiz ${quizId}`);

    res.json({
      success: true,
      message: 'Question added to quiz successfully',
    });
  } catch (error: any) {
    logger.error('Add question to quiz error:', error);
    res.status(400).json({
      success: false,
      error: { message: error.message, code: 'ADD_QUESTION_ERROR' },
    });
  }
};

// Add multiple questions to quiz
export const addQuestionsToQuiz = async (req: Request, res: Response) => {
  try {
    const { quizId } = req.params;
    const { questionIds } = req.body;

    if (!Array.isArray(questionIds) || questionIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: { message: 'Question IDs array required', code: 'INVALID_INPUT' },
      });
    }

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({
        success: false,
        error: { message: 'Quiz not found', code: 'QUIZ_NOT_FOUND' },
      });
    }

    // Filter out duplicates
    const existingIds = quiz.questions.map((q) => q.toString());
    const newQuestionIds = questionIds.filter((id: string) => !existingIds.includes(id));

    if (newQuestionIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: { message: 'All questions already in quiz', code: 'ALL_QUESTIONS_EXIST' },
      });
    }

    // Add questions to quiz
    quiz.questions.push(...newQuestionIds);
    quiz.totalQuestions = quiz.questions.length;
    await quiz.save();

    // Track usage in questions
    await Question.updateMany(
      { _id: { $in: newQuestionIds } },
      { $addToSet: { usedInQuizzes: quizId } }
    );

    logger.info(`${newQuestionIds.length} questions added to quiz ${quizId}`);

    res.json({
      success: true,
      message: `${newQuestionIds.length} questions added to quiz successfully`,
      data: { addedCount: newQuestionIds.length },
    });
  } catch (error: any) {
    logger.error('Add questions to quiz error:', error);
    res.status(400).json({
      success: false,
      error: { message: error.message, code: 'ADD_QUESTIONS_ERROR' },
    });
  }
};

// Remove question from quiz
export const removeQuestionFromQuiz = async (req: Request, res: Response) => {
  try {
    const { quizId, questionId } = req.params;

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({
        success: false,
        error: { message: 'Quiz not found', code: 'QUIZ_NOT_FOUND' },
      });
    }

    // Remove question from quiz
    quiz.questions = quiz.questions.filter((q) => q.toString() !== questionId);
    quiz.totalQuestions = quiz.questions.length;
    await quiz.save();

    // Remove usage tracking from question
    await Question.findByIdAndUpdate(questionId, {
      $pull: { usedInQuizzes: quizId },
    });

    logger.info(`Question ${questionId} removed from quiz ${quizId}`);

    res.json({
      success: true,
      message: 'Question removed from quiz successfully',
    });
  } catch (error: any) {
    logger.error('Remove question from quiz error:', error);
    res.status(400).json({
      success: false,
      error: { message: error.message, code: 'REMOVE_QUESTION_ERROR' },
    });
  }
};

// Reorder questions in quiz
export const reorderQuizQuestions = async (req: Request, res: Response) => {
  try {
    const { quizId } = req.params;
    const { questionIds } = req.body;

    if (!Array.isArray(questionIds)) {
      return res.status(400).json({
        success: false,
        error: { message: 'Question IDs array required', code: 'INVALID_INPUT' },
      });
    }

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({
        success: false,
        error: { message: 'Quiz not found', code: 'QUIZ_NOT_FOUND' },
      });
    }

    // Validate all question IDs exist in quiz
    const existingIds = quiz.questions.map((q) => q.toString());
    const allValid = questionIds.every((id: string) => existingIds.includes(id));

    if (!allValid || questionIds.length !== existingIds.length) {
      return res.status(400).json({
        success: false,
        error: { message: 'Invalid question IDs', code: 'INVALID_QUESTION_IDS' },
      });
    }

    // Update question order
    quiz.questions = questionIds;
    await quiz.save();

    logger.info(`Quiz ${quizId} questions reordered`);

    res.json({
      success: true,
      message: 'Questions reordered successfully',
    });
  } catch (error: any) {
    logger.error('Reorder quiz questions error:', error);
    res.status(400).json({
      success: false,
      error: { message: error.message, code: 'REORDER_QUESTIONS_ERROR' },
    });
  }
};

// Create new question directly for quiz
export const createQuestionForQuiz = async (req: Request, res: Response) => {
  try {
    const { quizId } = req.params;
    const {
      question: questionText,
      questionHindi,
      options,
      optionsHindi,
      correctAnswer,
      explanation,
      explanationHindi,
      difficulty,
      subject,
      topic,
      tags,
      source,
      year,
      examCategory,
    } = req.body;

    const quiz = await Quiz.findById(quizId).populate('course');
    if (!quiz) {
      return res.status(404).json({
        success: false,
        error: { message: 'Quiz not found', code: 'QUIZ_NOT_FOUND' },
      });
    }

    // Create question
    const question = new Question({
      question: questionText,
      questionHindi,
      options,
      optionsHindi,
      correctAnswer,
      explanation,
      explanationHindi,
      difficulty: difficulty || 'medium',
      subject: subject || 'General',
      topic,
      tags: tags || [],
      source,
      year,
      examCategory: examCategory || 'OTHER',
      usedInQuizzes: [quizId],
      createdBy: req.user!.userId,
    });

    await question.save();

    // Add to quiz
    quiz.questions.push(question._id);
    quiz.totalQuestions = quiz.questions.length;
    await quiz.save();

    logger.info(`Question created and added to quiz ${quizId}`);

    res.status(201).json({
      success: true,
      data: question,
      message: 'Question created and added to quiz successfully',
    });
  } catch (error: any) {
    logger.error('Create question for quiz error:', error);
    res.status(400).json({
      success: false,
      error: { message: error.message, code: 'CREATE_QUESTION_ERROR' },
    });
  }
};

export default {
  createQuiz,
  getQuiz,
  updateQuiz,
  deleteQuiz,
  getQuizQuestions,
  addQuestionToQuiz,
  addQuestionsToQuiz,
  removeQuestionFromQuiz,
  reorderQuizQuestions,
  createQuestionForQuiz,
};
