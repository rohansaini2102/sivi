import { Request, Response } from 'express';
import Payment from '../models/Payment';
import Course from '../models/Course';
import TestSeries from '../models/TestSeries';
import Enrollment from '../models/Enrollment';
import {
  createRazorpayOrder,
  verifyPaymentSignature,
  generateOrderId,
} from '../services/payment.service';
import { createOrderSchema, verifyPaymentSchema } from '../validators/payment.validator';
import logger from '../utils/logger';

// Create payment order
export const createOrder = async (req: Request, res: Response) => {
  try {
    const validatedData = createOrderSchema.parse(req.body);
    const { itemType, itemId, couponCode } = validatedData;
    const userId = req.user!.userId;

    // Get item details
    let item: any = null;
    let itemName = '';

    if (itemType === 'course') {
      item = await Course.findById(itemId);
      if (!item) {
        return res.status(404).json({
          success: false,
          error: { message: 'Course not found', code: 'COURSE_NOT_FOUND' },
        });
      }
      itemName = item.title;
    } else if (itemType === 'test_series') {
      item = await TestSeries.findById(itemId);
      if (!item) {
        return res.status(404).json({
          success: false,
          error: { message: 'Test series not found', code: 'TEST_SERIES_NOT_FOUND' },
        });
      }
      itemName = item.title;
    } else {
      return res.status(400).json({
        success: false,
        error: { message: 'Invalid item type', code: 'INVALID_ITEM_TYPE' },
      });
    }

    // Check if already enrolled
    const existingEnrollment = await Enrollment.findOne({
      user: userId,
      [itemType === 'course' ? 'course' : 'testSeries']: itemId,
      isActive: true,
    });

    if (existingEnrollment) {
      return res.status(400).json({
        success: false,
        error: { message: 'You are already enrolled in this item', code: 'ALREADY_ENROLLED' },
      });
    }

    // Calculate price
    let amount = item.discountPrice || item.price;
    let discount = 0;

    // TODO: Apply coupon code discount if valid
    if (couponCode) {
      // Future: Implement coupon validation
    }

    // If item is free, create enrollment directly
    if (item.isFree || amount === 0) {
      const enrollment = new Enrollment({
        user: userId,
        itemType: itemType === 'course' ? 'course' : 'test_series',
        [itemType === 'course' ? 'course' : 'testSeries']: itemId,
        price: 0,
        validFrom: new Date(),
        validUntil: new Date(Date.now() + item.validityDays * 24 * 60 * 60 * 1000),
        isActive: true,
      });

      await enrollment.save();

      // Update enrollment count
      if (itemType === 'course') {
        await Course.findByIdAndUpdate(itemId, { $inc: { enrollmentCount: 1 } });
      } else {
        await TestSeries.findByIdAndUpdate(itemId, { $inc: { enrollmentCount: 1 } });
      }

      return res.json({
        success: true,
        data: {
          isFree: true,
          enrollment,
        },
        message: 'Enrolled successfully (Free)',
      });
    }

    // Generate order ID
    const orderId = generateOrderId();

    // Create Razorpay order
    const razorpayOrder = await createRazorpayOrder({
      amount,
      currency: 'INR',
      receipt: orderId,
      notes: {
        itemType,
        itemId,
        userId: userId.toString(),
        itemName,
      },
    });

    // Create payment record
    const payment = new Payment({
      user: userId,
      orderId,
      razorpayOrderId: razorpayOrder.id,
      amount,
      currency: 'INR',
      status: 'created',
      itemType: itemType === 'course' ? 'course' : 'test_series',
      [itemType === 'course' ? 'course' : 'testSeries']: itemId,
      couponCode,
      discount,
    });

    await payment.save();

    logger.info(`Payment order created: ${orderId} for user ${userId}`);

    res.json({
      success: true,
      data: {
        orderId,
        razorpayOrderId: razorpayOrder.id,
        amount: razorpayOrder.amount, // In paise
        currency: razorpayOrder.currency,
        itemName,
        keyId: process.env.RAZORPAY_KEY_ID,
      },
    });
  } catch (error: any) {
    logger.error('Create order error:', error);

    if (error.errors) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Validation error',
          code: 'VALIDATION_ERROR',
          details: error.errors,
        },
      });
    }

    res.status(400).json({
      success: false,
      error: { message: error.message, code: 'CREATE_ORDER_ERROR' },
    });
  }
};

