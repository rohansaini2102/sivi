import { Request, Response } from 'express';
import Question from '../models/Question';
import logger from '../utils/logger';

// List questions with filters
export const listQuestions = async (req: Request, res: Response) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      subject,
      topic,
      difficulty,
      examCategory,
      tags,
      isActive,
      usedInQuiz,
      notUsedInQuiz,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    const filter: any = {};

    // Search in question text
    if (search) {
      filter.$or = [
        { question: { $regex: search, $options: 'i' } },
        { questionHindi: { $regex: search, $options: 'i' } },
      ];
    }

    // Filters
    if (subject) {
      filter.subject = subject;
    }

    if (topic) {
      filter.topic = { $regex: topic, $options: 'i' };
    }

    if (difficulty) {
      filter.difficulty = difficulty;
    }

    if (examCategory && examCategory !== 'all') {
      filter.examCategory = examCategory;
    }

    if (tags) {
      const tagArray = typeof tags === 'string' ? tags.split(',') : tags;
      filter.tags = { $in: tagArray };
    }

    if (typeof isActive === 'string') {
      filter.isActive = isActive === 'true';
    }

    // Filter by quiz usage
    if (usedInQuiz) {
      filter.usedInQuizzes = { $ne: [] };
    }

    if (notUsedInQuiz) {
      filter.usedInQuizzes = { $size: 0 };
    }

    // Build sort
    const sort: any = {};
    sort[sortBy as string] = sortOrder === 'asc' ? 1 : -1;

    const total = await Question.countDocuments(filter);

    const questions = await Question.find(filter)
      .sort(sort)
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .select('-createdBy')
      .lean();

    res.json({
      success: true,
      data: {
        questions,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages: Math.ceil(total / Number(limit)),
        },
      },
    });
  } catch (error: any) {
    logger.error('List questions error:', error);
    res.status(400).json({
      success: false,
      error: { message: error.message, code: 'LIST_QUESTIONS_ERROR' },
    });
  }
};

// Get single question
export const getQuestion = async (req: Request, res: Response) => {
  try {
    const { questionId } = req.params;

    const question = await Question.findById(questionId)
      .populate('usedInQuizzes', 'title')
      .populate('usedInExams', 'title')
      .lean();

    if (!question) {
      return res.status(404).json({
        success: false,
        error: { message: 'Question not found', code: 'QUESTION_NOT_FOUND' },
      });
    }

    res.json({
      success: true,
      data: question,
    });
  } catch (error: any) {
    logger.error('Get question error:', error);
    res.status(400).json({
      success: false,
      error: { message: error.message, code: 'GET_QUESTION_ERROR' },
    });
  }
};

// Create question
export const createQuestion = async (req: Request, res: Response) => {
  try {
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

    const question = new Question({
      question: questionText,
      questionHindi,
      options,
      optionsHindi,
      correctAnswer,
      explanation,
      explanationHindi,
      difficulty: difficulty || 'medium',
      subject,
      topic,
      tags: tags || [],
      source,
      year,
      examCategory: examCategory || 'OTHER',
      createdBy: req.user!.userId,
    });

    await question.save();

    logger.info(`Question created: ${question._id}`);

    res.status(201).json({
      success: true,
      data: question,
      message: 'Question created successfully',
    });
  } catch (error: any) {
    logger.error('Create question error:', error);
    res.status(400).json({
      success: false,
      error: { message: error.message, code: 'CREATE_QUESTION_ERROR' },
    });
  }
};

// Update question
export const updateQuestion = async (req: Request, res: Response) => {
  try {
    const { questionId } = req.params;
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
      isActive,
    } = req.body;

    const question = await Question.findByIdAndUpdate(
      questionId,
      {
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
        ...(typeof isActive === 'boolean' && { isActive }),
      },
      { new: true }
    );

    if (!question) {
      return res.status(404).json({
        success: false,
        error: { message: 'Question not found', code: 'QUESTION_NOT_FOUND' },
      });
    }

    logger.info(`Question updated: ${questionId}`);

    res.json({
      success: true,
      data: question,
      message: 'Question updated successfully',
    });
  } catch (error: any) {
    logger.error('Update question error:', error);
    res.status(400).json({
      success: false,
      error: { message: error.message, code: 'UPDATE_QUESTION_ERROR' },
    });
  }
};

