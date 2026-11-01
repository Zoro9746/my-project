import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { StockService } from '../services/stockService';
import { sendSuccess, sendError } from '../utils/response';

export class StockController {
  static async dispensePrescription(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) return sendError(res, 'Unauthenticated', 401);
      const { prescriptionId } = req.body;
      const result = await StockService.dispensePrescription(req.user.id, prescriptionId);
      return sendSuccess(res, 'Prescription dispensed and medicine stock updated successfully', result);
    } catch (error: any) {
      return sendError(res, error.message || 'Dispensation failed', 400);
    }
  }

  static async addStockIn(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) return sendError(res, 'Unauthenticated', 401);
      const result = await StockService.addStockIn(req.user.id, req.body);
      return sendSuccess(res, 'Inward stock added and transaction logged successfully', result, 201);
    } catch (error: any) {
      return sendError(res, error.message || 'Stock Inward failed', 400);
    }
  }

  static async getStockTransactions(req: AuthenticatedRequest, res: Response) {
    try {
      const filters = {
        medicineId: req.query.medicineId as string | undefined,
        type: req.query.type as string | undefined,
      };
      const transactions = await StockService.getStockTransactions(filters);
      return sendSuccess(res, 'Stock transaction audit logs retrieved', transactions);
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to fetch stock transactions', 400);
    }
  }

  static async getStockAlerts(req: AuthenticatedRequest, res: Response) {
    try {
      const alerts = await StockService.getStockAlerts();
      return sendSuccess(res, 'Stock and expiry alerts calculated successfully', alerts);
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to fetch stock alerts', 400);
    }
  }
}
