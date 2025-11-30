import mongoose, { Document, Schema } from 'mongoose';

export interface IStudentInfo {
  fatherName?: string;
  dateOfBirth?: Date;
  gender?: 'male' | 'female' | 'other';
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  qualification?: string;
  preparingFor?: string[];
}

export interface IUser extends Document {
  name: string;
  email?: string;
  phone?: string;
  password?: string;
  role: 'user' | 'admin' | 'super_admin';
  avatar?: string;
  isVerified: boolean;
  isActive: boolean;
  mustChangePassword: boolean;
  passwordChangedAt?: Date;
  language: 'hi' | 'en';
  preferences: {
    examCategory?: string;
    notifications: boolean;
    darkMode: boolean;
  };
  stats: {
    totalPoints: number;
    coursesCompleted: number;
    testsAttempted: number;
    avgScore: number;
  };
  studentInfo: IStudentInfo;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    email: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    password: {
      type: String,
      select: false,
    },
    mustChangePassword: {
      type: Boolean,
      default: false,
    },
    passwordChangedAt: Date,
    role: {
      type: String,
      enum: ['user', 'admin', 'super_admin'],
      default: 'user',
    },
    avatar: String,
    isVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    language: {
      type: String,
      enum: ['hi', 'en'],
      default: 'hi',
    },
    preferences: {
      examCategory: String,
      notifications: { type: Boolean, default: true },
      darkMode: { type: Boolean, default: false },
    },
    stats: {
      totalPoints: { type: Number, default: 0 },
      coursesCompleted: { type: Number, default: 0 },
      testsAttempted: { type: Number, default: 0 },
      avgScore: { type: Number, default: 0 },
    },
    studentInfo: {
      fatherName: String,
      dateOfBirth: Date,
      gender: {
        type: String,
        enum: ['male', 'female', 'other'],
      },
      address: String,
      city: String,
      state: String,
      pincode: String,
      qualification: String,
      preparingFor: [String],
    },
    lastLogin: Date,
  },
  {
    timestamps: true,
  }
);

// Indexes (email and phone already have unique: true which creates indexes)
userSchema.index({ role: 1 });

export default mongoose.model<IUser>('User', userSchema);
