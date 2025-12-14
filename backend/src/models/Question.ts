import mongoose, { Document, Schema, Types } from 'mongoose';

// Option interface for flexible options
export interface IQuestionOption {
  id: string; // 'a', 'b', 'c', 'd', 'e', etc.
  text: string;
  textHi?: string;
}

export interface IQuestion extends Document {
  // Question type
  questionType: 'single' | 'multiple' | 'comprehension';

  // Question content
  question: string;
  questionHindi?: string;
  imageUrl?: string; // Question image from R2

  // For comprehension type questions
  comprehensionPassage?: Types.ObjectId;

  // Flexible options array (new format)
  options: IQuestionOption[];
  optionsHindi?: IQuestionOption[]; // Deprecated - use textHi in options instead

  // Correct answers - array to support multiple correct
  correctAnswers: string[]; // ['a'] for single, ['a', 'c'] for multiple

  // Legacy fields for backward compatibility (deprecated)
  correctAnswer?: 'a' | 'b' | 'c' | 'd';

  // Explanation
  explanation?: string;
  explanationHindi?: string;

  // Categorization
  subject: string;
  topic?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  examCategory: string;
  tags: string[];
  source?: string; // e.g., "UPSC 2023", "RAS 2022"
  year?: number;

  // Status
  isActive: boolean;

  // Usage tracking
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

const optionSchema = new Schema<IQuestionOption>(
  {
    id: {
      type: String,
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    textHi: String,
  },
  { _id: false }
);

const questionSchema = new Schema<IQuestion>(
  {
    questionType: {
      type: String,
      enum: ['single', 'multiple', 'comprehension'],
      default: 'single',
    },
    question: {
      type: String,
      required: true,
    },
    questionHindi: String,
    imageUrl: String,
    comprehensionPassage: {
      type: Schema.Types.ObjectId,
      ref: 'ComprehensionPassage',
    },
    options: {
      type: [optionSchema],
      validate: {
        validator: function(v: IQuestionOption[]) {
          return v && v.length >= 2; // At least 2 options required
        },
        message: 'At least 2 options are required',
      },
    },
    optionsHindi: [optionSchema], // Deprecated
    correctAnswers: {
      type: [String],
      validate: {
        validator: function(this: IQuestion, v: string[]) {
          if (!v || v.length === 0) return false;
          // For single type, only one answer allowed
          if (this.questionType === 'single' && v.length !== 1) return false;
          // For multiple type, at least one answer required
          if (this.questionType === 'multiple' && v.length < 1) return false;
          return true;
        },
        message: 'Invalid correct answers for question type',
      },
    },
    // Legacy field - kept for backward compatibility
    correctAnswer: {
      type: String,
      enum: ['a', 'b', 'c', 'd'],
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

// Pre-save middleware to sync legacy fields with new format
questionSchema.pre('save', function(next) {
  // If correctAnswers is set but correctAnswer is not, sync it
  if (this.correctAnswers && this.correctAnswers.length > 0 && !this.correctAnswer) {
    const firstAnswer = this.correctAnswers[0];
    if (['a', 'b', 'c', 'd'].includes(firstAnswer)) {
      this.correctAnswer = firstAnswer as 'a' | 'b' | 'c' | 'd';
    }
  }
  // If correctAnswer is set but correctAnswers is not, sync it
  if (this.correctAnswer && (!this.correctAnswers || this.correctAnswers.length === 0)) {
    this.correctAnswers = [this.correctAnswer];
  }
  next();
});

// Virtual to get correct answers (handles both formats)
questionSchema.virtual('answers').get(function() {
  if (this.correctAnswers && this.correctAnswers.length > 0) {
    return this.correctAnswers;
  }
  if (this.correctAnswer) {
    return [this.correctAnswer];
  }
  return [];
});

// Indexes
questionSchema.index({ subject: 1, examCategory: 1 });
questionSchema.index({ difficulty: 1 });
questionSchema.index({ tags: 1 });
questionSchema.index({ topic: 1 });
questionSchema.index({ source: 1, year: 1 });
questionSchema.index({ usedInQuizzes: 1 });
questionSchema.index({ usedInExams: 1 });
questionSchema.index({ isActive: 1 });
questionSchema.index({ questionType: 1 });
questionSchema.index({ comprehensionPassage: 1 });

export default mongoose.model<IQuestion>('Question', questionSchema);
