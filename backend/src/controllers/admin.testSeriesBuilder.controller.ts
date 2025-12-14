import { Request, Response } from 'express';
import mongoose, { Types } from 'mongoose';
import TestSeries from '../models/TestSeries';
import Exam from '../models/Exam';
import Question from '../models/Question';
import ComprehensionPassage from '../models/ComprehensionPassage';
import { uploadThumbnail, deleteFromR2 } from '../services/upload.service';
import logger from '../utils/logger';
import {
  createExamSchema,
  updateExamSchema,
  createExamSectionSchema,
  updateExamSectionSchema,
  createQuestionSchema,
  updateQuestionSchema,
  createComprehensionPassageSchema,
  updateComprehensionPassageSchema,
  reorderSchema,
  addQuestionsSchema,
  reorderQuestionsSchema,
  listQuestionsQuerySchema,
} from '../validators/testSeriesBuilder.validator';

// ==================== TEST SERIES BUILDER LIST ====================

// Get test series for builder (with exam stats)
export const getTestSeriesForBuilder = async (req: Request, res: Response) => {
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

    const total = await TestSeries.countDocuments(filter);

    const testSeriesList = await TestSeries.find(filter)
      .sort({ updatedAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .select('title slug thumbnail isPublished examCategory totalExams freeExams createdAt updatedAt')
      .lean();

    // Get exam stats for each test series
    const testSeriesWithStats = await Promise.all(
      testSeriesList.map(async (series) => {
        const [examCount, publishedExamCount, totalQuestions] = await Promise.all([
          Exam.countDocuments({ testSeries: series._id }),
          Exam.countDocuments({ testSeries: series._id, isPublished: true }),
          Exam.aggregate([
            { $match: { testSeries: new Types.ObjectId(series._id) } },
            { $group: { _id: null, total: { $sum: '$totalQuestions' } } },
          ]),
        ]);

        return {
          ...series,
          stats: {
            totalExams: examCount,
            publishedExams: publishedExamCount,
            totalQuestions: totalQuestions[0]?.total || 0,
          },
        };
      })
    );

    res.json({
      success: true,
      data: {
        testSeries: testSeriesWithStats,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages: Math.ceil(total / Number(limit)),
        },
      },
    });
  } catch (error: any) {
    logger.error('Get test series for builder error:', error);
    res.status(400).json({
      success: false,
      error: { message: error.message, code: 'GET_TEST_SERIES_ERROR' },
    });
  }
};

// Get test series with full structure for builder
export const getTestSeriesStructure = async (req: Request, res: Response) => {
  try {
    const { testSeriesId } = req.params;

    const testSeries = await TestSeries.findById(testSeriesId)
      .select('title slug thumbnail isPublished examCategory language')
      .lean();

    if (!testSeries) {
      return res.status(404).json({
        success: false,
        error: { message: 'Test series not found', code: 'TEST_SERIES_NOT_FOUND' },
      });
    }

    // Get exams with sections
    const exams = await Exam.find({ testSeries: testSeriesId })
      .sort({ order: 1 })
      .select('title titleHi order description duration totalQuestions totalMarks defaultPositiveMarks defaultNegativeMarks passingPercentage isFree isPublished sections')
      .lean();

    res.json({
      success: true,
      data: {
        testSeries,
        exams,
      },
    });
  } catch (error: any) {
    logger.error('Get test series structure error:', error);
    res.status(400).json({
      success: false,
      error: { message: error.message, code: 'GET_TEST_SERIES_STRUCTURE_ERROR' },
    });
  }
};

// ==================== EXAM CRUD ====================

// List exams for a test series
export const listExams = async (req: Request, res: Response) => {
  try {
    const { testSeriesId } = req.params;

    const exams = await Exam.find({ testSeries: testSeriesId })
      .sort({ order: 1 })
      .lean();

    res.json({
      success: true,
      data: { exams },
    });
  } catch (error: any) {
    logger.error('List exams error:', error);
    res.status(400).json({
      success: false,
      error: { message: error.message, code: 'LIST_EXAMS_ERROR' },
    });
  }
};

