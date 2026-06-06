import { Schema, model, Document, Types } from 'mongoose';

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

export interface IAssignment extends Document {
  title: string;
  instructions?: string;
  dueDate: Date;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  errorReason?: string;
  rawContextText?: string;
  cacheHash: string;
  groupId?: Types.ObjectId;
  createdBy: Types.ObjectId;
  paperData: IPaperData | null;
  createdAt: Date;
  updatedAt: Date;
}

const AssignmentSchema = new Schema<IAssignment>({
  title: { type: String, required: true, trim: true },
  instructions: { type: String, trim: true },
  dueDate: { type: Date, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'processing', 'completed', 'failed'], 
    default: 'pending',
    index: true
  },
  errorReason: { type: String },
  rawContextText: { type: String },
  cacheHash: { type: String, required: true, index: true },
  groupId: { type: Schema.Types.ObjectId, ref: 'Group', default: null },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  paperData: {
    title: { type: String },
    institutionName: { type: String },
    subject: { type: String },
    className: { type: String },
    timeAllowedMinutes: { type: Number },
    totalMarks: { type: Number },
    pdfUrl: { type: String },
    sections: [{
      sectionName: { type: String },
      instructions: { type: String },
      questions: [{
        questionText: { type: String },
        difficulty: { type: String, enum: ['Easy', 'Moderate', 'Hard'] },
        marks: { type: Number }
      }]
    }]
  }
}, {
  timestamps: true
});

export const Assignment = model<IAssignment>('Assignment', AssignmentSchema);
