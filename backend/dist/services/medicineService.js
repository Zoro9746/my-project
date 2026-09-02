"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MedicineService = void 0;
const prisma_1 = require("../config/prisma");
class MedicineService {
    static async getAllMedicines() {
        return prisma_1.prisma.medicine.findMany({
            where: { isActive: true },
            orderBy: { name: 'asc' },
        });
    }
    static async getMedicineById(id) {
        return prisma_1.prisma.medicine.findUnique({
            where: { id },
        });
    }
}
exports.MedicineService = MedicineService;