// Create exam
export const createExam = async (req: Request, res: Response) => {
  try {
    const { testSeriesId } = req.params;
    const validatedData = createExamSchema.parse(req.body);

    // Get next order
    const lastExam = await Exam.findOne({ testSeries: testSeriesId })
      .sort({ order: -1 })
      .select('order');
    const nextOrder = lastExam ? lastExam.order + 1 : 0;

    const exam = new Exam({
      ...validatedData,
      testSeries: testSeriesId,
      order: validatedData.order ?? nextOrder,
    });

    await exam.save();

    // Update test series exam count
    await TestSeries.findByIdAndUpdate(testSeriesId, {
      $inc: { totalExams: 1 },
    });

    res.status(201).json({
      success: true,
      data: { exam },
    });
  } catch (error: any) {
    logger.error('Create exam error:', error);
    res.status(400).json({
      success: false,
      error: { message: error.message, code: 'CREATE_EXAM_ERROR' },
    });
  }
};

// Get exam
export const getExam = async (req: Request, res: Response) => {
  try {
    const { examId } = req.params;

    const exam = await Exam.findById(examId)
      .populate({
        path: 'sections.questions',
        select: 'question questionHindi questionType imageUrl options correctAnswers difficulty subject',
      })
      .lean();

    if (!exam) {
      return res.status(404).json({
        success: false,
        error: { message: 'Exam not found', code: 'EXAM_NOT_FOUND' },
      });
    }

    res.json({
      success: true,
      data: { exam },
    });
  } catch (error: any) {
    logger.error('Get exam error:', error);
    res.status(400).json({
      success: false,
      error: { message: error.message, code: 'GET_EXAM_ERROR' },
    });
  }
};

// Get full exam with populated questions (for exam editor)
export const getExamFull = async (req: Request, res: Response) => {
  try {
    const { examId } = req.params;

    const exam = await Exam.findById(examId)
      .populate('testSeries', 'title slug')
      .lean();

    if (!exam) {
      return res.status(404).json({
        success: false,
        error: { message: 'Exam not found', code: 'EXAM_NOT_FOUND' },
      });
    }

    // Populate questions for each section
    const sectionsWithQuestions = await Promise.all(
      exam.sections.map(async (section) => {
        const questions = await Question.find({ _id: { $in: section.questions } })
          .select('question questionHindi questionType imageUrl options correctAnswers difficulty subject topic examCategory')
          .lean();

        // Sort by order in section
        const orderedQuestions = section.questions.map(qId =>
          questions.find(q => q._id.toString() === qId.toString())
        ).filter(Boolean);

        return {
          ...section,
          questions: orderedQuestions,
        };
      })
    );

    res.json({
      success: true,
      data: {
        ...exam,
        sections: sectionsWithQuestions,
      },
    });
  } catch (error: any) {
    logger.error('Get full exam error:', error);
    res.status(400).json({
      success: false,
      error: { message: error.message, code: 'GET_EXAM_FULL_ERROR' },
    });
  }
};

// Update exam
export const updateExam = async (req: Request, res: Response) => {
  try {
    const { examId } = req.params;
    const validatedData = updateExamSchema.parse(req.body);

    const exam = await Exam.findByIdAndUpdate(
      examId,
      { $set: validatedData },
      { new: true }
    );

    if (!exam) {
      return res.status(404).json({
        success: false,
        error: { message: 'Exam not found', code: 'EXAM_NOT_FOUND' },
      });
    }

    res.json({
      success: true,
      data: { exam },
    });
  } catch (error: any) {
    logger.error('Update exam error:', error);
    res.status(400).json({
      success: false,
      error: { message: error.message, code: 'UPDATE_EXAM_ERROR' },
    });
  }
};

