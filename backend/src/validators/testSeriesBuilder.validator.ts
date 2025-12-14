import { z } from 'zod';
import { examCategories } from './course.validator';

// Question option schema
const optionSchema = z.object({
  id: z.string().min(1, 'Option ID is required'),
  text: z.string().min(1, 'Option text is required'),
  textHi: z.string().optional(),
});

// Question types
export const questionTypes = ['single', 'multiple', 'comprehension'] as const;
export type QuestionType = typeof questionTypes[number];

// Difficulty levels
export const difficultyLevels = ['easy', 'medium', 'hard'] as const;

// Multiple correct algorithms
export const multipleCorrectAlgorithms = ['partial', 'all_or_none', 'proportional'] as const;

// Base question schema (without refinement)
const baseQuestionSchema = z.object({
  questionType: z.enum(questionTypes).default('single'),
  question: z.string().min(1, 'Question text is required'),
  questionHindi: z.string().optional(),
  imageUrl: z.string().url().optional().or(z.literal('')),
  comprehensionPassage: z.string().optional(), // ObjectId as string
  options: z
    .array(optionSchema)
    .min(2, 'At least 2 options are required')
    .max(10, 'Maximum 10 options allowed'),
  correctAnswers: z
    .array(z.string())
    .min(1, 'At least one correct answer is required'),
  explanation: z.string().optional(),
  explanationHindi: z.string().optional(),
  subject: z.string().min(1, 'Subject is required'),
  topic: z.string().optional(),
  difficulty: z.enum(difficultyLevels).default('medium'),
  examCategory: z.enum(examCategories, {
    errorMap: () => ({ message: 'Invalid exam category' }),
  }),
  tags: z.array(z.string().max(50)).max(20).optional().default([]),
  source: z.string().max(100).optional(),
  year: z.number().min(1900).max(2100).optional(),
});

// Create question schema (with refinement)
export const createQuestionSchema = baseQuestionSchema.refine((data) => {
  // Validate correctAnswers based on questionType
  if (data.questionType === 'single' && data.correctAnswers.length !== 1) {
    return false;
  }
  // Validate all correctAnswers are valid option IDs
  const optionIds = data.options.map(o => o.id);
  return data.correctAnswers.every(ca => optionIds.includes(ca));
}, {
  message: 'Invalid correct answers for question type or option IDs',
});

// Update question schema (partial from base schema)
export const updateQuestionSchema = baseQuestionSchema.partial();

// Create comprehension passage schema
export const createComprehensionPassageSchema = z.object({
  title: z.string().min(1, 'Title is required').max(500),
  titleHi: z.string().max(500).optional(),
  passage: z.string().min(1, 'Passage content is required'),
  passageHi: z.string().optional(),
  imageUrl: z.string().url().optional().or(z.literal('')),
  examCategory: z.enum(examCategories, {
    errorMap: () => ({ message: 'Invalid exam category' }),
  }),
  subject: z.string().optional(),
  topic: z.string().optional(),
  tags: z.array(z.string().max(50)).max(20).optional().default([]),
});

// Update comprehension passage schema
export const updateComprehensionPassageSchema = createComprehensionPassageSchema.partial();

// Create exam section schema
export const createExamSectionSchema = z.object({
  title: z.string().min(1, 'Section title is required').max(200),
  titleHi: z.string().max(200).optional(),
  instructions: z.string().optional(),
  instructionsHi: z.string().optional(),
  order: z.number().min(0).optional(),
});

// Update exam section schema
export const updateExamSectionSchema = createExamSectionSchema.partial();