// Delete question (soft delete - mark inactive)
export const deleteQuestion = async (req: Request, res: Response) => {
  try {
    const { questionId } = req.params;
    const { permanent } = req.query;

    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({
        success: false,
        error: { message: 'Question not found', code: 'QUESTION_NOT_FOUND' },
      });
    }

    // Check if question is used
    if (question.usedInQuizzes.length > 0 || question.usedInExams.length > 0) {
      if (permanent === 'true') {
        return res.status(400).json({
          success: false,
          error: { message: 'Cannot delete question used in quizzes/exams', code: 'QUESTION_IN_USE' },
        });
      }
      // Soft delete
      question.isActive = false;
      await question.save();

      logger.info(`Question soft deleted: ${questionId}`);

      return res.json({
        success: true,
        message: 'Question archived successfully (still in use)',
      });
    }

    // Permanent delete if not used
    await Question.findByIdAndDelete(questionId);

    logger.info(`Question permanently deleted: ${questionId}`);

    res.json({
      success: true,
      message: 'Question deleted successfully',
    });
  } catch (error: any) {
    logger.error('Delete question error:', error);
    res.status(400).json({
      success: false,
      error: { message: error.message, code: 'DELETE_QUESTION_ERROR' },
    });
  }
};

// Duplicate question
export const duplicateQuestion = async (req: Request, res: Response) => {
  try {
    const { questionId } = req.params;

    const original = await Question.findById(questionId);
    if (!original) {
      return res.status(404).json({
        success: false,
        error: { message: 'Question not found', code: 'QUESTION_NOT_FOUND' },
      });
    }

    const duplicate = new Question({
      question: original.question + ' (Copy)',
      questionHindi: original.questionHindi ? original.questionHindi + ' (Copy)' : undefined,
      options: original.options,
      optionsHindi: original.optionsHindi,
      correctAnswer: original.correctAnswer,
      explanation: original.explanation,
      explanationHindi: original.explanationHindi,
      difficulty: original.difficulty,
      subject: original.subject,
      topic: original.topic,
      tags: original.tags,
      source: original.source,
      year: original.year,
      examCategory: original.examCategory,
      createdBy: req.user!.userId,
    });

    await duplicate.save();

    logger.info(`Question duplicated: ${questionId} -> ${duplicate._id}`);

    res.status(201).json({
      success: true,
      data: duplicate,
      message: 'Question duplicated successfully',
    });
  } catch (error: any) {
    logger.error('Duplicate question error:', error);
    res.status(400).json({
      success: false,
      error: { message: error.message, code: 'DUPLICATE_QUESTION_ERROR' },
    });
  }
};

// Bulk import questions
export const bulkImportQuestions = async (req: Request, res: Response) => {
  try {
    const { questions, examCategory } = req.body;

    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({
        success: false,
        error: { message: 'Questions array required', code: 'INVALID_INPUT' },
      });
    }

    const results = {
      success: 0,
      failed: 0,
      errors: [] as { index: number; error: string }[],
    };

    for (let i = 0; i < questions.length; i++) {
      try {
        const q = questions[i];

        // Validate required fields
        if (!q.question || !q.options || !q.correctAnswer || !q.subject) {
          results.failed++;
          results.errors.push({
            index: i,
            error: 'Missing required fields (question, options, correctAnswer, subject)',
          });
          continue;
        }

        // Validate options
        if (!q.options.a || !q.options.b || !q.options.c || !q.options.d) {
          results.failed++;
          results.errors.push({
            index: i,
            error: 'All four options (a, b, c, d) are required',
          });
          continue;
        }

        // Validate correct answer
        if (!['a', 'b', 'c', 'd'].includes(q.correctAnswer)) {
          results.failed++;
          results.errors.push({
            index: i,
            error: 'Correct answer must be a, b, c, or d',
          });
          continue;
        }

        const question = new Question({
          question: q.question,
          questionHindi: q.questionHindi,
          options: q.options,
          optionsHindi: q.optionsHindi,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
          explanationHindi: q.explanationHindi,
          difficulty: q.difficulty || 'medium',
          subject: q.subject,
          topic: q.topic,
          tags: q.tags || [],
          source: q.source,
          year: q.year,
          examCategory: q.examCategory || examCategory || 'OTHER',
          createdBy: req.user!.userId,
        });

        await question.save();
        results.success++;
      } catch (error: any) {
        results.failed++;
        results.errors.push({
          index: i,
          error: error.message,
        });
      }
    }

    logger.info(`Bulk import: ${results.success} success, ${results.failed} failed`);

    res.json({
      success: true,
      data: results,
      message: `Imported ${results.success} questions, ${results.failed} failed`,
    });
  } catch (error: any) {
    logger.error('Bulk import error:', error);
    res.status(400).json({
      success: false,
      error: { message: error.message, code: 'BULK_IMPORT_ERROR' },
    });
  }
};

