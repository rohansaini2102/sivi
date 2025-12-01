import Razorpay from 'razorpay';
import crypto from 'crypto';
import logger from '../utils/logger';

// Lazy initialization of Razorpay instance
let razorpayInstance: Razorpay | null = null;

const getRazorpay = (): Razorpay => {
  if (!razorpayInstance) {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      throw new Error('Razorpay credentials not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in environment variables.');
    }

    razorpayInstance = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });
  }
  return razorpayInstance;
};

// Types
export interface CreateOrderParams {
  amount: number; // Amount in rupees
  currency?: string;
  receipt: string;
  notes?: Record<string, string>;
}

export interface RazorpayOrder {
  id: string;
  entity: string;
  amount: number;
  amount_paid: number;
  amount_due: number;
  currency: string;
  receipt: string;
  status: string;
  created_at: number;
}

export interface VerifyPaymentParams {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}

// Create Razorpay order
export const createRazorpayOrder = async (
  params: CreateOrderParams
): Promise<RazorpayOrder> => {
  try {
    const { amount, currency = 'INR', receipt, notes = {} } = params;

    // Convert amount to paise (Razorpay expects amount in smallest currency unit)
    const amountInPaise = Math.round(amount * 100);

    const options = {
      amount: amountInPaise,
      currency,
      receipt,
      notes,
    };

    const order = await getRazorpay().orders.create(options);
    logger.info(`Razorpay order created: ${order.id}`);

    return order as RazorpayOrder;
  } catch (error: any) {
    logger.error('Failed to create Razorpay order:', error);
    throw new Error(`Payment order creation failed: ${error.message}`);
  }
};

// Verify payment signature
export const verifyPaymentSignature = (params: VerifyPaymentParams): boolean => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = params;

    const body = `${razorpayOrderId}|${razorpayPaymentId}`;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
      .update(body)
      .digest('hex');

    const isValid = expectedSignature === razorpaySignature;

    if (isValid) {
      logger.info(`Payment signature verified: ${razorpayPaymentId}`);
    } else {
      logger.warn(`Invalid payment signature for: ${razorpayPaymentId}`);
    }

    return isValid;
  } catch (error) {
    logger.error('Payment signature verification failed:', error);
    return false;
  }
};

// Get payment details
export const getPaymentDetails = async (paymentId: string): Promise<any> => {
  try {
    const payment = await getRazorpay().payments.fetch(paymentId);
    return payment;
  } catch (error: any) {
    logger.error('Failed to fetch payment details:', error);
    throw new Error(`Failed to fetch payment: ${error.message}`);
  }
};

// Initiate refund
export const initiateRefund = async (
  paymentId: string,
  amount?: number // Amount in rupees (optional, full refund if not provided)
): Promise<any> => {
  try {
    const refundOptions: any = {};

    if (amount) {
      refundOptions.amount = Math.round(amount * 100); // Convert to paise
    }

    const refund = await getRazorpay().payments.refund(paymentId, refundOptions);
    logger.info(`Refund initiated: ${refund.id} for payment: ${paymentId}`);

    return refund;
  } catch (error: any) {
    logger.error('Failed to initiate refund:', error);
    throw new Error(`Refund failed: ${error.message}`);
  }
};

// Generate unique order ID
export const generateOrderId = (): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `ORD${timestamp}${random}`;
};

export default {
  createRazorpayOrder,
  verifyPaymentSignature,
  getPaymentDetails,
  initiateRefund,
  generateOrderId,
};
