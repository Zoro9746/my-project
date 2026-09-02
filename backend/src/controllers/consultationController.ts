import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { ConsultationService } from '../services/consultationService';
import { sendSuccess, sendError } from '../utils/response';

export class ConsultationController {
  static async completeConsultation(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) return sendError(res, 'Unauthenticated', 401);
      const result = await ConsultationService.completeConsultation(req.user.id, req.body);
      return sendSuccess(res, 'Consultation completed and prescription issued successfully', result, 201);
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to complete consultation', 400);
    }
  }

  static async getPatientHistory(req: AuthenticatedRequest, res: Response) {
    try {
      const { studentId } = req.params;
      const history = await ConsultationService.getPatientMedicalHistory(studentId);
      return sendSuccess(res, 'Patient medical history retrieved successfully', history);
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to fetch patient history', 400);
    }
  }

  static async searchPatients(req: AuthenticatedRequest, res: Response) {
    try {
      const query = (req.query.q as string) || '';
      const patients = await ConsultationService.searchPatients(query);
      return sendSuccess(res, 'Patients found', patients);
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to search patients', 400);
    }
  }

  static async getMyMedicalHistory(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) return sendError(res, 'Unauthenticated', 401);
      // Fetch student profile id for current logged in user
      const student = await ConsultationService.searchPatients(req.user.email);
      if (!student || student.length === 0) {
        return sendError(res, 'Student profile record not found', 404);
      }
      const history = await ConsultationService.getPatientMedicalHistory(student[0].id);
      return sendSuccess(res, 'Your medical history retrieved successfully', history);
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to fetch medical history', 400);
    }
  }
}
