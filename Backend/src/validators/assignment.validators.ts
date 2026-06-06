import { z } from 'zod';
import { Types } from 'mongoose';

const objectIdSchema = z.string().refine((val) => {
  return Types.ObjectId.isValid(val);
}, {
  message: 'Invalid database identifier format',
});

export const QuestionConfigSchema = z.object({
  sectionName: z.string().min(1, 'Section name is required'),
  instructions: z.string().min(1, 'Section instructions are required'),
  questionCount: z.number().int().positive('Question count must be at least 1'),
  marksPerQuestion: z.number().positive('Marks per question must be greater than 0'),
  difficulty: z.enum(['Easy', 'Moderate', 'Hard', 'Mixed']),
  topics: z.array(z.string().min(1, 'Topic name cannot be empty')).min(1, 'At least one topic must be specified'),
});

export const CreateAssignmentSchema = z.object({
  title: z.string().min(1, 'Assignment title is required'),
  instructions: z.string().optional(),
  dueDate: z.string().datetime('Due date must be a valid ISO-8601 date-time string').refine((val) => {
    return new Date(val) > new Date();
  }, {
    message: 'Due date must be in the future',
  }),
  groupId: objectIdSchema.optional().nullable(),
  config: z.object({
    subject: z.string().min(1, 'Subject is required'),
    className: z.string().min(1, 'Class name is required'),
    timeAllowedMinutes: z.number().int().positive('Time allowed must be a positive integer'),
    totalMarks: z.number().positive('Total marks must be greater than 0'),
    sections: z.array(QuestionConfigSchema).min(1, 'At least one section is required'),
  }),
});
