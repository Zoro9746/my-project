import { z } from 'zod';

export const bookAppointmentSchema = z.object({
  doctorId: z.string().min(1, 'Doctor selection is required'),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid appointment date format (expected YYYY-MM-DD)',
  }),
  timeSlot: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'Invalid time slot format (expected HH:mm)',
  }),
});

export const rescheduleAppointmentSchema = z.object({
  newDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid appointment date format (expected YYYY-MM-DD)',
  }),
  newTimeSlot: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'Invalid time slot format (expected HH:mm)',
  }),
});

export const updateScheduleSchema = z.object({
  dayOfWeek: z.number().min(0).max(6),
  startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
  endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
  slotDuration: z.number().min(5).max(60).default(15),
  active: z.boolean().default(true),
});
