import { Request, Response } from 'express';
import Question from '../models/Question';
import logger from '../utils/logger';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';

// Helper: Transform question from DB format to frontend format
const transformQuestionForFrontend = (q: any) => {
  if (!q) return q;

  // Convert options object to array format
  const optionsArray = [
    { id: 'a', text: q.options?.a || '', textHi: q.optionsHindi?.a || '' },
    { id: 'b', text: q.options?.b || '', textHi: q.optionsHindi?.b || '' },
    { id: 'c', text: q.options?.c || '', textHi: q.optionsHindi?.c || '' },
    { id: 'd', text: q.options?.d || '', textHi: q.optionsHindi?.d || '' },
  ];

  return {
    _id: q._id,
    question: q.question,
    questionHi: q.questionHindi,
    options: optionsArray,
    correctOption: q.correctAnswer, // Map field name for frontend
    explanation: q.explanation,
    explanationHi: q.explanationHindi,
    difficulty: q.difficulty,
    subject: q.subject,
    topic: q.topic,
    tags: q.tags || [],
    source: q.source,
    year: q.year,
    examCategory: q.examCategory,
    isActive: q.isActive,
    usageCount: q.timesAnswered || 0, // Map field name for frontend
    correctCount: q.timesCorrect || 0,
    incorrectCount: (q.timesAnswered || 0) - (q.timesCorrect || 0),
    usedInQuizzes: q.usedInQuizzes,
    usedInExams: q.usedInExams,
    createdAt: q.createdAt,
    updatedAt: q.updatedAt,
  };
};

