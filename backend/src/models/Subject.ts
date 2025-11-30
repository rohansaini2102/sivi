import mongoose, { Document, Schema, Types } from 'mongoose';

export interface ISubject extends Document {
  title: string;
  description?: string;
  course: Types.ObjectId;
  order: number;
  chapters: Types.ObjectId[];
  isPublished: boolean;
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
    description: String,
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
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
subjectSchema.index({ course: 1, order: 1 });

export default mongoose.model<ISubject>('Subject', subjectSchema);