// Delete exam
export const deleteExam = async (req: Request, res: Response) => {
  try {
    const { examId } = req.params;

    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.status(404).json({
        success: false,
        error: { message: 'Exam not found', code: 'EXAM_NOT_FOUND' },
      });
    }

    // Remove exam reference from questions
    const allQuestionIds = exam.sections.flatMap(s => s.questions);
    await Question.updateMany(
      { _id: { $in: allQuestionIds } },
      { $pull: { usedInExams: examId } }
    );

    await exam.deleteOne();

    // Update test series exam count
    await TestSeries.findByIdAndUpdate(exam.testSeries, {
      $inc: { totalExams: -1 },
    });

    res.json({
      success: true,
      data: { message: 'Exam deleted successfully' },
    });
  } catch (error: any) {
    logger.error('Delete exam error:', error);
    res.status(400).json({
      success: false,
      error: { message: error.message, code: 'DELETE_EXAM_ERROR' },
    });
  }
};

// Reorder exam
export const reorderExam = async (req: Request, res: Response) => {
  try {
    const { examId } = req.params;
    const { order } = reorderSchema.parse(req.body);

    const exam = await Exam.findByIdAndUpdate(
      examId,
      { $set: { order } },
      { new: true }
    );

    if (!exam) {
      return res.status(404).json({
        success: false,
        error: { message: 'Exam not found', code: 'EXAM_NOT_FOUND' },
      });
    }

    res.json({
      success: true,
      data: { exam },
    });
  } catch (error: any) {
    logger.error('Reorder exam error:', error);
    res.status(400).json({
      success: false,
      error: { message: error.message, code: 'REORDER_EXAM_ERROR' },
    });
  }
};

// Toggle exam publish status
export const toggleExamPublish = async (req: Request, res: Response) => {
  try {
    const { examId } = req.params;

    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.status(404).json({
        success: false,
        error: { message: 'Exam not found', code: 'EXAM_NOT_FOUND' },
      });
    }

    exam.isPublished = !exam.isPublished;
    await exam.save();

    res.json({
      success: true,
      data: { exam },
    });
  } catch (error: any) {
    logger.error('Toggle exam publish error:', error);
    res.status(400).json({
      success: false,
      error: { message: error.message, code: 'TOGGLE_PUBLISH_ERROR' },
    });
  }
};

// ==================== SECTION CRUD ====================

// List sections for an exam
export const listSections = async (req: Request, res: Response) => {
  try {
    const { examId } = req.params;

    const exam = await Exam.findById(examId)
      .select('sections')
      .lean();

    if (!exam) {
      return res.status(404).json({
        success: false,
        error: { message: 'Exam not found', code: 'EXAM_NOT_FOUND' },
      });
    }

    res.json({
      success: true,
      data: { sections: exam.sections },
    });
  } catch (error: any) {
    logger.error('List sections error:', error);
    res.status(400).json({
      success: false,
      error: { message: error.message, code: 'LIST_SECTIONS_ERROR' },
    });
  }
};

// Create section
export const createSection = async (req: Request, res: Response) => {
  try {
    const { examId } = req.params;
    const validatedData = createExamSectionSchema.parse(req.body);

    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.status(404).json({
        success: false,
        error: { message: 'Exam not found', code: 'EXAM_NOT_FOUND' },
      });
    }

    // Get next order
    const nextOrder = exam.sections.length > 0
      ? Math.max(...exam.sections.map(s => s.order)) + 1
      : 0;

    const newSection = {
      _id: new Types.ObjectId(),
      ...validatedData,
      order: validatedData.order ?? nextOrder,
      questions: [],
    };

    exam.sections.push(newSection as any);
    await exam.save();

    res.status(201).json({
      success: true,
      data: { section: newSection },
    });
  } catch (error: any) {
    logger.error('Create section error:', error);
    res.status(400).json({
      success: false,
      error: { message: error.message, code: 'CREATE_SECTION_ERROR' },
    });
  }
};

