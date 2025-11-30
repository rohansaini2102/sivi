import mongoose, { Document, Schema, Types } from 'mongoose';

export interface ITestSeries extends Document {
  title: string;
  slug: string;
  description: string;
  shortDescription: string;
  thumbnail: string;
  examCategory: string;
  price: number;
  discountPrice?: number;
  validityDays: number;
  language: 'hi' | 'en' | 'both';
  features: string[];
  totalExams: number;
  freeExams: number;
  isFree: boolean;
  isPublished: boolean;
  isFeatured: boolean;
  exams: Types.ObjectId[];
  enrollmentCount: number;
  rating: number;
  ratingCount: number;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const testSeriesSchema = new Schema<ITestSeries>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: true,
    },
    shortDescription: {
      type: String,
      maxlength: 300,
    },
    thumbnail: String,
    examCategory: {
      type: String,
      required: true,
      enum: ['RAS', 'REET', 'PATWAR', 'POLICE', 'RPSC', 'OTHER'],
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    discountPrice: {
      type: Number,
      min: 0,
    },
    validityDays: {
      type: Number,
      default: 180,
    },
    language: {
      type: String,
      enum: ['hi', 'en', 'both'],
      default: 'both',
    },
    features: [String],
    totalExams: {
      type: Number,
      default: 0,
    },
    freeExams: {
      type: Number,
      default: 0,
    },
    isFree: {
      type: Boolean,
      default: false,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    exams: [{
      type: Schema.Types.ObjectId,
      ref: 'Exam',
    }],
    enrollmentCount: {
      type: Number,
      default: 0,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    ratingCount: {
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
testSeriesSchema.index({ slug: 1 });
testSeriesSchema.index({ examCategory: 1 });
testSeriesSchema.index({ isPublished: 1 });

export default mongoose.model<ITestSeries>('TestSeries', testSeriesSchema);
