import { z } from 'zod';

export const dispensePrescriptionSchema = z.object({
  prescriptionId: z.string().min(1, 'Prescription ID is required'),
});

export const addStockInSchema = z.object({
  medicineId: z.string().min(1, 'Medicine ID is required'),
  quantity: z.number().int().positive('Quantity must be a positive integer'),
  referenceNotes: z.string().optional(),
});

export const createMedicineSchema = z.object({
  name: z.string().min(2, 'Medicine name is required'),
  category: z.string().min(2, 'Category is required'),
  unit: z.string().min(1, 'Unit is required'),
  quantity: z.number().int().min(0, 'Initial quantity cannot be negative').default(0),
  expiryDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid expiry date format',
  }),
  reorderLevel: z.number().int().min(0, 'Reorder level cannot be negative').default(10),
});

export const updateMedicineSchema = z.object({
  name: z.string().min(2).optional(),
  category: z.string().min(2).optional(),
  unit: z.string().min(1).optional(),
  reorderLevel: z.number().int().min(0).optional(),
  expiryDate: z.string().optional(),
  isActive: z.boolean().optional(),
});
