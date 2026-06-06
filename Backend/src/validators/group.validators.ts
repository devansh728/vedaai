import { z } from 'zod';

export const StudentRosterSchema = z.object({
  studentName: z.string().min(1, 'Student name is required'),
  rollNumber: z.string().min(1, 'Roll number is required'),
  email: z.string().email('Invalid student email address').optional().or(z.literal('')),
});

export const CreateGroupSchema = z.object({
  name: z.string().min(1, 'Group/Class name is required'),
  subject: z.string().min(1, 'Subject is required'),
  roster: z.array(StudentRosterSchema).default([]),
});

export const AddStudentSchema = StudentRosterSchema;
