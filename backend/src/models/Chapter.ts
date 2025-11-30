import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IChapter extends Document {
  title: string;
  description?: string;
  subject: Types.ObjectId;
  order: number;
  lessons: Types.ObjectId[];
  isPublished: boolean;
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
    description: String,
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
chapterSchema.index({ subject: 1, order: 1 });

export default mongoose.model<IChapter>('Chapter', chapterSchema);
