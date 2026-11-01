import { prisma } from '../config/prisma';

export class MedicineService {
  static async getAllMedicines(categoryFilter?: string) {
    const where: any = {};
    if (categoryFilter) {
      where.category = categoryFilter;
    }

    return prisma.medicine.findMany({
      where,
      orderBy: { name: 'asc' },
    });
  }

  static async getMedicineById(id: string) {
    const medicine = await prisma.medicine.findUnique({
      where: { id },
    });
    if (!medicine) {
      throw new Error('Medicine not found');
    }
    return medicine;
  }

  static async createMedicine(pharmacistUserId: string, data: {
    name: string;
    category: string;
    unit: string;
    quantity: number;
    expiryDate: string;
    reorderLevel: number;
  }) {
    const existing = await prisma.medicine.findUnique({
      where: { name: data.name },
    });

    if (existing) {
      throw new Error(`Medicine with name '${data.name}' already exists in catalog`);
    }

    const expiry = new Date(data.expiryDate);

    return prisma.$transaction(async (tx) => {
      const medicine = await tx.medicine.create({
        data: {
          name: data.name,
          category: data.category,
          unit: data.unit,
          quantity: data.quantity,
          expiryDate: expiry,
          reorderLevel: data.reorderLevel,
          isActive: true,
        },
      });

      // Record initial stock IN transaction if quantity > 0
      if (data.quantity > 0) {
        await tx.stockTransaction.create({
          data: {
            medicineId: medicine.id,
            type: 'IN',
            quantity: data.quantity,
            performedByUserId: pharmacistUserId,
            referenceNotes: 'Initial Medicine Catalog Provisioning',
          },
        });
      }

      return medicine;
    });
  }

  static async updateMedicine(id: string, data: {
    name?: string;
    category?: string;
    unit?: string;
    reorderLevel?: number;
    expiryDate?: string;
    isActive?: boolean;
  }) {
    const medicine = await prisma.medicine.findUnique({ where: { id } });
    if (!medicine) {
      throw new Error('Medicine not found');
    }

    const updateData: any = { ...data };
    if (data.expiryDate) {
      updateData.expiryDate = new Date(data.expiryDate);
    }

    return prisma.medicine.update({
      where: { id },
      data: updateData,
    });
  }
}
