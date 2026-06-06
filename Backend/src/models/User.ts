import { Schema, model, Document } from 'mongoose';

export interface IUserProfile {
  title?: 'Mr.' | 'Ms.' | 'Dr.' | 'Mrs.';
  role?: 'Teacher' | 'Head of Department' | 'Administrator';
  avatarUrl?: string;
}

export interface IInstitution {
  name: string;
  location?: string;
}

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  isOnboarded: boolean;
  profile: IUserProfile;
  institution: IInstitution;
  targetGrades: string[];
  primarySubjects: string[];
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true, trim: true },
  email: { 
    type: String, 
    required: true, 
    unique: true, 
    lowercase: true, 
    trim: true,
    index: true 
  },
  passwordHash: { type: String, required: true },
  isOnboarded: { type: Boolean, default: false },
  profile: {
    title: { type: String, enum: ['Mr.', 'Ms.', 'Dr.', 'Mrs.'] },
    role: { type: String, enum: ['Teacher', 'Head of Department', 'Administrator'] },
    avatarUrl: { type: String, default: '' }
  },
  institution: {
    name: { type: String, default: '' },
    location: { type: String, default: '' }
  },
  targetGrades: [{ type: String }],
  primarySubjects: [{ type: String }]
}, {
  timestamps: true
});

export const User = model<IUser>('User', UserSchema);