// Create exam schema
export const createExamSchema = z.object({
  title: z.string().min(1, 'Exam title is required').max(200),
  titleHi: z.string().max(200).optional(),
  description: z.string().max(5000).optional(),
  descriptionHi: z.string().max(5000).optional(),
  duration: z.number().min(1, 'Duration must be at least 1 minute').default(120),
  defaultPositiveMarks: z.number().min(0).default(4),
  defaultNegativeMarks: z.number().min(0).default(1),
  passingPercentage: z.number().min(0).max(100).default(40),
  multipleCorrectAlgorithm: z.enum(multipleCorrectAlgorithms).default('all_or_none'),
  allowSectionNavigation: z.boolean().default(true),
  showSectionWiseResult: z.boolean().default(true),
  shuffleQuestions: z.boolean().default(false),
  shuffleOptions: z.boolean().default(false),
  isFree: z.boolean().default(false),
  isPublished: z.boolean().default(false),
  order: z.number().min(0).optional(),
});

// Update exam schema
export const updateExamSchema = createExamSchema.partial();

// Reorder schema
export const reorderSchema = z.object({
  order: z.number().min(0, 'Order must be a non-negative number'),
});

// Add questions to section schema
export const addQuestionsSchema = z.object({
  questionIds: z.array(z.string()).min(1, 'At least one question ID is required'),
});

// Bulk add questions schema
export const bulkAddQuestionsSchema = z.object({
  questionIds: z.array(z.string()).min(1, 'At least one question ID is required'),
});

// Reorder questions schema
export const reorderQuestionsSchema = z.object({
  questionIds: z.array(z.string()).min(1, 'Question IDs are required'),
});

// Query params for listing questions
export const listQuestionsQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  search: z.string().optional(),
  subject: z.string().optional(),
  topic: z.string().optional(),
  difficulty: z.enum([...difficultyLevels, 'all']).optional(),
  questionType: z.enum([...questionTypes, 'all']).optional(),
  examCategory: z.enum([...examCategories, 'all']).optional(),
  isActive: z.coerce.boolean().optional(),
  unused: z.coerce.boolean().optional(), // Filter for questions not used in any quiz/exam
  sortBy: z.enum(['createdAt', 'subject', 'difficulty', 'timesAnswered']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// Start exam attempt schema
export const startExamAttemptSchema = z.object({
  language: z.enum(['en', 'hi']).default('en'),
});

// Save answer schema
export const saveAnswerSchema = z.object({
  questionId: z.string().min(1, 'Question ID is required'),
  selectedOptions: z.array(z.string()).default([]),
  timeTaken: z.number().min(0).optional(),
});

// Mark for review schema
export const markForReviewSchema = z.object({
  questionId: z.string().min(1, 'Question ID is required'),
  markedForReview: z.boolean(),
});

// Navigate schema
export const navigateSchema = z.object({
  sectionIndex: z.number().min(0),
  questionIndex: z.number().min(0),
});

// Heartbeat schema
export const heartbeatSchema = z.object({
  currentSectionIndex: z.number().min(0).optional(),
  currentQuestionIndex: z.number().min(0).optional(),
  timeRemaining: z.number().min(0).optional(),
});

// Export types
export type CreateQuestionInput = z.infer<typeof createQuestionSchema>;
export type UpdateQuestionInput = z.infer<typeof updateQuestionSchema>;
export type CreateComprehensionPassageInput = z.infer<typeof createComprehensionPassageSchema>;
export type UpdateComprehensionPassageInput = z.infer<typeof updateComprehensionPassageSchema>;
export type CreateExamSectionInput = z.infer<typeof createExamSectionSchema>;
export type UpdateExamSectionInput = z.infer<typeof updateExamSectionSchema>;
export type CreateExamInput = z.infer<typeof createExamSchema>;
export type UpdateExamInput = z.infer<typeof updateExamSchema>;
export type ListQuestionsQuery = z.infer<typeof listQuestionsQuerySchema>;
export type StartExamAttemptInput = z.infer<typeof startExamAttemptSchema>;
export type SaveAnswerInput = z.infer<typeof saveAnswerSchema>;
export type MarkForReviewInput = z.infer<typeof markForReviewSchema>;
export type NavigateInput = z.infer<typeof navigateSchema>;
export type HeartbeatInput = z.infer<typeof heartbeatSchema>;
