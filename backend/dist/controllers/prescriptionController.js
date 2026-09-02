"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrescriptionController = void 0;
const prescriptionService_1 = require("../services/prescriptionService");
const response_1 = require("../utils/response");
class PrescriptionController {
    static async getAllPrescriptions(req, res) {
        try {
            if (!req.user)
                return (0, response_1.sendError)(res, 'Unauthenticated', 401);
            const statusFilter = req.query.status;
            const prescriptions = await prescriptionService_1.PrescriptionService.getAllPrescriptions(req.user, statusFilter);
            return (0, response_1.sendSuccess)(res, 'Prescriptions retrieved successfully', prescriptions);
        }
        catch (error) {
            return (0, response_1.sendError)(res, error.message || 'Failed to retrieve prescriptions', 400);
        }
    }
    static async getPrescriptionById(req, res) {
        try {
            const { id } = req.params;
            const prescription = await prescriptionService_1.PrescriptionService.getPrescriptionById(id);
            return (0, response_1.sendSuccess)(res, 'Prescription details fetched successfully', prescription);
        }
        catch (error) {
            return (0, response_1.sendError)(res, error.message || 'Prescription not found', 404);
        }
    }
}
exports.PrescriptionController = PrescriptionController;