// Verify payment and create enrollment
export const verifyPayment = async (req: Request, res: Response) => {
  try {
    const validatedData = verifyPaymentSchema.parse(req.body);
    const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = validatedData;
    const userId = req.user!.userId;

    // Find payment record
    const payment = await Payment.findOne({ orderId, user: userId });
    if (!payment) {
      return res.status(404).json({
        success: false,
        error: { message: 'Payment order not found', code: 'ORDER_NOT_FOUND' },
      });
    }

    if (payment.status === 'completed') {
      return res.status(400).json({
        success: false,
        error: { message: 'Payment already verified', code: 'ALREADY_VERIFIED' },
      });
    }

    // Verify signature
    const isValid = verifyPaymentSignature({
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    });

    if (!isValid) {
      payment.status = 'failed';
      await payment.save();

      return res.status(400).json({
        success: false,
        error: { message: 'Payment verification failed', code: 'VERIFICATION_FAILED' },
      });
    }

    // Update payment status
    payment.razorpayPaymentId = razorpayPaymentId;
    payment.razorpaySignature = razorpaySignature;
    payment.status = 'completed';
    await payment.save();

    // Get item for validity days
    let validityDays = 365;
    if (payment.course) {
      const course = await Course.findById(payment.course);
      if (course) {
        validityDays = course.validityDays;
        // Update enrollment count
        await Course.findByIdAndUpdate(payment.course, { $inc: { enrollmentCount: 1 } });
      }
    } else if (payment.testSeries) {
      const testSeries = await TestSeries.findById(payment.testSeries);
      if (testSeries) {
        validityDays = testSeries.validityDays;
        // Update enrollment count
        await TestSeries.findByIdAndUpdate(payment.testSeries, { $inc: { enrollmentCount: 1 } });
      }
    }

    // Create enrollment
    const enrollment = new Enrollment({
      user: userId,
      itemType: payment.itemType,
      course: payment.course,
      testSeries: payment.testSeries,
      payment: payment._id,
      price: payment.amount,
      validFrom: new Date(),
      validUntil: new Date(Date.now() + validityDays * 24 * 60 * 60 * 1000),
      isActive: true,
    });

    await enrollment.save();

    logger.info(`Payment verified and enrollment created: ${orderId}`);

    res.json({
      success: true,
      data: {
        payment: {
          orderId: payment.orderId,
          amount: payment.amount,
          status: payment.status,
        },
        enrollment,
      },
      message: 'Payment successful! You are now enrolled.',
    });
  } catch (error: any) {
    logger.error('Verify payment error:', error);

    if (error.errors) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Validation error',
          code: 'VALIDATION_ERROR',
          details: error.errors,
        },
      });
    }

    res.status(400).json({
      success: false,
      error: { message: error.message, code: 'VERIFY_PAYMENT_ERROR' },
    });
  }
};

// Get payment history for user
export const getPaymentHistory = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { page = 1, limit = 20 } = req.query;

    const pageNum = Number(page);
    const limitNum = Math.min(Number(limit), 50);

    const total = await Payment.countDocuments({ user: userId });

    const payments = await Payment.find({ user: userId })
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .populate('course', 'title thumbnail')
      .populate('testSeries', 'title thumbnail')
      .lean();

    res.json({
      success: true,
      data: {
        payments,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error: any) {
    logger.error('Get payment history error:', error);
    res.status(400).json({
      success: false,
      error: { message: error.message, code: 'PAYMENT_HISTORY_ERROR' },
    });
  }
};

export default {
  createOrder,
  verifyPayment,
  getPaymentHistory,
};
