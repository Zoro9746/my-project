"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConsultationController = void 0;
const consultationService_1 = require("../services/consultationService");
const response_1 = require("../utils/response");
class ConsultationController {
    static async completeConsultation(req, res) {
        try {
            if (!req.user)
                return (0, response_1.sendError)(res, 'Unauthenticated', 401);
            const result = await consultationService_1.ConsultationService.completeConsultation(req.user.id, req.body);
            return (0, response_1.sendSuccess)(res, 'Consultation completed and prescription issued successfully', result, 201);
        }
        catch (error) {
            return (0, response_1.sendError)(res, error.message || 'Failed to complete consultation', 400);
        }
    }
    static async getPatientHistory(req, res) {
        try {
            const { studentId } = req.params;
            const history = await consultationService_1.ConsultationService.getPatientMedicalHistory(studentId);
            return (0, response_1.sendSuccess)(res, 'Patient medical history retrieved successfully', history);
        }
        catch (error) {
            return (0, response_1.sendError)(res, error.message || 'Failed to fetch patient history', 400);
        }
    }
    static async searchPatients(req, res) {
        try {
            const query = req.query.q || '';
            const patients = await consultationService_1.ConsultationService.searchPatients(query);
            return (0, response_1.sendSuccess)(res, 'Patients found', patients);
        }
        catch (error) {
            return (0, response_1.sendError)(res, error.message || 'Failed to search patients', 400);
        }
    }
    static async getMyMedicalHistory(req, res) {
        try {
            if (!req.user)
                return (0, response_1.sendError)(res, 'Unauthenticated', 401);
            // Fetch student profile id for current logged in user
            const student = await consultationService_1.ConsultationService.searchPatients(req.user.email);
            if (!student || student.length === 0) {
                return (0, response_1.sendError)(res, 'Student profile record not found', 404);
            }
            const history = await consultationService_1.ConsultationService.getPatientMedicalHistory(student[0].id);
            return (0, response_1.sendSuccess)(res, 'Your medical history retrieved successfully', history);
        }
        catch (error) {
            return (0, response_1.sendError)(res, error.message || 'Failed to fetch medical history', 400);
        }
    }
}
exports.ConsultationController = ConsultationController;
