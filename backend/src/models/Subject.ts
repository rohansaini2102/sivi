import mongoose, { Document, Schema, Types } from 'mongoose';

export interface ISubject extends Document {
  title: string;
  titleHi?: string;
  description?: string;
  descriptionHi?: string;
  icon?: string;
  course: Types.ObjectId;
  order: number;
  chapters: Types.ObjectId[];
  isPublished: boolean;
  // Stats (denormalized for performance)
  totalChapters: number;
  totalLessons: number;
  createdAt: Date;
  updatedAt: Date;
}

const subjectSchema = new Schema<ISubject>(
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
    icon: {
      type: String,
      maxlength: 50,
    },
    course: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    order: {
      type: Number,
      default: 0,
    },
    chapters: [{
      type: Schema.Types.ObjectId,
      ref: 'Chapter',
    }],
    isPublished: {
      type: Boolean,
      default: true,
    },
    totalChapters: {
      type: Number,
      default: 0,
    },
    totalLessons: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
subjectSchema.index({ course: 1, order: 1 });
subjectSchema.index({ course: 1, isPublished: 1 });

export default mongoose.model<ISubject>('Subject', subjectSchema);
