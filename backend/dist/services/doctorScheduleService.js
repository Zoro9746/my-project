"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DoctorScheduleService = void 0;
const prisma_1 = require("../config/prisma");
class DoctorScheduleService {
    /**
     * List all active doctors with their user info
     */
    static async getAllDoctors() {
        return prisma_1.prisma.doctor.findMany({
            where: { user: { isActive: true } },
            include: {
                user: {
                    select: { id: true, name: true, email: true, isActive: true },
                },
                schedules: {
                    where: { active: true },
                },
            },
        });
    }
    /**
     * Get specific doctor profile by ID
     */
    static async getDoctorById(doctorId) {
        const doctor = await prisma_1.prisma.doctor.findUnique({
            where: { id: doctorId },
            include: {
                user: {
                    select: { id: true, name: true, email: true, isActive: true },
                },
                schedules: true,
            },
        });
        if (!doctor) {
            throw new Error('Doctor not found');
        }
        return doctor;
    }
    /**
     * Calculate doctor slot availability for a specific date (YYYY-MM-DD)
     */
    static async getDoctorAvailabilityForDate(doctorId, dateStr) {
        const targetDate = new Date(dateStr);
        if (isNaN(targetDate.getTime())) {
            throw new Error('Invalid date parameter format');
        }
        // Determine day of week (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
        const dayOfWeek = targetDate.getUTCDay();
        // Fetch doctor schedule for this day of week
        const schedule = await prisma_1.prisma.doctorSchedule.findFirst({
            where: {
                doctorId,
                dayOfWeek,
                active: true,
            },
        });
        if (!schedule) {
            return {
                doctorId,
                date: dateStr,
                dayOfWeek,
                isWorkingDay: false,
                slots: [],
                message: 'Doctor is not available on this day of the week.',
            };
        }
        // Generate time slots (HH:mm) between startTime and endTime
        const slots = [];
        const [startHour, startMin] = schedule.startTime.split(':').map(Number);
        const [endHour, endMin] = schedule.endTime.split(':').map(Number);
        let current = new Date(targetDate);
        current.setUTCHours(startHour, startMin, 0, 0);
        const end = new Date(targetDate);
        end.setUTCHours(endHour, endMin, 0, 0);
        const now = new Date();
        // Query existing non-cancelled appointments for this doctor on targetDate
        const startOfDay = new Date(dateStr);
        startOfDay.setUTCHours(0, 0, 0, 0);
        const endOfDay = new Date(dateStr);
        endOfDay.setUTCHours(23, 59, 59, 999);
        const existingAppointments = await prisma_1.prisma.appointment.findMany({
            where: {
                doctorId,
                date: {
                    gte: startOfDay,
                    lte: endOfDay,
                },
                status: {
                    in: ['PENDING', 'CONFIRMED', 'COMPLETED'],
                },
            },
            include: {
                student: {
                    include: {
                        user: { select: { name: true } },
                    },
                },
            },
        });
        const bookedSlotsMap = new Map();
        existingAppointments.forEach((app) => {
            bookedSlotsMap.set(app.timeSlot, app.student.user.name);
        });
        while (current < end) {
            const hoursStr = String(current.getUTCHours()).padStart(2, '0');
            const minsStr = String(current.getUTCMinutes()).padStart(2, '0');
            const timeSlot = `${hoursStr}:${minsStr}`;
            // Check if slot is in the past
            const slotDateTime = new Date(targetDate);
            slotDateTime.setUTCHours(current.getUTCHours(), current.getUTCMinutes(), 0, 0);
            const isPast = slotDateTime.getTime() < now.getTime();
            const isBooked = bookedSlotsMap.has(timeSlot);
            slots.push({
                timeSlot,
                isBooked,
                isPast,
                bookedByStudentName: isBooked ? bookedSlotsMap.get(timeSlot) : undefined,
            });
            // Increment by slot duration
            current.setUTCMinutes(current.getUTCMinutes() + schedule.slotDuration);
        }
        return {
            doctorId,
            date: dateStr,
            dayOfWeek,
            isWorkingDay: true,
            slotDuration: schedule.slotDuration,
            workingHours: `${schedule.startTime} - ${schedule.endTime}`,
            slots,
        };
    }
    /**
     * Set or update doctor schedule for a day of week
     */
    static async updateDoctorSchedule(doctorId, data) {
        const existing = await prisma_1.prisma.doctorSchedule.findFirst({
            where: { doctorId, dayOfWeek: data.dayOfWeek },
        });
        if (existing) {
            return prisma_1.prisma.doctorSchedule.update({
                where: { id: existing.id },
                data: {
                    startTime: data.startTime,
                    endTime: data.endTime,
                    slotDuration: data.slotDuration,
                    active: data.active,
                },
            });
        }
        return prisma_1.prisma.doctorSchedule.create({
            data: {
                doctorId,
                dayOfWeek: data.dayOfWeek,
                startTime: data.startTime,
                endTime: data.endTime,
                slotDuration: data.slotDuration,
                active: data.active,
            },
        });
    }
}
exports.DoctorScheduleService = DoctorScheduleService;
