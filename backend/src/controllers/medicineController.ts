import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { MedicineService } from '../services/medicineService';
import { sendSuccess, sendError } from '../utils/response';

export class MedicineController {
  static async getAllMedicines(req: Request, res: Response) {
    try {
      const categoryFilter = req.query.category as string | undefined;
      const medicines = await MedicineService.getAllMedicines(categoryFilter);
      return sendSuccess(res, 'Medicine catalog retrieved successfully', medicines);
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to fetch medicines', 400);
    }
  }

  static async getMedicineById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const medicine = await MedicineService.getMedicineById(id);
      return sendSuccess(res, 'Medicine details retrieved successfully', medicine);
    } catch (error: any) {
      return sendError(res, error.message || 'Medicine not found', 404);
    }
  }

  static async createMedicine(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) return sendError(res, 'Unauthenticated', 401);
      const medicine = await MedicineService.createMedicine(req.user.id, req.body);
      return sendSuccess(res, 'Medicine added to catalog successfully', medicine, 201);
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to create medicine', 400);
    }
  }

  static async updateMedicine(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const updated = await MedicineService.updateMedicine(id, req.body);
      return sendSuccess(res, 'Medicine updated successfully', updated);
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to update medicine', 400);
    }
  }
}
