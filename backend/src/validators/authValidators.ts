import { z } from 'zod';

export const registerStudentSchema = z.object({
  email: z.string().email('Invalid email address format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(2, 'Name is required'),
  rollNo: z.string().min(3, 'Roll number is required'),
  department: z.string().min(2, 'Department is required'),
  bloodGroup: z.string().min(1, 'Blood group is required'),
  allergies: z.string().optional(),
  emergencyContact: z.string().min(5, 'Emergency contact is required'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address format'),
  password: z.string().min(1, 'Password is required'),
});

export const updateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  department: z.string().optional(),
  bloodGroup: z.string().optional(),
  allergies: z.string().optional(),
  emergencyContact: z.string().optional(),
  specialization: z.string().optional(),
  roomNo: z.string().optional(),
  phone: z.string().optional(),
});
