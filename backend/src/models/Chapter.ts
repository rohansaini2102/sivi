import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IChapter extends Document {
  title: string;
  titleHi?: string;
  description?: string;
  descriptionHi?: string;
  course: Types.ObjectId;
  subject: Types.ObjectId;
  order: number;
  lessons: Types.ObjectId[];
  isFree: boolean;
  isPublished: boolean;
  // Stats (denormalized)
  totalLessons: number;
  totalQuizzes: number;
  createdAt: Date;
  updatedAt: Date;
}

const chapterSchema = new Schema<IChapter>(
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
    description: {
      type: String,
      maxlength: 1000,
    },
    descriptionHi: {
      type: String,
      maxlength: 1000,
    },
    course: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    subject: {
      type: Schema.Types.ObjectId,
      ref: 'Subject',
      required: true,
    },
    order: {
      type: Number,
      default: 0,
    },
    lessons: [{
      type: Schema.Types.ObjectId,
      ref: 'Lesson',
    }],
    isFree: {
      type: Boolean,
      default: false,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    totalLessons: {
      type: Number,
      default: 0,
    },
    totalQuizzes: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
chapterSchema.index({ subject: 1, order: 1 });
chapterSchema.index({ course: 1 });
chapterSchema.index({ subject: 1, isPublished: 1 });

export default mongoose.model<IChapter>('Chapter', chapterSchema);
