"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.completeConsultationSchema = void 0;
const zod_1 = require("zod");
exports.completeConsultationSchema = zod_1.z.object({
    appointmentId: zod_1.z.string().min(1, 'Appointment ID is required'),
    symptoms: zod_1.z.string().min(2, 'Symptoms description is required'),
    diagnosis: zod_1.z.string().min(2, 'Diagnosis is required'),
    notes: zod_1.z.string().optional(),
    prescriptionItems: zod_1.z
        .array(zod_1.z.object({
        medicineId: zod_1.z.string().min(1, 'Medicine selection is required'),
        quantity: zod_1.z.number().int().positive('Quantity must be a positive integer'),
        dosageInstructions: zod_1.z.string().min(2, 'Dosage instructions are required'),
    }))
        .optional()
        .default([]),
});
