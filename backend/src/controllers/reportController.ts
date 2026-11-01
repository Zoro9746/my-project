import { Request, Response } from 'express';
import { ReportService } from '../services/reportService';
import { sendSuccess, sendError } from '../utils/response';

export class ReportController {
  static async getAppointmentSummaryReport(req: Request, res: Response) {
    try {
      const { startDate, endDate } = req.query as { startDate?: string; endDate?: string };
      const report = await ReportService.getAppointmentSummaryReport(startDate, endDate);
      return sendSuccess(res, 'Appointment summary report generated', report);
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to generate appointment report', 400);
    }
  }

  static async getMedicationConsumptionReport(req: Request, res: Response) {
    try {
      const { startDate, endDate } = req.query as { startDate?: string; endDate?: string };
      const report = await ReportService.getMedicationConsumptionReport(startDate, endDate);
      return sendSuccess(res, 'Medication consumption report generated', report);
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to generate medication report', 400);
    }
  }

  static async getStockAndExpiryReport(req: Request, res: Response) {
    try {
      const report = await ReportService.getStockAndExpiryReport();
      return sendSuccess(res, 'Stock and expiry report generated', report);
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to generate stock report', 400);
    }
  }

  static async getPatientVisitsReport(req: Request, res: Response) {
    try {
      const { startDate, endDate } = req.query as { startDate?: string; endDate?: string };
      const report = await ReportService.getPatientVisitsReport(startDate, endDate);
      return sendSuccess(res, 'Patient visits history report generated', report);
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to generate patient visits report', 400);
    }
  }
}
