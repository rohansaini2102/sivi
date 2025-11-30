import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IEnrollment extends Document {
  user: Types.ObjectId;
  itemType: 'course' | 'test_series' | 'bundle';
  course?: Types.ObjectId;
  testSeries?: Types.ObjectId;
  bundle?: Types.ObjectId;
  payment?: Types.ObjectId;
  price: number;
  validFrom: Date;
  validUntil: Date;
  isActive: boolean;
  progress: {
    completedLessons: Types.ObjectId[];
    completedExams: Types.ObjectId[];
    percentage: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const enrollmentSchema = new Schema<IEnrollment>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
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
    payment: {
      type: Schema.Types.ObjectId,
      ref: 'Payment',
    },
    price: {
      type: Number,
      required: true,
    },
    validFrom: {
      type: Date,
      default: Date.now,
    },
    validUntil: {
      type: Date,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    progress: {
      completedLessons: [{
        type: Schema.Types.ObjectId,
        ref: 'Lesson',
      }],
      completedExams: [{
        type: Schema.Types.ObjectId,
        ref: 'Exam',
      }],
      percentage: {
        type: Number,
        default: 0,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
enrollmentSchema.index({ user: 1, itemType: 1 });
enrollmentSchema.index({ user: 1, course: 1 });
enrollmentSchema.index({ user: 1, testSeries: 1 });
enrollmentSchema.index({ validUntil: 1 });

export default mongoose.model<IEnrollment>('Enrollment', enrollmentSchema);
