import mongoose, { Document, Schema, Types } from 'mongoose';

// Section interface for exam sections
export interface IExamSection {
  _id: Types.ObjectId;
  title: string;
  titleHi?: string;
  order: number;
  questions: Types.ObjectId[];
  instructions?: string;
  instructionsHi?: string;
}

export interface IExam extends Document {
  title: string;
  titleHi?: string;
  testSeries: Types.ObjectId;
  order: number;
  description?: string;
  descriptionHi?: string;

  // Section-based structure (new)
  sections: IExamSection[];

  // Legacy flat questions array (for backward compatibility)
  questions: Types.ObjectId[];

  // Computed stats
  totalQuestions: number;
  totalMarks: number;

  // Time configuration
  duration: number; // Total exam duration in minutes

  // Marking scheme
  defaultPositiveMarks: number; // Default +4
  defaultNegativeMarks: number; // Default -1
  passingPercentage: number;

  // Multiple correct question algorithm
  multipleCorrectAlgorithm: 'partial' | 'all_or_none' | 'proportional';

  // Settings
  allowSectionNavigation: boolean; // Free navigation between sections
  showSectionWiseResult: boolean;
  shuffleQuestions: boolean;
  shuffleOptions: boolean;

  // Legacy marking fields (for backward compatibility)
  positiveMarks: number;
  negativeMarks: number;

  // Status
  isFree: boolean;
  isPublished: boolean;

  // Analytics
  attemptCount: number;
  avgScore: number;

  createdAt: Date;
  updatedAt: Date;
}

const examSectionSchema = new Schema<IExamSection>(
  {
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
    order: {
      type: Number,
      default: 0,
    },
    questions: [{
      type: Schema.Types.ObjectId,
      ref: 'Question',
    }],
    instructions: String,
    instructionsHi: String,
  }
);

const examSchema = new Schema<IExam>(
  {
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
    descriptionHi: String,

    // Section-based structure
    sections: {
      type: [examSectionSchema],
      default: [],
    },

    // Legacy flat questions (for backward compatibility)
    questions: [{
      type: Schema.Types.ObjectId,
      ref: 'Question',
    }],

    totalQuestions: {
      type: Number,
      default: 0,
    },
    totalMarks: {
      type: Number,
      default: 0,
    },
    duration: {
      type: Number,
      required: true,
      default: 120, // 2 hours
    },

    // New marking scheme
    defaultPositiveMarks: {
      type: Number,
      default: 4,
    },
    defaultNegativeMarks: {
      type: Number,
      default: 1,
    },
    passingPercentage: {
      type: Number,
      default: 40,
    },
    multipleCorrectAlgorithm: {
      type: String,
      enum: ['partial', 'all_or_none', 'proportional'],
      default: 'all_or_none',
    },

    // Settings
    allowSectionNavigation: {
      type: Boolean,
      default: true,
    },
    showSectionWiseResult: {
      type: Boolean,
      default: true,
    },
    shuffleQuestions: {
      type: Boolean,
      default: false,
    },
    shuffleOptions: {
      type: Boolean,
      default: false,
    },

    // Legacy marking fields
    positiveMarks: {
      type: Number,
      default: 4,
    },
    negativeMarks: {
      type: Number,
      default: 1,
    },

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

// Pre-save middleware to calculate totalQuestions and totalMarks
examSchema.pre('save', function(next) {
  // Calculate total questions from sections
  let totalFromSections = 0;
  if (this.sections && this.sections.length > 0) {
    totalFromSections = this.sections.reduce((sum, section) => {
      return sum + (section.questions ? section.questions.length : 0);
    }, 0);
  }

  // Use sections count if available, otherwise use legacy questions array
  this.totalQuestions = totalFromSections > 0 ? totalFromSections : (this.questions ? this.questions.length : 0);

  // Calculate total marks
  this.totalMarks = this.totalQuestions * this.defaultPositiveMarks;

  // Sync legacy marking fields with new fields
  this.positiveMarks = this.defaultPositiveMarks;
  this.negativeMarks = this.defaultNegativeMarks;

  next();
});

// Virtual to check if exam uses sections
examSchema.virtual('hasSections').get(function() {
  return this.sections && this.sections.length > 0;
});

// Virtual to get all questions (from sections or legacy array)
examSchema.virtual('allQuestions').get(function() {
  if (this.sections && this.sections.length > 0) {
    return this.sections.flatMap(section => section.questions);
  }
  return this.questions || [];
});

// Indexes
examSchema.index({ testSeries: 1, order: 1 });
examSchema.index({ isPublished: 1 });

export default mongoose.model<IExam>('Exam', examSchema);
