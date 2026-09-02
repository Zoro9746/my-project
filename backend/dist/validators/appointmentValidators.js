"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateScheduleSchema = exports.rescheduleAppointmentSchema = exports.bookAppointmentSchema = void 0;
const zod_1 = require("zod");
exports.bookAppointmentSchema = zod_1.z.object({
    doctorId: zod_1.z.string().min(1, 'Doctor selection is required'),
    date: zod_1.z.string().refine((val) => !isNaN(Date.parse(val)), {
        message: 'Invalid appointment date format (expected YYYY-MM-DD)',
    }),
    timeSlot: zod_1.z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, {
        message: 'Invalid time slot format (expected HH:mm)',
    }),
});
exports.rescheduleAppointmentSchema = zod_1.z.object({
    newDate: zod_1.z.string().refine((val) => !isNaN(Date.parse(val)), {
        message: 'Invalid appointment date format (expected YYYY-MM-DD)',
    }),
    newTimeSlot: zod_1.z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, {
        message: 'Invalid time slot format (expected HH:mm)',
    }),
});
exports.updateScheduleSchema = zod_1.z.object({
    dayOfWeek: zod_1.z.number().min(0).max(6),
    startTime: zod_1.z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
    endTime: zod_1.z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
    slotDuration: zod_1.z.number().min(5).max(60).default(15),
    active: zod_1.z.boolean().default(true),
});