// Update section
export const updateSection = async (req: Request, res: Response) => {
  try {
    const { examId, sectionId } = req.params;
    const validatedData = updateExamSectionSchema.parse(req.body);

    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.status(404).json({
        success: false,
        error: { message: 'Exam not found', code: 'EXAM_NOT_FOUND' },
      });
    }

    const sectionIndex = exam.sections.findIndex(
      s => s._id.toString() === sectionId
    );

    if (sectionIndex === -1) {
      return res.status(404).json({
        success: false,
        error: { message: 'Section not found', code: 'SECTION_NOT_FOUND' },
      });
    }

    // Update section fields
    Object.assign(exam.sections[sectionIndex], validatedData);
    await exam.save();

    res.json({
      success: true,
      data: { section: exam.sections[sectionIndex] },
    });
  } catch (error: any) {
    logger.error('Update section error:', error);
    res.status(400).json({
      success: false,
      error: { message: error.message, code: 'UPDATE_SECTION_ERROR' },
    });
  }
};

// Delete section
export const deleteSection = async (req: Request, res: Response) => {
  try {
    const { examId, sectionId } = req.params;

    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.status(404).json({
        success: false,
        error: { message: 'Exam not found', code: 'EXAM_NOT_FOUND' },
      });
    }

    const sectionIndex = exam.sections.findIndex(
      s => s._id.toString() === sectionId
    );

    if (sectionIndex === -1) {
      return res.status(404).json({
        success: false,
        error: { message: 'Section not found', code: 'SECTION_NOT_FOUND' },
      });
    }

    // Remove section reference from questions
    const questionIds = exam.sections[sectionIndex].questions;
    await Question.updateMany(
      { _id: { $in: questionIds } },
      { $pull: { usedInExams: examId } }
    );

    exam.sections.splice(sectionIndex, 1);
    await exam.save();

    res.json({
      success: true,
      data: { message: 'Section deleted successfully' },
    });
  } catch (error: any) {
    logger.error('Delete section error:', error);
    res.status(400).json({
      success: false,
      error: { message: error.message, code: 'DELETE_SECTION_ERROR' },
    });
  }
};

// Reorder section
export const reorderSection = async (req: Request, res: Response) => {
  try {
    const { examId, sectionId } = req.params;
    const { order } = reorderSchema.parse(req.body);

    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.status(404).json({
        success: false,
        error: { message: 'Exam not found', code: 'EXAM_NOT_FOUND' },
      });
    }

    const sectionIndex = exam.sections.findIndex(
      s => s._id.toString() === sectionId
    );

    if (sectionIndex === -1) {
      return res.status(404).json({
        success: false,
        error: { message: 'Section not found', code: 'SECTION_NOT_FOUND' },
      });
    }

    exam.sections[sectionIndex].order = order;
    await exam.save();

    res.json({
      success: true,
      data: { section: exam.sections[sectionIndex] },
    });
  } catch (error: any) {
    logger.error('Reorder section error:', error);
    res.status(400).json({
      success: false,
      error: { message: error.message, code: 'REORDER_SECTION_ERROR' },
    });
  }
};

// ==================== SECTION QUESTIONS ====================

// Get section questions
export const getSectionQuestions = async (req: Request, res: Response) => {
  try {
    const { examId, sectionId } = req.params;

    const exam = await Exam.findById(examId).lean();
    if (!exam) {
      return res.status(404).json({
        success: false,
        error: { message: 'Exam not found', code: 'EXAM_NOT_FOUND' },
      });
    }

    const section = exam.sections.find(s => s._id.toString() === sectionId);
    if (!section) {
      return res.status(404).json({
        success: false,
        error: { message: 'Section not found', code: 'SECTION_NOT_FOUND' },
      });
    }

    const questions = await Question.find({ _id: { $in: section.questions } })
      .select('question questionHindi questionType imageUrl options correctAnswers difficulty subject topic')
      .lean();

    // Sort by order in section
    const orderedQuestions = section.questions.map(qId =>
      questions.find(q => q._id.toString() === qId.toString())
    ).filter(Boolean);

    res.json({
      success: true,
      data: { questions: orderedQuestions },
    });
  } catch (error: any) {
    logger.error('Get section questions error:', error);
    res.status(400).json({
      success: false,
      error: { message: error.message, code: 'GET_SECTION_QUESTIONS_ERROR' },
    });
  }
};

