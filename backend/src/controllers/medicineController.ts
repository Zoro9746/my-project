import { Request, Response } from 'express';
import { MedicineService } from '../services/medicineService';
import { sendSuccess, sendError } from '../utils/response';

export class MedicineController {
  static async getAllMedicines(req: Request, res: Response) {
    try {
      const medicines = await MedicineService.getAllMedicines();
      return sendSuccess(res, 'Medicine catalog retrieved successfully', medicines);
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to fetch medicines', 400);
    }
  }
}
