import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { CONSTANTS } from './config/constants';
import logger, { httpLogger } from './utils/logger';

// Import routes
import authRoutes from './routes/auth.routes';
import storeRoutes from './routes/store.routes';
import learnRoutes from './routes/learn.routes';
import testRoutes from './routes/test.routes';
import userRoutes from './routes/user.routes';
import adminRoutes from './routes/admin.routes';
import adminCourseBuilderRoutes from './routes/admin.courseBuilder.routes';
import adminTestSeriesBuilderRoutes from './routes/admin.testSeriesBuilder.routes';
import adminQuestionBankRoutes from './routes/admin.questionBank.routes';
import paymentRoutes from './routes/payment.routes';

const app: Application = express();

// Trust proxy (required for Cloud Run, Railway, Heroku, etc.)
app.set('trust proxy', 1);

// CORS Configuration - Industry Standard for Cross-Origin Auth
const allowedOrigins = process.env.NODE_ENV === 'production'
  ? (process.env.FRONTEND_URL || 'https://siviacademy.in')
      .split(',')
      .map(origin => origin.trim()) // Remove whitespace
  : ['http://localhost:3000', 'http://127.0.0.1:3000'];

// Security middleware
app.use(helmet());
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      callback(null, origin);
    } else {
      logger.warn(`CORS blocked origin: ${origin}`);
      callback(new Error(`Origin ${origin} not allowed by CORS`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Set-Cookie'],
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: CONSTANTS.RATE_LIMIT_WINDOW_MS,
  max: CONSTANTS.RATE_LIMIT_MAX_REQUESTS,
  message: 'Too many requests, please try again later.',
});
app.use('/api/', limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// HTTP request logging
app.use(httpLogger);

// Health check with service status
app.get('/health', (req: Request, res: Response) => {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    services: {
      database: 'unknown', // Will be checked by connectDB
      payment: !!process.env.RAZORPAY_KEY_ID && !!process.env.RAZORPAY_KEY_SECRET ? 'ok' : 'disabled',
      storage: !!process.env.R2_BUCKET_NAME && !!process.env.R2_PUBLIC_URL ? 'ok' : 'disabled',
    },
  };

  res.status(200).json(health);
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/store', storeRoutes);
app.use('/api/learn', learnRoutes);
app.use('/api/test', testRoutes);
app.use('/api/user', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin/course-builder', adminCourseBuilderRoutes);
app.use('/api/admin/test-series-builder', adminTestSeriesBuilderRoutes);
app.use('/api/admin/question-bank', adminQuestionBankRoutes);
app.use('/api/payment', paymentRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error('Unhandled error', { error: err.message, stack: err.stack });
  res.status(500).json({
    error: process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message
  });
});

export default app;