// Add question to section
export const addQuestionToSection = async (req: Request, res: Response) => {
  try {
    const { examId, sectionId } = req.params;
    const { questionId } = req.body;

    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.status(404).json({
        success: false,
        error: { message: 'Exam not found', code: 'EXAM_NOT_FOUND' },
      });
    }

    const sectionIndex = exam.sections.findIndex(
      s => s._id.toString() === sectionId
    );

    if (sectionIndex === -1) {
      return res.status(404).json({
        success: false,
        error: { message: 'Section not found', code: 'SECTION_NOT_FOUND' },
      });
    }

    // Check if question exists
    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({
        success: false,
        error: { message: 'Question not found', code: 'QUESTION_NOT_FOUND' },
      });
    }

    // Add question to section
    exam.sections[sectionIndex].questions.push(new Types.ObjectId(questionId));
    await exam.save();

    // Update question usedInExams
    await Question.findByIdAndUpdate(questionId, {
      $addToSet: { usedInExams: examId },
    });

    res.json({
      success: true,
      data: { message: 'Question added to section' },
    });
  } catch (error: any) {
    logger.error('Add question to section error:', error);
    res.status(400).json({
      success: false,
      error: { message: error.message, code: 'ADD_QUESTION_ERROR' },
    });
  }
};

// Bulk add questions to section
export const bulkAddQuestionsToSection = async (req: Request, res: Response) => {
  try {
    const { examId, sectionId } = req.params;
    const { questionIds } = addQuestionsSchema.parse(req.body);

    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.status(404).json({
        success: false,
        error: { message: 'Exam not found', code: 'EXAM_NOT_FOUND' },
      });
    }

    const sectionIndex = exam.sections.findIndex(
      s => s._id.toString() === sectionId
    );

    if (sectionIndex === -1) {
      return res.status(404).json({
        success: false,
        error: { message: 'Section not found', code: 'SECTION_NOT_FOUND' },
      });
    }

    // Verify all questions exist
    const questions = await Question.find({ _id: { $in: questionIds } });
    if (questions.length !== questionIds.length) {
      return res.status(400).json({
        success: false,
        error: { message: 'Some questions not found', code: 'QUESTIONS_NOT_FOUND' },
      });
    }

    // Add questions to section (avoiding duplicates)
    const existingIds = exam.sections[sectionIndex].questions.map(q => q.toString());
    const newQuestionIds = questionIds.filter(id => !existingIds.includes(id));

    exam.sections[sectionIndex].questions.push(
      ...newQuestionIds.map(id => new Types.ObjectId(id))
    );
    await exam.save();

    // Update questions usedInExams
    await Question.updateMany(
      { _id: { $in: newQuestionIds } },
      { $addToSet: { usedInExams: examId } }
    );

    res.json({
      success: true,
      data: {
        message: `${newQuestionIds.length} questions added to section`,
        addedCount: newQuestionIds.length,
      },
    });
  } catch (error: any) {
    logger.error('Bulk add questions error:', error);
    res.status(400).json({
      success: false,
      error: { message: error.message, code: 'BULK_ADD_QUESTIONS_ERROR' },
    });
  }
};

// Remove question from section
export const removeQuestionFromSection = async (req: Request, res: Response) => {
  try {
    const { examId, sectionId, questionId } = req.params;

    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.status(404).json({
        success: false,
        error: { message: 'Exam not found', code: 'EXAM_NOT_FOUND' },
      });
    }

    const sectionIndex = exam.sections.findIndex(
      s => s._id.toString() === sectionId
    );

    if (sectionIndex === -1) {
      return res.status(404).json({
        success: false,
        error: { message: 'Section not found', code: 'SECTION_NOT_FOUND' },
      });
    }

    // Remove question from section
    exam.sections[sectionIndex].questions = exam.sections[sectionIndex].questions.filter(
      q => q.toString() !== questionId
    );
    await exam.save();

    // Update question usedInExams
    await Question.findByIdAndUpdate(questionId, {
      $pull: { usedInExams: examId },
    });

    res.json({
      success: true,
      data: { message: 'Question removed from section' },
    });
  } catch (error: any) {
    logger.error('Remove question from section error:', error);
    res.status(400).json({
      success: false,
      error: { message: error.message, code: 'REMOVE_QUESTION_ERROR' },
    });
  }
};

