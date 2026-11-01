import { z } from 'zod';

export const updateUserStatusSchema = z.object({
  isActive: z.boolean(),
});

export const adminResetPasswordSchema = z.object({
  newPassword: z.string().min(6, 'New password must be at least 6 characters long'),
});

export const updateDoctorProfileSchema = z.object({
  specialization: z.string().min(2, 'Specialization is required'),
  roomNo: z.string().min(1, 'Room number is required'),
  phone: z.string().optional(),
});

export const updateAdminUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  email: z.string().email('Invalid email address').optional(),
  role: z.enum(['STUDENT', 'DOCTOR', 'PHARMACIST', 'ADMIN']).optional(),
  rollNo: z.string().optional(),
  department: z.string().optional(),
  bloodGroup: z.string().optional(),
  emergencyContact: z.string().optional(),
});
