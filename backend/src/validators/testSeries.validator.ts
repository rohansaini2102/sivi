import { z } from 'zod';
import { examCategories, languages } from './course.validator';

// Create test series schema
export const createTestSeriesSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title must be less than 200 characters'),
  description: z
    .string()
    .min(1, 'Description is required')
    .max(10000, 'Description must be less than 10000 characters'),
  shortDescription: z
    .string()
    .max(500, 'Short description must be less than 500 characters')
    .optional(),
  examCategory: z.enum(examCategories, {
    errorMap: () => ({ message: 'Invalid exam category' }),
  }),
  price: z
    .number()
    .min(0, 'Price must be a positive number'),
  discountPrice: z
    .number()
    .min(0, 'Discount price must be a positive number')
    .optional()
    .nullable(),
  validityDays: z
    .number()
    .min(1, 'Validity must be at least 1 day')
    .default(180),
  language: z.enum(languages).default('both'),
  totalExams: z
    .number()
    .min(0, 'Total exams must be a positive number')
    .default(0),
  freeExams: z
    .number()
    .min(0, 'Free exams must be a positive number')
    .default(0),
  features: z
    .array(z.string().max(200))
    .max(20, 'Maximum 20 features allowed')
    .optional()
    .default([]),
  isFree: z.boolean().default(false),
  isPublished: z.boolean().default(false),
  isFeatured: z.boolean().default(false),
  thumbnailUrl: z.string().url().optional().or(z.literal('')),
});

// Update test series schema (all fields optional)
export const updateTestSeriesSchema = createTestSeriesSchema.partial();

// Query params schema for listing test series
export const listTestSeriesQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  search: z.string().optional(),
  category: z.enum([...examCategories, 'all']).optional(),
  isPublished: z.coerce.boolean().optional(),
  isFeatured: z.coerce.boolean().optional(),
  sortBy: z.enum(['createdAt', 'title', 'price', 'enrollmentCount']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type CreateTestSeriesInput = z.infer<typeof createTestSeriesSchema>;
export type UpdateTestSeriesInput = z.infer<typeof updateTestSeriesSchema>;
export type ListTestSeriesQuery = z.infer<typeof listTestSeriesQuerySchema>;
