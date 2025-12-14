import mongoose, { Document, Schema, Types } from 'mongoose';

// Answer interface for each question
export interface IExamAnswer {
  questionId: Types.ObjectId;
  sectionId?: Types.ObjectId;
  selectedOptions: string[]; // Array for multiple correct support
  isCorrect: boolean;
  isPartiallyCorrect: boolean;
  marksObtained: number;
  timeTaken: number; // seconds spent on this question
  markedForReview: boolean;
  visitedAt?: Date;
  answeredAt?: Date;
}

// Section progress interface
export interface ISectionProgress {
  sectionId: Types.ObjectId;
  sectionTitle: string;
  attempted: number;
  correct: number;
  wrong: number;
  partiallyCorrect: number;
  skipped: number;
  marksObtained: number;
  maxMarks: number;
  percentage: number;
}

export interface IExamAttempt extends Document {
  user: Types.ObjectId;
  exam: Types.ObjectId;
  testSeries: Types.ObjectId;

  status: 'in_progress' | 'completed' | 'auto_submitted';

  // Answer tracking with per-question state
  answers: IExamAnswer[];

  // Navigation state (for resume)
  currentSectionIndex: number;
  currentQuestionIndex: number;

  // Section-wise progress (calculated on submit)
  sectionProgress: ISectionProgress[];

  // Overall scoring
  totalQuestions: number;
  attempted: number;
  correct: number;
  wrong: number;
  partiallyCorrect: number;
  skipped: number;

  score: number;
  maxScore: number;
  percentage: number;
  grade: 'S' | 'A' | 'B' | 'C' | 'F';
  passed: boolean;

  // Rank (calculated after result)
  rank?: number;
  percentile?: number;

  // Timing
  startedAt: Date;
  lastActiveAt: Date; // For resume functionality
  completedAt?: Date;
  totalTimeTaken: number; // seconds
  timeLimit: number; // seconds

  // Language preference
  language: 'en' | 'hi';

  // Shuffled order (if shuffling enabled)
  questionOrder?: string[]; // Array of question IDs in shuffled order
  optionOrders?: Map<string, string[]>; // Map of questionId -> shuffled option order

  createdAt: Date;
  updatedAt: Date;
}

const examAnswerSchema = new Schema<IExamAnswer>(
  {
    questionId: {
      type: Schema.Types.ObjectId,
      ref: 'Question',
      required: true,
    },
    sectionId: {
      type: Schema.Types.ObjectId,
    },
    selectedOptions: {
      type: [String],
      default: [],
    },
    isCorrect: {
      type: Boolean,
      default: false,
    },
    isPartiallyCorrect: {
      type: Boolean,
      default: false,
    },
    marksObtained: {
      type: Number,
      default: 0,
    },
    timeTaken: {
      type: Number,
      default: 0,
    },
    markedForReview: {
      type: Boolean,
      default: false,
    },
    visitedAt: Date,
    answeredAt: Date,
  },
  { _id: false }
);

const sectionProgressSchema = new Schema<ISectionProgress>(
  {
    sectionId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    sectionTitle: {
      type: String,
      required: true,
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
    partiallyCorrect: {
      type: Number,
      default: 0,
    },
    skipped: {
      type: Number,
      default: 0,
    },
    marksObtained: {
      type: Number,
      default: 0,
    },
    maxMarks: {
      type: Number,
      default: 0,
    },
    percentage: {
      type: Number,
      default: 0,
    },
  },
  { _id: false }
);

const examAttemptSchema = new Schema<IExamAttempt>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    exam: {
      type: Schema.Types.ObjectId,
      ref: 'Exam',
      required: true,
    },
    testSeries: {
      type: Schema.Types.ObjectId,
      ref: 'TestSeries',
      required: true,
    },
    status: {
      type: String,
      enum: ['in_progress', 'completed', 'auto_submitted'],
      default: 'in_progress',
    },
    answers: {
      type: [examAnswerSchema],
      default: [],
    },
    currentSectionIndex: {
      type: Number,
      default: 0,
    },
    currentQuestionIndex: {
      type: Number,
      default: 0,
    },
    sectionProgress: {
      type: [sectionProgressSchema],
      default: [],
    },
    // Overall scoring
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
    partiallyCorrect: {
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
    rank: Number,
    percentile: Number,
    // Timing
    startedAt: {
      type: Date,
      default: Date.now,
    },
    lastActiveAt: {
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
      required: true,
    },
    language: {
      type: String,
      enum: ['en', 'hi'],
      default: 'en',
    },
    questionOrder: [String],
    optionOrders: {
      type: Map,
      of: [String],
    },
  },
  {
    timestamps: true,
  }
);

// Method to calculate remaining time
examAttemptSchema.methods.getRemainingTime = function(): number {
  const elapsed = Math.floor((Date.now() - this.startedAt.getTime()) / 1000);
  return Math.max(0, this.timeLimit - elapsed);
};

// Method to check if exam should be auto-submitted
examAttemptSchema.methods.shouldAutoSubmit = function(): boolean {
  return this.getRemainingTime() <= 0 && this.status === 'in_progress';
};

// Method to calculate grade based on percentage
examAttemptSchema.methods.calculateGrade = function(): 'S' | 'A' | 'B' | 'C' | 'F' {
  if (this.percentage >= 90) return 'S';
  if (this.percentage >= 75) return 'A';
  if (this.percentage >= 60) return 'B';
  if (this.percentage >= 40) return 'C';
  return 'F';
};

// Virtual for answered questions count
examAttemptSchema.virtual('answeredCount').get(function() {
  return this.answers.filter(a => a.selectedOptions.length > 0).length;
});

// Virtual for visited questions count
examAttemptSchema.virtual('visitedCount').get(function() {
  return this.answers.filter(a => a.visitedAt).length;
});

// Virtual for marked for review count
examAttemptSchema.virtual('markedCount').get(function() {
  return this.answers.filter(a => a.markedForReview).length;
});

// Indexes
examAttemptSchema.index({ user: 1, exam: 1, status: 1 });
examAttemptSchema.index({ user: 1, testSeries: 1 });
examAttemptSchema.index({ exam: 1 });
examAttemptSchema.index({ status: 1 });
examAttemptSchema.index({ user: 1, status: 1 });
examAttemptSchema.index({ exam: 1, status: 1, score: -1 }); // For leaderboard

export default mongoose.model<IExamAttempt>('ExamAttempt', examAttemptSchema);
