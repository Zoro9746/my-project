"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppointmentController = void 0;
const appointmentService_1 = require("../services/appointmentService");
const response_1 = require("../utils/response");
class AppointmentController {
    static async bookAppointment(req, res) {
        try {
            if (!req.user)
                return (0, response_1.sendError)(res, 'Unauthenticated', 401);
            const appointment = await appointmentService_1.AppointmentService.bookAppointment(req.user.id, req.body);
            return (0, response_1.sendSuccess)(res, `Appointment booked successfully! Token #${appointment.tokenNo}`, appointment, 201);
        }
        catch (error) {
            return (0, response_1.sendError)(res, error.message || 'Failed to book appointment', 400);
        }
    }
    static async getAppointments(req, res) {
        try {
            if (!req.user)
                return (0, response_1.sendError)(res, 'Unauthenticated', 401);
            const filters = {
                date: req.query.date,
                status: req.query.status,
            };
            const appointments = await appointmentService_1.AppointmentService.getAppointments(req.user, filters);
            return (0, response_1.sendSuccess)(res, 'Appointments retrieved successfully', appointments);
        }
        catch (error) {
            return (0, response_1.sendError)(res, error.message || 'Failed to retrieve appointments', 400);
        }
    }
    static async cancelAppointment(req, res) {
        try {
            if (!req.user)
                return (0, response_1.sendError)(res, 'Unauthenticated', 401);
            const { id } = req.params;
            const cancelled = await appointmentService_1.AppointmentService.cancelAppointment(req.user.id, req.user.role, id);
            return (0, response_1.sendSuccess)(res, 'Appointment cancelled successfully. Slot has been freed.', cancelled);
        }
        catch (error) {
            return (0, response_1.sendError)(res, error.message || 'Failed to cancel appointment', 400);
        }
    }
    static async rescheduleAppointment(req, res) {
        try {
            if (!req.user)
                return (0, response_1.sendError)(res, 'Unauthenticated', 401);
            const { id } = req.params;
            const { newDate, newTimeSlot } = req.body;
            const rescheduled = await appointmentService_1.AppointmentService.rescheduleAppointment(req.user.id, req.user.role, id, newDate, newTimeSlot);
            return (0, response_1.sendSuccess)(res, `Appointment rescheduled to ${newDate} at ${newTimeSlot}. New Token #${rescheduled.tokenNo}`, rescheduled);
        }
        catch (error) {
            return (0, response_1.sendError)(res, error.message || 'Failed to reschedule appointment', 400);
        }
    }
    static async getDoctorTodayQueue(req, res) {
        try {
            if (!req.user)
                return (0, response_1.sendError)(res, 'Unauthenticated', 401);
            const queueData = await appointmentService_1.AppointmentService.getDoctorTodayQueue(req.user.id);
            return (0, response_1.sendSuccess)(res, "Today's doctor appointment queue fetched successfully", queueData);
        }
        catch (error) {
            return (0, response_1.sendError)(res, error.message || 'Failed to fetch doctor queue', 400);
        }
    }
}
exports.AppointmentController = AppointmentController;
