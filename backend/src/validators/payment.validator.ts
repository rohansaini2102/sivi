import { z } from 'zod';

// Item types
export const itemTypes = ['course', 'test_series', 'bundle'] as const;

// Create order schema
export const createOrderSchema = z.object({
  itemType: z.enum(itemTypes, {
    errorMap: () => ({ message: 'Invalid item type' }),
  }),
  itemId: z
    .string()
    .min(1, 'Item ID is required'),
  couponCode: z
    .string()
    .max(50, 'Coupon code must be less than 50 characters')
    .optional(),
});

// Verify payment schema
export const verifyPaymentSchema = z.object({
  orderId: z
    .string()
    .min(1, 'Order ID is required'),
  razorpayOrderId: z
    .string()
    .min(1, 'Razorpay order ID is required'),
  razorpayPaymentId: z
    .string()
    .min(1, 'Razorpay payment ID is required'),
  razorpaySignature: z
    .string()
    .min(1, 'Razorpay signature is required'),
});

// Query params for payment list
export const listPaymentsQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  status: z.enum(['created', 'pending', 'completed', 'failed', 'refunded', 'all']).optional(),
  itemType: z.enum([...itemTypes, 'all']).optional(),
  userId: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  sortBy: z.enum(['createdAt', 'amount']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type VerifyPaymentInput = z.infer<typeof verifyPaymentSchema>;
export type ListPaymentsQuery = z.infer<typeof listPaymentsQuerySchema>;