// Reorder section questions
export const reorderSectionQuestions = async (req: Request, res: Response) => {
  try {
    const { examId, sectionId } = req.params;
    const { questionIds } = reorderQuestionsSchema.parse(req.body);

    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.status(404).json({
        success: false,
        error: { message: 'Exam not found', code: 'EXAM_NOT_FOUND' },
      });
    }

    const sectionIndex = exam.sections.findIndex(
      s => s._id.toString() === sectionId
    );

    if (sectionIndex === -1) {
      return res.status(404).json({
        success: false,
        error: { message: 'Section not found', code: 'SECTION_NOT_FOUND' },
      });
    }

    // Update question order
    exam.sections[sectionIndex].questions = questionIds.map(id => new Types.ObjectId(id));
    await exam.save();

    res.json({
      success: true,
      data: { message: 'Questions reordered successfully' },
    });
  } catch (error: any) {
    logger.error('Reorder section questions error:', error);
    res.status(400).json({
      success: false,
      error: { message: error.message, code: 'REORDER_QUESTIONS_ERROR' },
    });
  }
};

// ==================== COMPREHENSION PASSAGES ====================

// List comprehension passages
export const listComprehensionPassages = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20, search, examCategory } = req.query;

    const filter: any = { isActive: true };

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { passage: { $regex: search, $options: 'i' } },
      ];
    }

    if (examCategory && examCategory !== 'all') {
      filter.examCategory = examCategory;
    }

    const total = await ComprehensionPassage.countDocuments(filter);

    const passages = await ComprehensionPassage.find(filter)
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .populate('questions', 'question questionHindi')
      .lean();

    res.json({
      success: true,
      data: {
        passages,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages: Math.ceil(total / Number(limit)),
        },
      },
    });
  } catch (error: any) {
    logger.error('List comprehension passages error:', error);
    res.status(400).json({
      success: false,
      error: { message: error.message, code: 'LIST_PASSAGES_ERROR' },
    });
  }
};

// Create comprehension passage
export const createComprehensionPassage = async (req: Request, res: Response) => {
  try {
    const validatedData = createComprehensionPassageSchema.parse(req.body);

    const passage = new ComprehensionPassage({
      ...validatedData,
      createdBy: req.user!.userId,
    });

    await passage.save();

    res.status(201).json({
      success: true,
      data: { passage },
    });
  } catch (error: any) {
    logger.error('Create comprehension passage error:', error);
    res.status(400).json({
      success: false,
      error: { message: error.message, code: 'CREATE_PASSAGE_ERROR' },
    });
  }
};

// Get comprehension passage
export const getComprehensionPassage = async (req: Request, res: Response) => {
  try {
    const { passageId } = req.params;

    const passage = await ComprehensionPassage.findById(passageId)
      .populate('questions')
      .lean();

    if (!passage) {
      return res.status(404).json({
        success: false,
        error: { message: 'Passage not found', code: 'PASSAGE_NOT_FOUND' },
      });
    }

    res.json({
      success: true,
      data: { passage },
    });
  } catch (error: any) {
    logger.error('Get comprehension passage error:', error);
    res.status(400).json({
      success: false,
      error: { message: error.message, code: 'GET_PASSAGE_ERROR' },
    });
  }
};

// Update comprehension passage
export const updateComprehensionPassage = async (req: Request, res: Response) => {
  try {
    const { passageId } = req.params;
    const validatedData = updateComprehensionPassageSchema.parse(req.body);

    const passage = await ComprehensionPassage.findByIdAndUpdate(
      passageId,
      { $set: validatedData },
      { new: true }
    );

    if (!passage) {
      return res.status(404).json({
        success: false,
        error: { message: 'Passage not found', code: 'PASSAGE_NOT_FOUND' },
      });
    }

    res.json({
      success: true,
      data: { passage },
    });
  } catch (error: any) {
    logger.error('Update comprehension passage error:', error);
    res.status(400).json({
      success: false,
      error: { message: error.message, code: 'UPDATE_PASSAGE_ERROR' },
    });
  }
};

