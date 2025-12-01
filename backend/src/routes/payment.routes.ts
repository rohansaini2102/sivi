import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import * as paymentController from '../controllers/payment.controller';

const router = Router();

// All payment routes require authentication
router.use(authenticate);

// POST /api/payment/create-order - Create Razorpay order
router.post('/create-order', paymentController.createOrder);

// POST /api/payment/verify - Verify payment and create enrollment
router.post('/verify', paymentController.verifyPayment);

// GET /api/payment/history - Get user's payment history
router.get('/history', paymentController.getPaymentHistory);

export default router;
