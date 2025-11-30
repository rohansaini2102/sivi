import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IExam extends Document {
  title: string;
  testSeries: Types.ObjectId;
  order: number;
  description?: string;
  totalQuestions: number;
  totalMarks: number;
  duration: number; // in minutes
  positiveMarks: number;
  negativeMarks: number;
  passingPercentage: number;
  questions: Types.ObjectId[];
  isFree: boolean;
  isPublished: boolean;
  attemptCount: number;
  avgScore: number;
  createdAt: Date;
  updatedAt: Date;
}

const examSchema = new Schema<IExam>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    testSeries: {
      type: Schema.Types.ObjectId,
      ref: 'TestSeries',
      required: true,
    },
    order: {
      type: Number,
      default: 0,
    },
    description: String,
    totalQuestions: {
      type: Number,
      required: true,
      default: 100,
    },
    totalMarks: {
      type: Number,
      required: true,
      default: 200,
    },
    duration: {
      type: Number,
      required: true,
      default: 120, // 2 hours
    },
    positiveMarks: {
      type: Number,
      default: 2,
    },
    negativeMarks: {
      type: Number,
      default: 0.5,
    },
    passingPercentage: {
      type: Number,
      default: 40,
    },
    questions: [{
      type: Schema.Types.ObjectId,
      ref: 'Question',
    }],
    isFree: {
      type: Boolean,
      default: false,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    attemptCount: {
      type: Number,
      default: 0,
    },
    avgScore: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
examSchema.index({ testSeries: 1, order: 1 });

export default mongoose.model<IExam>('Exam', examSchema);