// Delete comprehension passage
export const deleteComprehensionPassage = async (req: Request, res: Response) => {
  try {
    const { passageId } = req.params;

    const passage = await ComprehensionPassage.findById(passageId);
    if (!passage) {
      return res.status(404).json({
        success: false,
        error: { message: 'Passage not found', code: 'PASSAGE_NOT_FOUND' },
      });
    }

    // Remove comprehension reference from questions
    await Question.updateMany(
      { comprehensionPassage: passageId },
      { $unset: { comprehensionPassage: 1 } }
    );

    await passage.deleteOne();

    res.json({
      success: true,
      data: { message: 'Passage deleted successfully' },
    });
  } catch (error: any) {
    logger.error('Delete comprehension passage error:', error);
    res.status(400).json({
      success: false,
      error: { message: error.message, code: 'DELETE_PASSAGE_ERROR' },
    });
  }
};

// Add question to passage
export const addQuestionToPassage = async (req: Request, res: Response) => {
  try {
    const { passageId } = req.params;
    const { questionId } = req.body;

    const passage = await ComprehensionPassage.findById(passageId);
    if (!passage) {
      return res.status(404).json({
        success: false,
        error: { message: 'Passage not found', code: 'PASSAGE_NOT_FOUND' },
      });
    }

    // Update question with passage reference
    await Question.findByIdAndUpdate(questionId, {
      $set: {
        comprehensionPassage: passageId,
        questionType: 'comprehension',
      },
    });

    // Add question to passage
    await ComprehensionPassage.findByIdAndUpdate(passageId, {
      $addToSet: { questions: questionId },
    });

    res.json({
      success: true,
      data: { message: 'Question added to passage' },
    });
  } catch (error: any) {
    logger.error('Add question to passage error:', error);
    res.status(400).json({
      success: false,
      error: { message: error.message, code: 'ADD_QUESTION_TO_PASSAGE_ERROR' },
    });
  }
};

// Remove question from passage
export const removeQuestionFromPassage = async (req: Request, res: Response) => {
  try {
    const { passageId, questionId } = req.params;

    // Remove passage reference from question
    await Question.findByIdAndUpdate(questionId, {
      $unset: { comprehensionPassage: 1 },
      $set: { questionType: 'single' },
    });

    // Remove question from passage
    await ComprehensionPassage.findByIdAndUpdate(passageId, {
      $pull: { questions: questionId },
    });

    res.json({
      success: true,
      data: { message: 'Question removed from passage' },
    });
  } catch (error: any) {
    logger.error('Remove question from passage error:', error);
    res.status(400).json({
      success: false,
      error: { message: error.message, code: 'REMOVE_QUESTION_FROM_PASSAGE_ERROR' },
    });
  }
};

// ==================== QUESTION BANK ====================

