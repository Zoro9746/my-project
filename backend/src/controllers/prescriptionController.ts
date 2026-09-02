import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { PrescriptionService } from '../services/prescriptionService';
import { sendSuccess, sendError } from '../utils/response';

export class PrescriptionController {
  static async getAllPrescriptions(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) return sendError(res, 'Unauthenticated', 401);
      const statusFilter = req.query.status as string | undefined;
      const prescriptions = await PrescriptionService.getAllPrescriptions(req.user, statusFilter);
      return sendSuccess(res, 'Prescriptions retrieved successfully', prescriptions);
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to retrieve prescriptions', 400);
    }
  }

  static async getPrescriptionById(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const prescription = await PrescriptionService.getPrescriptionById(id);
      return sendSuccess(res, 'Prescription details fetched successfully', prescription);
    } catch (error: any) {
      return sendError(res, error.message || 'Prescription not found', 404);
    }
  }
}
