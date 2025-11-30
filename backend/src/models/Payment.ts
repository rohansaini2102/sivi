import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IPayment extends Document {
  user: Types.ObjectId;
  orderId: string;
  razorpayOrderId: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  amount: number;
  currency: string;
  status: 'created' | 'pending' | 'completed' | 'failed' | 'refunded';
  itemType: 'course' | 'test_series' | 'bundle';
  course?: Types.ObjectId;
  testSeries?: Types.ObjectId;
  bundle?: Types.ObjectId;
  couponCode?: string;
  discount: number;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const paymentSchema = new Schema<IPayment>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    orderId: {
      type: String,
      required: true,
      unique: true,
    },
    razorpayOrderId: {
      type: String,
      required: true,
    },
    razorpayPaymentId: String,
    razorpaySignature: String,
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: 'INR',
    },
    status: {
      type: String,
      enum: ['created', 'pending', 'completed', 'failed', 'refunded'],
      default: 'created',
    },
    itemType: {
      type: String,
      enum: ['course', 'test_series', 'bundle'],
      required: true,
    },
    course: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
    },
    testSeries: {
      type: Schema.Types.ObjectId,
      ref: 'TestSeries',
    },
    bundle: {
      type: Schema.Types.ObjectId,
      ref: 'Bundle',
    },
    couponCode: String,
    discount: {
      type: Number,
      default: 0,
    },
    metadata: Schema.Types.Mixed,
  },
  {
    timestamps: true,
  }
);

// Indexes
paymentSchema.index({ user: 1 });
paymentSchema.index({ orderId: 1 });
paymentSchema.index({ razorpayOrderId: 1 });
paymentSchema.index({ status: 1 });

export default mongoose.model<IPayment>('Payment', paymentSchema);
