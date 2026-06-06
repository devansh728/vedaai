// src/types/api.types.ts

export interface IUserProfile {
  title?: 'Mr.' | 'Ms.' | 'Dr.' | 'Mrs.';
  role?: 'Teacher' | 'Head of Department' | 'Administrator';
  avatarUrl?: string;
}

export interface IInstitution {
  name: string;
  location?: string;
}

export interface IUser {
  _id: string;
  name: string;
  email: string;
  isOnboarded: boolean;
  profile: IUserProfile;
  institution: IInstitution;
  targetGrades: string[];
  primarySubjects: string[];
  createdAt: string;
  updatedAt: string;
}

export interface IQuestion {
  questionText: string;
  difficulty: 'Easy' | 'Moderate' | 'Hard';
  marks: number;
}

export interface ISection {
  sectionName: string;
  instructions: string;
  questions: IQuestion[];
}

export interface IPaperData {
  title: string;
  institutionName: string;
  subject: string;
  className: string;
  timeAllowedMinutes: number;
  totalMarks: number;
  sections: ISection[];
  pdfUrl?: string;
}

export type AssignmentGenerationStatus = 'idle' | 'uploading' | 'pending' | 'processing' | 'completed' | 'failed';

export interface IAssignment {
  _id: string;
  title: string;
  instructions?: string;
  dueDate: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  errorReason?: string;
  rawContextText?: string;
  cacheHash: string;
  groupId?: string;
  createdBy: string;
  paperData: IPaperData | null;
  createdAt: string;
  updatedAt: string;
}

export interface IRosterStudent {
  studentName: string;
  rollNumber: string;
  email?: string;
}

export interface IGroup {
  _id: string;
  name: string;
  subject: string;
  teacherId: string;
  roster: IRosterStudent[];
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  errors?: { field: string; message: string }[];
}
