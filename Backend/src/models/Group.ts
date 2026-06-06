import { Schema, model, Document, Types } from 'mongoose';

export interface IRosterStudent {
  studentName: string;
  rollNumber: string;
  email?: string;
}

export interface IGroup extends Document {
  name: string;
  subject: string;
  teacherId: Types.ObjectId;
  roster: IRosterStudent[];
  createdAt: Date;
  updatedAt: Date;
}

const GroupSchema = new Schema<IGroup>({
  name: { type: String, required: true, trim: true },
  subject: { type: String, required: true, trim: true },
  teacherId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  roster: [{
    studentName: { type: String, required: true },
    rollNumber: { type: String, required: true },
    email: { type: String, lowercase: true, trim: true }
  }]
}, {
  timestamps: true
});

export const Group = model<IGroup>('Group', GroupSchema);
