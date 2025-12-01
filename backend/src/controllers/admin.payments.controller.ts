import { Request, Response } from 'express';
import Payment from '../models/Payment';
import { listPaymentsQuerySchema } from '../validators/payment.validator';
import { initiateRefund } from '../services/payment.service';
import logger from '../utils/logger';

// List all payments (admin)
export const listPayments = async (req: Request, res: Response) => {
  try {
    const query = listPaymentsQuerySchema.parse(req.query);
    const { page, limit, status, itemType, userId, startDate, endDate, sortBy, sortOrder } = query;

    // Build filter
    const filter: any = {};

    if (status && status !== 'all') {
      filter.status = status;
    }

    if (itemType && itemType !== 'all') {
      filter.itemType = itemType;
    }

    if (userId) {
      filter.user = userId;
    }

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) {
        filter.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        filter.createdAt.$lte = new Date(endDate);
      }
    }

    // Build sort
    const sort: any = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Get total count
    const total = await Payment.countDocuments(filter);

    // Get payments
    const payments = await Payment.find(filter)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('user', 'name email phone')
      .populate('course', 'title')
      .populate('testSeries', 'title')
      .lean();

    // Get summary stats
    const summaryStats = await Payment.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
        },
      },
    ]);

    res.json({
      success: true,
      data: {
        payments,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
        summary: summaryStats,
      },
    });
  } catch (error: any) {
    logger.error('List payments error:', error);
    res.status(400).json({
      success: false,
      error: { message: error.message, code: 'LIST_PAYMENTS_ERROR' },
    });
  }
};

// Get single payment by ID
export const getPaymentById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const payment = await Payment.findById(id)
      .populate('user', 'name email phone')
      .populate('course', 'title thumbnail price')
      .populate('testSeries', 'title thumbnail price')
      .lean();

    if (!payment) {
      return res.status(404).json({
        success: false,
        error: { message: 'Payment not found', code: 'PAYMENT_NOT_FOUND' },
      });
    }

    res.json({
      success: true,
      data: payment,
    });
  } catch (error: any) {
    logger.error('Get payment error:', error);
    res.status(400).json({
      success: false,
      error: { message: error.message, code: 'GET_PAYMENT_ERROR' },
    });
  }
};

// Initiate refund (admin)
export const processRefund = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { amount } = req.body; // Optional partial refund amount

    const payment = await Payment.findById(id);
    if (!payment) {
      return res.status(404).json({
        success: false,
        error: { message: 'Payment not found', code: 'PAYMENT_NOT_FOUND' },
      });
    }

    if (payment.status !== 'completed') {
      return res.status(400).json({
        success: false,
        error: { message: 'Can only refund completed payments', code: 'INVALID_PAYMENT_STATUS' },
      });
    }

    if (!payment.razorpayPaymentId) {
      return res.status(400).json({
        success: false,
        error: { message: 'No Razorpay payment ID found', code: 'NO_PAYMENT_ID' },
      });
    }

    // Initiate refund via Razorpay
    const refund = await initiateRefund(payment.razorpayPaymentId, amount);

    // Update payment status
    payment.status = 'refunded';
    await payment.save();

    logger.info(`Payment refunded: ${id} by ${req.user!.userId}`);

    res.json({
      success: true,
      data: { refund },
      message: 'Refund initiated successfully',
    });
  } catch (error: any) {
    logger.error('Process refund error:', error);
    res.status(400).json({
      success: false,
      error: { message: error.message, code: 'REFUND_ERROR' },
    });
  }
};

export default {
  listPayments,
  getPaymentById,
  processRefund,
};
