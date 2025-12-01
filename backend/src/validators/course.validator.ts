import { z } from 'zod';

// Exam categories enum
export const examCategories = ['RAS', 'REET', 'PATWAR', 'POLICE', 'RPSC', 'OTHER'] as const;
export const languages = ['hi', 'en', 'both'] as const;
export const levels = ['beginner', 'intermediate', 'advanced'] as const;

// Create course schema
export const createCourseSchema = z.object({
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
    .default(365),
  language: z.enum(languages).default('both'),
  level: z.enum(levels).default('beginner'),
  features: z
    .array(z.string().max(200))
    .max(20, 'Maximum 20 features allowed')
    .optional()
    .default([]),
  isFree: z.boolean().default(false),
  isPublished: z.boolean().default(false),
  isFeatured: z.boolean().default(false),
});

// Update course schema (all fields optional)
export const updateCourseSchema = createCourseSchema.partial();

// Query params schema for listing courses
export const listCoursesQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  search: z.string().optional(),
  category: z.enum([...examCategories, 'all']).optional(),
  isPublished: z.coerce.boolean().optional(),
  isFeatured: z.coerce.boolean().optional(),
  sortBy: z.enum(['createdAt', 'title', 'price', 'enrollmentCount']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type CreateCourseInput = z.infer<typeof createCourseSchema>;
export type UpdateCourseInput = z.infer<typeof updateCourseSchema>;
export type ListCoursesQuery = z.infer<typeof listCoursesQuerySchema>;