// Helper: Transform frontend format to DB format
const transformOptionsToDb = (options: any[]) => {
  if (!options || !Array.isArray(options)) return null;

  const optionsObj: any = {};
  const optionsHindiObj: any = {};

  options.forEach((opt) => {
    if (opt.id && ['a', 'b', 'c', 'd'].includes(opt.id)) {
      optionsObj[opt.id] = opt.text || '';
      if (opt.textHi) {
        optionsHindiObj[opt.id] = opt.textHi;
      }
    }
  });

  return { options: optionsObj, optionsHindi: optionsHindiObj };
};

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

    // Transform questions to frontend format
    const transformedQuestions = questions.map(transformQuestionForFrontend);

    res.json({
      success: true,
      data: {
        questions: transformedQuestions,
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

    // Transform to frontend format
    res.json({
      success: true,
      data: transformQuestionForFrontend(question),
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
      questionHi, // Frontend sends questionHi
      questionHindi, // Also accept questionHindi for backward compatibility
      options, // Frontend sends array format
      correctOption, // Frontend sends correctOption
      correctAnswer, // Also accept correctAnswer for backward compatibility
      explanation,
      explanationHi,
      explanationHindi,
      difficulty,
      subject,
      topic,
      tags,
      source,
      year,
      examCategory,
    } = req.body;

    // Transform options from array to object format if needed
    let optionsObj = options;
    let optionsHindiObj = null;

    if (Array.isArray(options)) {
      const transformed = transformOptionsToDb(options);
      if (transformed) {
        optionsObj = transformed.options;
        optionsHindiObj = transformed.optionsHindi;
      }
    }

    const question = new Question({
      question: questionText,
      questionHindi: questionHi || questionHindi,
      options: optionsObj,
      optionsHindi: optionsHindiObj,
      correctAnswer: correctOption || correctAnswer, // Accept both field names
      explanation,
      explanationHindi: explanationHi || explanationHindi,
      difficulty: difficulty || 'medium',
      subject: subject || 'General',
      topic,
      tags: tags || [],
      source,
      year,
      examCategory: examCategory || 'OTHER',
      createdBy: req.user!.userId,
    });

    await question.save();

    logger.info(`Question created: ${question._id}`);

    // Return transformed format for frontend
    res.status(201).json({
      success: true,
      data: transformQuestionForFrontend(question.toObject()),
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
      questionHi,
      questionHindi,
      options,
      correctOption,
      correctAnswer,
      explanation,
      explanationHi,
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

    // Transform options from array to object format if needed
    let optionsObj = options;
    let optionsHindiObj = undefined;

    if (Array.isArray(options)) {
      const transformed = transformOptionsToDb(options);
      if (transformed) {
        optionsObj = transformed.options;
        optionsHindiObj = transformed.optionsHindi;
      }
    }

    const updateData: any = {
      ...(questionText && { question: questionText }),
      ...((questionHi || questionHindi) && { questionHindi: questionHi || questionHindi }),
      ...(optionsObj && { options: optionsObj }),
      ...(optionsHindiObj && { optionsHindi: optionsHindiObj }),
      ...((correctOption || correctAnswer) && { correctAnswer: correctOption || correctAnswer }),
      ...(explanation && { explanation }),
      ...((explanationHi || explanationHindi) && { explanationHindi: explanationHi || explanationHindi }),
      ...(difficulty && { difficulty }),
      ...(subject && { subject }),
      ...(topic !== undefined && { topic }),
      ...(tags && { tags }),
      ...(source !== undefined && { source }),
      ...(year !== undefined && { year }),
      ...(examCategory && { examCategory }),
      ...(typeof isActive === 'boolean' && { isActive }),
    };

    const question = await Question.findByIdAndUpdate(
      questionId,
      updateData,
      { new: true }
    ).lean();

    if (!question) {
      return res.status(404).json({
        success: false,
        error: { message: 'Question not found', code: 'QUESTION_NOT_FOUND' },
      });
    }

    logger.info(`Question updated: ${questionId}`);

    // Return transformed format for frontend
    res.json({
      success: true,
      data: transformQuestionForFrontend(question),
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

// Bulk import questions (supports CSV, Excel files via multer)
export const bulkImportQuestions = async (req: Request, res: Response) => {
  try {
    const file = (req as any).file;
    const { examCategory } = req.body;

    let questions: any[] = [];

    // If file is uploaded, parse it
    if (file) {
      const fileName = file.originalname.toLowerCase();

      if (fileName.endsWith('.csv')) {
        // Parse CSV
        const csvContent = file.buffer.toString('utf-8');
        const parseResult = Papa.parse(csvContent, {
          header: true,
          skipEmptyLines: true,
          transformHeader: (h: string) => h.trim(),
        });
        questions = parseResult.data as any[];
      } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
        // Parse Excel
        const workbook = XLSX.read(file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        questions = XLSX.utils.sheet_to_json(sheet);
      } else {
        return res.status(400).json({
          success: false,
          error: { message: 'Unsupported file format. Use CSV or Excel (.xlsx, .xls)', code: 'INVALID_FILE_TYPE' },
        });
      }
    } else if (req.body.questions && Array.isArray(req.body.questions)) {
      // Accept JSON array directly (backward compatibility)
      questions = req.body.questions;
    } else {
      return res.status(400).json({
        success: false,
        error: { message: 'No file uploaded or questions array provided', code: 'INVALID_INPUT' },
      });
    }

    if (questions.length === 0) {
      return res.status(400).json({
        success: false,
        error: { message: 'No questions found in the file', code: 'EMPTY_FILE' },
      });
    }

    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[],
    };

    for (let i = 0; i < questions.length; i++) {
      try {
        const row = questions[i];

        // Map CSV/Excel columns to question format
        const questionText = row.question || row.Question;
        const questionHindi = row.questionHi || row.questionHindi || row.QuestionHindi;
        const correctAnswer = (row.correctAnswer || row.CorrectAnswer || row.correct_answer || '').toLowerCase();
        const subject = row.subject || row.Subject || 'General';

        // Get options - support both formats
        let options: any;
        let optionsHindi: any;

        if (row.optionA || row.OptionA) {
          // CSV format with optionA, optionB, etc.
          options = {
            a: row.optionA || row.OptionA || '',
            b: row.optionB || row.OptionB || '',
            c: row.optionC || row.OptionC || '',
            d: row.optionD || row.OptionD || '',
          };
          optionsHindi = {
            a: row.optionAHi || row.optionAHindi || row.OptionAHindi || '',
            b: row.optionBHi || row.optionBHindi || row.OptionBHindi || '',
            c: row.optionCHi || row.optionCHindi || row.OptionCHindi || '',
            d: row.optionDHi || row.optionDHindi || row.OptionDHindi || '',
          };
        } else if (row.options) {
          // Already in object format
          options = row.options;
          optionsHindi = row.optionsHindi;
        }

        // Validate required fields
        if (!questionText) {
          results.failed++;
          results.errors.push(`Row ${i + 2}: Missing question text`);
          continue;
        }

        if (!options?.a || !options?.b || !options?.c || !options?.d) {
          results.failed++;
          results.errors.push(`Row ${i + 2}: Missing options (a, b, c, d required)`);
          continue;
        }

        if (!['a', 'b', 'c', 'd'].includes(correctAnswer)) {
          results.failed++;
          results.errors.push(`Row ${i + 2}: Invalid correct answer "${correctAnswer}" (must be a, b, c, or d)`);
          continue;
        }

        // Parse tags
        const tagsRaw = row.tags || row.Tags || '';
        const tags = typeof tagsRaw === 'string'
          ? tagsRaw.split(',').map((t: string) => t.trim()).filter(Boolean)
          : (Array.isArray(tagsRaw) ? tagsRaw : []);

        const question = new Question({
          question: questionText,
          questionHindi,
          options,
          optionsHindi: optionsHindi?.a ? optionsHindi : undefined,
          correctAnswer,
          explanation: row.explanation || row.Explanation,
          explanationHindi: row.explanationHi || row.explanationHindi || row.ExplanationHindi,
          difficulty: (row.difficulty || row.Difficulty || 'medium').toLowerCase(),
          subject,
          topic: row.topic || row.Topic,
          tags,
          source: row.source || row.Source,
          year: row.year || row.Year ? parseInt(row.year || row.Year) : undefined,
          examCategory: row.examCategory || examCategory || 'OTHER',
          createdBy: req.user!.userId,
        });

        await question.save();
        results.success++;
      } catch (error: any) {
        results.failed++;
        results.errors.push(`Row ${i + 2}: ${error.message}`);
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

// Get import template - returns actual CSV file download
export const getImportTemplate = async (req: Request, res: Response) => {
  try {
    const format = (req.query.format as string) || 'csv';

    const headers = [
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
    ];

    const sampleRows = [
      {
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
      {
        question: 'Which planet is known as the Red Planet?',
        questionHindi: 'कौन सा ग्रह लाल ग्रह के रूप में जाना जाता है?',
        optionA: 'Venus',
        optionAHindi: 'शुक्र',
        optionB: 'Jupiter',
        optionBHindi: 'बृहस्पति',
        optionC: 'Mars',
        optionCHindi: 'मंगल',
        optionD: 'Saturn',
        optionDHindi: 'शनि',
        correctAnswer: 'c',
        explanation: 'Mars is called the Red Planet due to iron oxide on its surface.',
        explanationHindi: 'मंगल ग्रह को इसकी सतह पर आयरन ऑक्साइड के कारण लाल ग्रह कहा जाता है।',
        difficulty: 'medium',
        subject: 'Science',
        topic: 'Solar System',
        tags: 'planets,mars,space',
        source: 'Science Textbook',
        year: '2024',
      },
    ];

    if (format === 'xlsx') {
      // Generate Excel file
      const ws = XLSX.utils.json_to_sheet(sampleRows, { header: headers });
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Questions Template');

      // Add a notes sheet
      const notesData = [
        { Field: 'correctAnswer', Note: 'Must be a, b, c, or d (lowercase)' },
        { Field: 'difficulty', Note: 'Must be easy, medium, or hard' },
        { Field: 'tags', Note: 'Comma-separated values (e.g., "tag1,tag2,tag3")' },
        { Field: 'Hindi fields', Note: 'All Hindi fields are optional' },
        { Field: 'Options', Note: 'All four options (A, B, C, D) are required' },
      ];
      const notesSheet = XLSX.utils.json_to_sheet(notesData);
      XLSX.utils.book_append_sheet(wb, notesSheet, 'Instructions');

      const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=question-import-template.xlsx');
      res.send(buffer);
    } else {
      // Generate CSV file
      const csv = Papa.unparse(sampleRows, { columns: headers });

      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename=question-import-template.csv');
      // Add BOM for Excel to recognize UTF-8
      res.send('\ufeff' + csv);
    }
  } catch (error: any) {
    logger.error('Get template error:', error);
    res.status(400).json({
      success: false,
      error: { message: error.message, code: 'GET_TEMPLATE_ERROR' },
    });
  }
};

// Export questions to CSV or Excel
export const exportQuestions = async (req: Request, res: Response) => {
  try {
    const { format = 'csv', questionIds, subject, difficulty, examCategory } = req.body;

    // Build query based on filters or specific IDs
    const query: any = {};

    if (questionIds && Array.isArray(questionIds) && questionIds.length > 0) {
      query._id = { $in: questionIds };
    } else {
      // Apply filters if no specific IDs provided
      if (subject) query.subject = subject;
      if (difficulty) query.difficulty = difficulty;
      if (examCategory) query.examCategory = examCategory;
    }

    const questions = await Question.find(query).lean();

    if (questions.length === 0) {
      return res.status(404).json({
        success: false,
        error: { message: 'No questions found to export', code: 'NO_QUESTIONS' },
      });
    }

    // Transform questions to export format
    const exportRows = questions.map((q: any) => ({
      question: q.question,
      questionHindi: q.questionHindi || '',
      optionA: q.options?.a || '',
      optionAHindi: q.optionsHindi?.a || '',
      optionB: q.options?.b || '',
      optionBHindi: q.optionsHindi?.b || '',
      optionC: q.options?.c || '',
      optionCHindi: q.optionsHindi?.c || '',
      optionD: q.options?.d || '',
      optionDHindi: q.optionsHindi?.d || '',
      correctAnswer: q.correctAnswer,
      explanation: q.explanation || '',
      explanationHindi: q.explanationHindi || '',
      difficulty: q.difficulty || 'medium',
      subject: q.subject || '',
      topic: q.topic || '',
      tags: Array.isArray(q.tags) ? q.tags.join(',') : '',
      source: q.source || '',
      year: q.year || '',
    }));

    const timestamp = new Date().toISOString().split('T')[0];

    if (format === 'xlsx') {
      // Generate Excel file
      const ws = XLSX.utils.json_to_sheet(exportRows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Questions');

      const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=questions-export-${timestamp}.xlsx`);
      res.send(buffer);
    } else {
      // Generate CSV file
      const csv = Papa.unparse(exportRows);

      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename=questions-export-${timestamp}.csv`);
      // Add BOM for Excel to recognize UTF-8
      res.send('\ufeff' + csv);
    }

    logger.info(`Exported ${questions.length} questions as ${format}`);
  } catch (error: any) {
    logger.error('Export questions error:', error);
    res.status(400).json({
      success: false,
      error: { message: error.message, code: 'EXPORT_ERROR' },
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
  exportQuestions,
  getQuestionStats,
};
