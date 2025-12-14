import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IComprehensionPassage extends Document {
  title: string;
  titleHi?: string;

  // Passage content (rich text)
  passage: string;
  passageHi?: string;

  // Optional image with passage
  imageUrl?: string;

  // Linked questions (comprehension type questions that reference this passage)
  questions: Types.ObjectId[];

  // Categorization
  examCategory: string;
  subject?: string;
  topic?: string;
  tags: string[];

  // Status
  isActive: boolean;

  // Metadata
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const comprehensionPassageSchema = new Schema<IComprehensionPassage>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
    titleHi: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    passage: {
      type: String,
      required: true,
    },
    passageHi: String,
    imageUrl: String,
    questions: [{
      type: Schema.Types.ObjectId,
      ref: 'Question',
    }],
    examCategory: {
      type: String,
      required: true,
      enum: ['RAS', 'REET', 'PATWAR', 'POLICE', 'RPSC', 'OTHER'],
    },
    subject: String,
    topic: String,
    tags: [String],
    isActive: {
      type: Boolean,
      default: true,
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

// Virtual for question count
comprehensionPassageSchema.virtual('questionCount').get(function() {
  return this.questions ? this.questions.length : 0;
});

// Indexes
comprehensionPassageSchema.index({ examCategory: 1 });
comprehensionPassageSchema.index({ subject: 1 });
comprehensionPassageSchema.index({ tags: 1 });
comprehensionPassageSchema.index({ isActive: 1 });
comprehensionPassageSchema.index({ createdBy: 1 });

export default mongoose.model<IComprehensionPassage>('ComprehensionPassage', comprehensionPassageSchema);
