import { Request, Response } from 'express';
import { DoctorScheduleService } from '../services/doctorScheduleService';
import { sendSuccess, sendError } from '../utils/response';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

export class DoctorScheduleController {
  static async getAllDoctors(req: Request, res: Response) {
    try {
      const doctors = await DoctorScheduleService.getAllDoctors();
      return sendSuccess(res, 'Doctors fetched successfully', doctors);
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to fetch doctors', 400);
    }
  }

  static async getDoctorById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const doctor = await DoctorScheduleService.getDoctorById(id);
      return sendSuccess(res, 'Doctor profile fetched successfully', doctor);
    } catch (error: any) {
      return sendError(res, error.message || 'Doctor not found', 404);
    }
  }

  static async getDoctorAvailability(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const date = (req.query.date as string) || new Date().toISOString().split('T')[0];
      const availability = await DoctorScheduleService.getDoctorAvailabilityForDate(id, date);
      return sendSuccess(res, 'Doctor availability slot schedule computed successfully', availability);
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to calculate doctor availability', 400);
    }
  }

  static async updateSchedule(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const updatedSchedule = await DoctorScheduleService.updateDoctorSchedule(id, req.body);
      return sendSuccess(res, 'Doctor working schedule updated', updatedSchedule);
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to update schedule', 400);
    }
  }
}
