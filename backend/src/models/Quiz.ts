import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IQuiz extends Document {
  lesson: Types.ObjectId;
  course: Types.ObjectId;
  title: string;
  titleHi?: string;
  description?: string;
  descriptionHi?: string;
  mode: 'practice' | 'exam';

  // Questions
  questions: Types.ObjectId[];

  // Settings
  totalQuestions: number;
  duration: number; // minutes, 0 = no limit
  passingPercentage: number;
  shuffleQuestions: boolean;
  shuffleOptions: boolean;

  // Practice mode settings
  showExplanationAfterEach: boolean;
  allowRetake: boolean;
  maxAttempts: number; // 0 = unlimited

  // Exam mode settings
  showAnswersAtEnd: boolean;

  // Marking scheme
  correctMarks: number;
  wrongMarks: number; // negative value for negative marking
  unattemptedMarks: number;

  // Stats
  totalAttempts: number;
  avgScore: number;
  avgTimeTaken: number; // seconds

  isPublished: boolean;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const quizSchema = new Schema<IQuiz>(
  {
    lesson: {
      type: Schema.Types.ObjectId,
      ref: 'Lesson',
      required: true,
    },
    course: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    titleHi: {
      type: String,
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      maxlength: 1000,
    },
    descriptionHi: {
      type: String,
      maxlength: 1000,
    },
    mode: {
      type: String,
      enum: ['practice', 'exam'],
      default: 'practice',
    },
    questions: [{
      type: Schema.Types.ObjectId,
      ref: 'Question',
    }],
    totalQuestions: {
      type: Number,
      default: 0,
    },
    duration: {
      type: Number,
      default: 0, // 0 = no time limit
    },
    passingPercentage: {
      type: Number,
      default: 40,
      min: 0,
      max: 100,
    },
    shuffleQuestions: {
      type: Boolean,
      default: true,
    },
    shuffleOptions: {
      type: Boolean,
      default: true,
    },
    // Practice mode
    showExplanationAfterEach: {
      type: Boolean,
      default: true,
    },
    allowRetake: {
      type: Boolean,
      default: true,
    },
    maxAttempts: {
      type: Number,
      default: 0, // 0 = unlimited
    },
    // Exam mode
    showAnswersAtEnd: {
      type: Boolean,
      default: true,
    },
    // Marking
    correctMarks: {
      type: Number,
      default: 1,
    },
    wrongMarks: {
      type: Number,
      default: 0, // -0.25 for exam mode with negative marking
    },
    unattemptedMarks: {
      type: Number,
      default: 0,
    },
    // Stats
    totalAttempts: {
      type: Number,
      default: 0,
    },
    avgScore: {
      type: Number,
      default: 0,
    },
    avgTimeTaken: {
      type: Number,
      default: 0,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
quizSchema.index({ lesson: 1 });
quizSchema.index({ course: 1 });
quizSchema.index({ mode: 1 });

export default mongoose.model<IQuiz>('Quiz', quizSchema);
