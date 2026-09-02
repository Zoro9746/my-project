import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { AppointmentService } from '../services/appointmentService';
import { sendSuccess, sendError } from '../utils/response';

export class AppointmentController {
  static async bookAppointment(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) return sendError(res, 'Unauthenticated', 401);
      const appointment = await AppointmentService.bookAppointment(req.user.id, req.body);
      return sendSuccess(res, `Appointment booked successfully! Token #${appointment.tokenNo}`, appointment, 201);
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to book appointment', 400);
    }
  }

  static async getAppointments(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) return sendError(res, 'Unauthenticated', 401);
      const filters = {
        date: req.query.date as string | undefined,
        status: req.query.status as string | undefined,
      };
      const appointments = await AppointmentService.getAppointments(req.user, filters);
      return sendSuccess(res, 'Appointments retrieved successfully', appointments);
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to retrieve appointments', 400);
    }
  }

  static async cancelAppointment(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) return sendError(res, 'Unauthenticated', 401);
      const { id } = req.params;
      const cancelled = await AppointmentService.cancelAppointment(req.user.id, req.user.role, id);
      return sendSuccess(res, 'Appointment cancelled successfully. Slot has been freed.', cancelled);
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to cancel appointment', 400);
    }
  }

  static async rescheduleAppointment(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) return sendError(res, 'Unauthenticated', 401);
      const { id } = req.params;
      const { newDate, newTimeSlot } = req.body;
      const rescheduled = await AppointmentService.rescheduleAppointment(
        req.user.id,
        req.user.role,
        id,
        newDate,
        newTimeSlot
      );
      return sendSuccess(res, `Appointment rescheduled to ${newDate} at ${newTimeSlot}. New Token #${rescheduled.tokenNo}`, rescheduled);
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to reschedule appointment', 400);
    }
  }

  static async getDoctorTodayQueue(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) return sendError(res, 'Unauthenticated', 401);
      const queueData = await AppointmentService.getDoctorTodayQueue(req.user.id);
      return sendSuccess(res, "Today's doctor appointment queue fetched successfully", queueData);
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to fetch doctor queue', 400);
    }
  }
}
