import mongoose, { Document, Schema, Types } from 'mongoose';

export interface ISubjectProgress {
  subjectId: Types.ObjectId;
  completedLessons: number;
  totalLessons: number;
  percentage: number;
}

export interface IChapterProgress {
  chapterId: Types.ObjectId;
  subjectId: Types.ObjectId;
  completedLessons: number;
  totalLessons: number;
  percentage: number;
}

export interface IUserProgress extends Document {
  user: Types.ObjectId;
  course: Types.ObjectId;

  // Overall progress
  completedLessons: Types.ObjectId[];
  percentage: number;
  lastAccessedLesson: Types.ObjectId;
  lastAccessedAt: Date;

  // Subject-wise progress
  subjectProgress: ISubjectProgress[];

  // Chapter-wise progress
  chapterProgress: IChapterProgress[];

  // Time tracking
  totalTimeSpent: number; // minutes

  // Completion
  isCompleted: boolean;
  completedAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}

const subjectProgressSchema = new Schema<ISubjectProgress>(
  {
    subjectId: {
      type: Schema.Types.ObjectId,
      ref: 'Subject',
      required: true,
    },
    completedLessons: {
      type: Number,
      default: 0,
    },
    totalLessons: {
      type: Number,
      default: 0,
    },
    percentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
  },
  { _id: false }
);

const chapterProgressSchema = new Schema<IChapterProgress>(
  {
    chapterId: {
      type: Schema.Types.ObjectId,
      ref: 'Chapter',
      required: true,
    },
    subjectId: {
      type: Schema.Types.ObjectId,
      ref: 'Subject',
      required: true,
    },
    completedLessons: {
      type: Number,
      default: 0,
    },
    totalLessons: {
      type: Number,
      default: 0,
    },
    percentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
  },
  { _id: false }
);

const userProgressSchema = new Schema<IUserProgress>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    course: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    completedLessons: [{
      type: Schema.Types.ObjectId,
      ref: 'Lesson',
    }],
    percentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    lastAccessedLesson: {
      type: Schema.Types.ObjectId,
      ref: 'Lesson',
    },
    lastAccessedAt: {
      type: Date,
      default: Date.now,
    },
    subjectProgress: [subjectProgressSchema],
    chapterProgress: [chapterProgressSchema],
    totalTimeSpent: {
      type: Number,
      default: 0,
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    completedAt: Date,
  },
  {
    timestamps: true,
  }
);

// Indexes
userProgressSchema.index({ user: 1, course: 1 }, { unique: true });
userProgressSchema.index({ user: 1 });
userProgressSchema.index({ course: 1 });
userProgressSchema.index({ isCompleted: 1 });

export default mongoose.model<IUserProgress>('UserProgress', userProgressSchema);
