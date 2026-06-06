import { z } from 'zod';

export const RegisterSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters long').max(100),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
});

export const LoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const OnboardSchema = z.object({
  profile: z.object({
    title: z.enum(['Mr.', 'Ms.', 'Dr.', 'Mrs.']),
    role: z.enum(['Teacher', 'Head of Department', 'Administrator']),
    avatarUrl: z.string().url().or(z.literal('')).optional(),
  }),
  institution: z.object({
    name: z.string().min(1, 'Institution name is required'),
    location: z.string().optional(),
  }),
  targetGrades: z.array(z.string()).min(1, 'Select at least one target grade'),
  primarySubjects: z.array(z.string()).min(1, 'Select at least one primary subject'),
});
