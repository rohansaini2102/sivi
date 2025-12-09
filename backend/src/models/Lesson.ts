import mongoose, { Document, Schema, Types } from 'mongoose';

export interface ILesson extends Document {
  title: string;
  titleHi?: string;
  type: 'notes' | 'pdf' | 'quiz';
  course: Types.ObjectId;
  subject: Types.ObjectId;
  chapter: Types.ObjectId;
  order: number;
  duration: number; // estimated minutes
  isFree: boolean;
  isPublished: boolean;

  // For notes type
  content?: string; // HTML from TipTap
  contentHi?: string;

  // For PDF type
  pdfUrl?: string;
  pdfName?: string;
  pdfSize?: number; // bytes
  pdfPages?: number;
  allowDownload: boolean;

  // For quiz type
  quiz?: Types.ObjectId;

  createdAt: Date;
  updatedAt: Date;
}

const lessonSchema = new Schema<ILesson>(
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
    type: {
      type: String,
      enum: ['notes', 'pdf', 'quiz'],
      required: true,
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
    chapter: {
      type: Schema.Types.ObjectId,
      ref: 'Chapter',
      required: true,
    },
    order: {
      type: Number,
      default: 0,
    },
    duration: {
      type: Number,
      default: 10,
    },
    isFree: {
      type: Boolean,
      default: false,
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
    // Notes content
    content: String,
    contentHi: String,
    // PDF fields
    pdfUrl: String,
    pdfName: String,
    pdfSize: Number,
    pdfPages: Number,
    allowDownload: {
      type: Boolean,
      default: true,
    },
    // Quiz reference
    quiz: {
      type: Schema.Types.ObjectId,
      ref: 'Quiz',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
lessonSchema.index({ chapter: 1, order: 1 });
lessonSchema.index({ course: 1 });
lessonSchema.index({ subject: 1 });
lessonSchema.index({ type: 1 });

export default mongoose.model<ILesson>('Lesson', lessonSchema);
