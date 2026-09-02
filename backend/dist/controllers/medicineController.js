"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MedicineController = void 0;
const medicineService_1 = require("../services/medicineService");
const response_1 = require("../utils/response");
class MedicineController {
    static async getAllMedicines(req, res) {
        try {
            const medicines = await medicineService_1.MedicineService.getAllMedicines();
            return (0, response_1.sendSuccess)(res, 'Medicine catalog retrieved successfully', medicines);
        }
        catch (error) {
            return (0, response_1.sendError)(res, error.message || 'Failed to fetch medicines', 400);
        }
    }
}
exports.MedicineController = MedicineController;
