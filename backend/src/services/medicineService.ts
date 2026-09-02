import { prisma } from '../config/prisma';

export class MedicineService {
  static async getAllMedicines() {
    return prisma.medicine.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });
  }

  static async getMedicineById(id: string) {
    return prisma.medicine.findUnique({
      where: { id },
    });
  }
}
