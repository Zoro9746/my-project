"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DoctorScheduleController = void 0;
const doctorScheduleService_1 = require("../services/doctorScheduleService");
const response_1 = require("../utils/response");
class DoctorScheduleController {
    static async getAllDoctors(req, res) {
        try {
            const doctors = await doctorScheduleService_1.DoctorScheduleService.getAllDoctors();
            return (0, response_1.sendSuccess)(res, 'Doctors fetched successfully', doctors);
        }
        catch (error) {
            return (0, response_1.sendError)(res, error.message || 'Failed to fetch doctors', 400);
        }
    }
    static async getDoctorById(req, res) {
        try {
            const { id } = req.params;
            const doctor = await doctorScheduleService_1.DoctorScheduleService.getDoctorById(id);
            return (0, response_1.sendSuccess)(res, 'Doctor profile fetched successfully', doctor);
        }
        catch (error) {
            return (0, response_1.sendError)(res, error.message || 'Doctor not found', 404);
        }
    }
    static async getDoctorAvailability(req, res) {
        try {
            const { id } = req.params;
            const date = req.query.date || new Date().toISOString().split('T')[0];
            const availability = await doctorScheduleService_1.DoctorScheduleService.getDoctorAvailabilityForDate(id, date);
            return (0, response_1.sendSuccess)(res, 'Doctor availability slot schedule computed successfully', availability);
        }
        catch (error) {
            return (0, response_1.sendError)(res, error.message || 'Failed to calculate doctor availability', 400);
        }
    }
    static async updateSchedule(req, res) {
        try {
            const { id } = req.params;
            const updatedSchedule = await doctorScheduleService_1.DoctorScheduleService.updateDoctorSchedule(id, req.body);
            return (0, response_1.sendSuccess)(res, 'Doctor working schedule updated', updatedSchedule);
        }
        catch (error) {
            return (0, response_1.sendError)(res, error.message || 'Failed to update schedule', 400);
        }
    }
}
exports.DoctorScheduleController = DoctorScheduleController;