// List questions
export const listQuestions = async (req: Request, res: Response) => {
  try {
    const validatedQuery = listQuestionsQuerySchema.parse(req.query);
    const { page, limit, search, subject, topic, difficulty, questionType, examCategory, isActive, unused, sortBy, sortOrder } = validatedQuery;

    const filter: any = {};

    if (search) {
      filter.$or = [
        { question: { $regex: search, $options: 'i' } },
        { questionHindi: { $regex: search, $options: 'i' } },
      ];
    }

    if (subject) filter.subject = subject;
    if (topic) filter.topic = topic;
    if (difficulty && difficulty !== 'all') filter.difficulty = difficulty;
    if (questionType && questionType !== 'all') filter.questionType = questionType;
    if (examCategory && examCategory !== 'all') filter.examCategory = examCategory;
    if (isActive !== undefined) filter.isActive = isActive;

    // Filter for unused questions
    if (unused) {
      filter.$and = [
        { $or: [{ usedInQuizzes: { $size: 0 } }, { usedInQuizzes: { $exists: false } }] },
        { $or: [{ usedInExams: { $size: 0 } }, { usedInExams: { $exists: false } }] },
      ];
    }

    const total = await Question.countDocuments(filter);

    const sort: any = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const questions = await Question.find(filter)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit)
      .select('question questionHindi questionType imageUrl options correctAnswers difficulty subject topic examCategory tags source year isActive usedInQuizzes usedInExams createdAt')
      .lean();

    res.json({
      success: true,
      data: {
        questions,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
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

// Create question
export const createQuestion = async (req: Request, res: Response) => {
  try {
    const validatedData = createQuestionSchema.parse(req.body);

    const question = new Question({
      ...validatedData,
      createdBy: req.user!.userId,
    });

    await question.save();

    res.status(201).json({
      success: true,
      data: { question },
    });
  } catch (error: any) {
    logger.error('Create question error:', error);
    res.status(400).json({
      success: false,
      error: { message: error.message, code: 'CREATE_QUESTION_ERROR' },
    });
  }
};

// Get question
export const getQuestion = async (req: Request, res: Response) => {
  try {
    const { questionId } = req.params;

    const question = await Question.findById(questionId)
      .populate('comprehensionPassage')
      .lean();

    if (!question) {
      return res.status(404).json({
        success: false,
        error: { message: 'Question not found', code: 'QUESTION_NOT_FOUND' },
      });
    }

    res.json({
      success: true,
      data: { question },
    });
  } catch (error: any) {
    logger.error('Get question error:', error);
    res.status(400).json({
      success: false,
      error: { message: error.message, code: 'GET_QUESTION_ERROR' },
    });
  }
};

// Update question
export const updateQuestion = async (req: Request, res: Response) => {
  try {
    const { questionId } = req.params;
    const validatedData = updateQuestionSchema.parse(req.body);

    const question = await Question.findByIdAndUpdate(
      questionId,
      { $set: validatedData },
      { new: true }
    );

    if (!question) {
      return res.status(404).json({
        success: false,
        error: { message: 'Question not found', code: 'QUESTION_NOT_FOUND' },
      });
    }

    res.json({
      success: true,
      data: { question },
    });
  } catch (error: any) {
    logger.error('Update question error:', error);
    res.status(400).json({
      success: false,
      error: { message: error.message, code: 'UPDATE_QUESTION_ERROR' },
    });
  }
};

// Delete question
export const deleteQuestion = async (req: Request, res: Response) => {
  try {
    const { questionId } = req.params;

    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({
        success: false,
        error: { message: 'Question not found', code: 'QUESTION_NOT_FOUND' },
      });
    }

    // Check if question is used in any quiz or exam
    if ((question.usedInQuizzes?.length ?? 0) > 0 || (question.usedInExams?.length ?? 0) > 0) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Cannot delete question that is used in quizzes or exams',
          code: 'QUESTION_IN_USE'
        },
      });
    }

    // Remove from comprehension passage if linked
    if (question.comprehensionPassage) {
      await ComprehensionPassage.findByIdAndUpdate(question.comprehensionPassage, {
        $pull: { questions: questionId },
      });
    }

    await question.deleteOne();

    res.json({
      success: true,
      data: { message: 'Question deleted successfully' },
    });
  } catch (error: any) {
    logger.error('Delete question error:', error);
    res.status(400).json({
      success: false,
      error: { message: error.message, code: 'DELETE_QUESTION_ERROR' },
    });
  }
};

// ==================== FILE UPLOADS ====================

// Upload question image
export const uploadQuestionImage = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: { message: 'No file uploaded', code: 'NO_FILE' },
      });
    }

    const result = await uploadThumbnail(req.file);

    res.json({
      success: true,
      data: {
        url: result.url,
        key: result.key,
      },
    });
  } catch (error: any) {
    logger.error('Upload question image error:', error);
    res.status(400).json({
      success: false,
      error: { message: error.message, code: 'UPLOAD_ERROR' },
    });
  }
};
