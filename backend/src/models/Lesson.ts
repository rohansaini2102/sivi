import mongoose, { Document, Schema, Types } from 'mongoose';

export interface ILesson extends Document {
  title: string;
  type: 'notes' | 'pdf' | 'quiz';
  chapter: Types.ObjectId;
  order: number;
  content?: string; // Rich text for notes
  pdfUrl?: string;
  quiz?: Types.ObjectId;
  duration: number; // in minutes
  isFree: boolean;
  isPublished: boolean;
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
    type: {
      type: String,
      enum: ['notes', 'pdf', 'quiz'],
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
    content: String,
    pdfUrl: String,
    quiz: {
      type: Schema.Types.ObjectId,
      ref: 'Quiz',
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
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
lessonSchema.index({ chapter: 1, order: 1 });

export default mongoose.model<ILesson>('Lesson', lessonSchema);
