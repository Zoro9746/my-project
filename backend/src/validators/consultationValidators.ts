import { z } from 'zod';

export const completeConsultationSchema = z.object({
  appointmentId: z.string().min(1, 'Appointment ID is required'),
  symptoms: z.string().min(2, 'Symptoms description is required'),
  diagnosis: z.string().min(2, 'Diagnosis is required'),
  notes: z.string().optional(),
  prescriptionItems: z
    .array(
      z.object({
        medicineId: z.string().min(1, 'Medicine selection is required'),
        quantity: z.number().int().positive('Quantity must be a positive integer'),
        dosageInstructions: z.string().min(2, 'Dosage instructions are required'),
      })
    )
    .optional()
    .default([]),
});