// Get import template
export const getImportTemplate = async (_req: Request, res: Response) => {
  try {
    const template = {
      columns: [
        'question',
        'questionHindi',
        'optionA',
        'optionAHindi',
        'optionB',
        'optionBHindi',
        'optionC',
        'optionCHindi',
        'optionD',
        'optionDHindi',
        'correctAnswer',
        'explanation',
        'explanationHindi',
        'difficulty',
        'subject',
        'topic',
        'tags',
        'source',
        'year',
      ],
      example: {
        question: 'What is the capital of India?',
        questionHindi: 'भारत की राजधानी क्या है?',
        optionA: 'Mumbai',
        optionAHindi: 'मुंबई',
        optionB: 'New Delhi',
        optionBHindi: 'नई दिल्ली',
        optionC: 'Kolkata',
        optionCHindi: 'कोलकाता',
        optionD: 'Chennai',
        optionDHindi: 'चेन्नई',
        correctAnswer: 'b',
        explanation: 'New Delhi is the capital of India.',
        explanationHindi: 'नई दिल्ली भारत की राजधानी है।',
        difficulty: 'easy',
        subject: 'Geography',
        topic: 'Indian Geography',
        tags: 'capital,india,basics',
        source: 'General Knowledge',
        year: '2024',
      },
      notes: [
        'correctAnswer must be a, b, c, or d (lowercase)',
        'difficulty must be easy, medium, or hard',
        'tags should be comma-separated',
        'Hindi fields are optional',
        'All option fields (A, B, C, D) are required',
      ],
    };

    res.json({
      success: true,
      data: template,
    });
  } catch (error: any) {
    logger.error('Get template error:', error);
    res.status(400).json({
      success: false,
      error: { message: error.message, code: 'GET_TEMPLATE_ERROR' },
    });
  }
};

// Get question stats
export const getQuestionStats = async (_req: Request, res: Response) => {
  try {
    const [
      totalQuestions,
      activeQuestions,
      byDifficulty,
      bySubject,
      byExamCategory,
      usedQuestions,
    ] = await Promise.all([
      Question.countDocuments(),
      Question.countDocuments({ isActive: true }),
      Question.aggregate([
        { $group: { _id: '$difficulty', count: { $sum: 1 } } },
      ]),
      Question.aggregate([
        { $group: { _id: '$subject', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
      Question.aggregate([
        { $group: { _id: '$examCategory', count: { $sum: 1 } } },
      ]),
      Question.countDocuments({ 'usedInQuizzes.0': { $exists: true } }),
    ]);

    res.json({
      success: true,
      data: {
        total: totalQuestions,
        active: activeQuestions,
        used: usedQuestions,
        unused: totalQuestions - usedQuestions,
        byDifficulty: byDifficulty.reduce((acc, curr) => {
          acc[curr._id] = curr.count;
          return acc;
        }, {} as Record<string, number>),
        bySubject,
        byExamCategory: byExamCategory.reduce((acc, curr) => {
          acc[curr._id] = curr.count;
          return acc;
        }, {} as Record<string, number>),
      },
    });
  } catch (error: any) {
    logger.error('Get question stats error:', error);
    res.status(400).json({
      success: false,
      error: { message: error.message, code: 'GET_STATS_ERROR' },
    });
  }
};

export default {
  listQuestions,
  getQuestion,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  duplicateQuestion,
  bulkImportQuestions,
  getImportTemplate,
  getQuestionStats,
};
