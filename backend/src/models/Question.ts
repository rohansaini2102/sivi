import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IQuestion extends Document {
  question: string;
  questionHindi?: string;
  options: {
    a: string;
    b: string;
    c: string;
    d: string;
  };
  optionsHindi?: {
    a: string;
    b: string;
    c: string;
    d: string;
  };
  correctAnswer: 'a' | 'b' | 'c' | 'd';
  explanation?: string;
  explanationHindi?: string;
  subject: string;
  topic?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  examCategory: string;
  tags: string[];
  source?: string; // e.g., "UPSC 2023", "RAS 2022"
  year?: number;
  isActive: boolean;
  usedInQuizzes: Types.ObjectId[];
  usedInExams: Types.ObjectId[];
  // Analytics
  timesAnswered: number;
  timesCorrect: number;
  avgTimeTaken: number; // seconds
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const questionSchema = new Schema<IQuestion>(
  {
    question: {
      type: String,
      required: true,
    },
    questionHindi: String,
    options: {
      a: { type: String, required: true },
      b: { type: String, required: true },
      c: { type: String, required: true },
      d: { type: String, required: true },
    },
    optionsHindi: {
      a: String,
      b: String,
      c: String,
      d: String,
    },
    correctAnswer: {
      type: String,
      enum: ['a', 'b', 'c', 'd'],
      required: true,
    },
    explanation: String,
    explanationHindi: String,
    subject: {
      type: String,
      required: true,
    },
    topic: String,
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium',
    },
    examCategory: {
      type: String,
      required: true,
      enum: ['RAS', 'REET', 'PATWAR', 'POLICE', 'RPSC', 'OTHER'],
    },
    tags: [String],
    source: {
      type: String,
      maxlength: 100,
    },
    year: {
      type: Number,
      min: 1900,
      max: 2100,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    usedInQuizzes: [{
      type: Schema.Types.ObjectId,
      ref: 'Quiz',
    }],
    usedInExams: [{
      type: Schema.Types.ObjectId,
      ref: 'Exam',
    }],
    // Analytics
    timesAnswered: {
      type: Number,
      default: 0,
    },
    timesCorrect: {
      type: Number,
      default: 0,
    },
    avgTimeTaken: {
      type: Number,
      default: 0,
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
questionSchema.index({ subject: 1, examCategory: 1 });
questionSchema.index({ difficulty: 1 });
questionSchema.index({ tags: 1 });
questionSchema.index({ topic: 1 });
questionSchema.index({ source: 1, year: 1 });
questionSchema.index({ usedInQuizzes: 1 });
questionSchema.index({ isActive: 1 });

export default mongoose.model<IQuestion>('Question', questionSchema);
