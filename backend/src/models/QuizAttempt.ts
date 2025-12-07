import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IAnswer {
  questionId: Types.ObjectId;
  selectedOption: 'a' | 'b' | 'c' | 'd' | null; // null if skipped
  isCorrect: boolean;
  timeTaken: number; // seconds
  markedForReview: boolean;
}

export interface IQuizAttempt extends Document {
  user: Types.ObjectId;
  quiz: Types.ObjectId;
  lesson: Types.ObjectId;
  course: Types.ObjectId;

  mode: 'practice' | 'exam';
  status: 'in_progress' | 'completed' | 'abandoned';

  // Answers
  answers: IAnswer[];
  currentQuestionIndex: number;

  // Scoring
  totalQuestions: number;
  attempted: number;
  correct: number;
  wrong: number;
  skipped: number;
  score: number; // raw score with negative marking applied
  maxScore: number;
  percentage: number;
  grade: 'S' | 'A' | 'B' | 'C' | 'F';
  passed: boolean;

  // Gamification (practice mode)
  currentStreak: number;
  maxStreak: number;
  bonusPoints: number;
  totalPoints: number;

  // Timing
  startedAt: Date;
  completedAt?: Date;
  totalTimeTaken: number; // seconds
  timeLimit: number; // seconds, 0 = no limit

  // Language preference
  language: 'en' | 'hi';

  createdAt: Date;
  updatedAt: Date;
}

const answerSchema = new Schema<IAnswer>(
  {
    questionId: {
      type: Schema.Types.ObjectId,
      ref: 'Question',
      required: true,
    },
    selectedOption: {
      type: String,
      enum: ['a', 'b', 'c', 'd', null],
      default: null,
    },
    isCorrect: {
      type: Boolean,
      default: false,
    },
    timeTaken: {
      type: Number,
      default: 0,
    },
    markedForReview: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false }
);

const quizAttemptSchema = new Schema<IQuizAttempt>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    quiz: {
      type: Schema.Types.ObjectId,
      ref: 'Quiz',
      required: true,
    },
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
    mode: {
      type: String,
      enum: ['practice', 'exam'],
      required: true,
    },
    status: {
      type: String,
      enum: ['in_progress', 'completed', 'abandoned'],
      default: 'in_progress',
    },
    answers: [answerSchema],
    currentQuestionIndex: {
      type: Number,
      default: 0,
    },
    // Scoring
    totalQuestions: {
      type: Number,
      default: 0,
    },
    attempted: {
      type: Number,
      default: 0,
    },
    correct: {
      type: Number,
      default: 0,
    },
    wrong: {
      type: Number,
      default: 0,
    },
    skipped: {
      type: Number,
      default: 0,
    },
    score: {
      type: Number,
      default: 0,
    },
    maxScore: {
      type: Number,
      default: 0,
    },
    percentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    grade: {
      type: String,
      enum: ['S', 'A', 'B', 'C', 'F'],
      default: 'F',
    },
    passed: {
      type: Boolean,
      default: false,
    },
    // Gamification
    currentStreak: {
      type: Number,
      default: 0,
    },
    maxStreak: {
      type: Number,
      default: 0,
    },
    bonusPoints: {
      type: Number,
      default: 0,
    },
    totalPoints: {
      type: Number,
      default: 0,
    },
    // Timing
    startedAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: Date,
    totalTimeTaken: {
      type: Number,
      default: 0,
    },
    timeLimit: {
      type: Number,
      default: 0,
    },
    language: {
      type: String,
      enum: ['en', 'hi'],
      default: 'en',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
quizAttemptSchema.index({ user: 1, quiz: 1 });
quizAttemptSchema.index({ user: 1, course: 1 });
quizAttemptSchema.index({ quiz: 1 });
quizAttemptSchema.index({ status: 1 });
quizAttemptSchema.index({ user: 1, status: 1 });

export default mongoose.model<IQuizAttempt>('QuizAttempt', quizAttemptSchema);
