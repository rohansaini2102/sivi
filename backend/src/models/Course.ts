import mongoose, { Document, Schema, Types } from 'mongoose';

export interface ICourse extends Document {
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
  level: 'beginner' | 'intermediate' | 'advanced';
  features: string[];
  isFree: boolean;
  isPublished: boolean;
  isFeatured: boolean;
  subjects: Types.ObjectId[];
  totalLessons: number;
  totalDuration: number;
  enrollmentCount: number;
  rating: number;
  ratingCount: number;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const courseSchema = new Schema<ICourse>(
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
      default: 365,
    },
    language: {
      type: String,
      enum: ['hi', 'en', 'both'],
      default: 'both',
    },
    level: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner',
    },
    features: [String],
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
    subjects: [{
      type: Schema.Types.ObjectId,
      ref: 'Subject',
    }],
    totalLessons: {
      type: Number,
      default: 0,
    },
    totalDuration: {
      type: Number,
      default: 0,
    },
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
courseSchema.index({ slug: 1 });
courseSchema.index({ examCategory: 1 });
courseSchema.index({ isPublished: 1 });
courseSchema.index({ price: 1 });

export default mongoose.model<ICourse>('Course', courseSchema);
