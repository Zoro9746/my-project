import { prisma } from '../config/prisma';

export class StockService {
  /**
   * Dispense a digital prescription atomically: deduct stock, log OUT transactions, mark DISPENSED
   */
  static async dispensePrescription(pharmacistUserId: string, prescriptionId: string) {
    const prescription = await prisma.prescription.findUnique({
      where: { id: prescriptionId },
      include: {
        items: {
          include: {
            medicine: true,
          },
        },
        appointment: {
          include: {
            student: { include: { user: { select: { name: true } } } },
            doctor: { include: { user: { select: { name: true } } } },
          },
        },
      },
    });

    if (!prescription) {
      throw new Error('Prescription record not found');
    }

    if (prescription.status === 'DISPENSED') {
      throw new Error('Prescription has already been dispensed');
    }

    if (!prescription.items || prescription.items.length === 0) {
      throw new Error('Prescription contains no medicine items to dispense');
    }

    const now = new Date();

    // Perform atomic transaction: check stock & expiry, deduct, log stock OUT transactions, mark DISPENSED
    return prisma.$transaction(async (tx) => {
      for (const item of prescription.items) {
        const medicine = await tx.medicine.findUnique({
          where: { id: item.medicineId },
        });

        if (!medicine || !medicine.isActive) {
          throw new Error(`Medicine '${item.medicine.name}' is inactive or no longer available`);
        }

        if (medicine.expiryDate.getTime() <= now.getTime()) {
          throw new Error(`Cannot dispense expired medicine '${medicine.name}' (Expired on ${medicine.expiryDate.toISOString().split('T')[0]})`);
        }

        if (medicine.quantity < item.quantity) {
          throw new Error(
            `Insufficient stock for '${medicine.name}'. Current stock: ${medicine.quantity} ${medicine.unit}, Required: ${item.quantity}`
          );
        }

        // Deduct stock quantity
        await tx.medicine.update({
          where: { id: medicine.id },
          data: {
            quantity: medicine.quantity - item.quantity,
          },
        });

        // Record Stock OUT audit transaction
        await tx.stockTransaction.create({
          data: {
            medicineId: medicine.id,
            type: 'OUT',
            quantity: item.quantity,
            performedByUserId: pharmacistUserId,
            referenceNotes: `Dispensed for Student ${prescription.appointment.student.user.name} (Prescription #${prescription.id.substring(0, 8)})`,
          },
        });
      }

      // Update prescription status to DISPENSED
      const updatedPrescription = await tx.prescription.update({
        where: { id: prescriptionId },
        data: { status: 'DISPENSED' },
        include: {
          items: { include: { medicine: true } },
          appointment: {
            include: {
              student: { include: { user: { select: { name: true } } } },
              doctor: { include: { user: { select: { name: true } } } },
            },
          },
        },
      });

      return updatedPrescription;
    });
  }

  /**
   * Inward stock addition (Stock-IN)
   */
  static async addStockIn(pharmacistUserId: string, data: { medicineId: string; quantity: number; referenceNotes?: string }) {
    const medicine = await prisma.medicine.findUnique({
      where: { id: data.medicineId },
    });

    if (!medicine || !medicine.isActive) {
      throw new Error('Medicine record not found or inactive');
    }

    return prisma.$transaction(async (tx) => {
      // Increase medicine stock quantity
      const updatedMedicine = await tx.medicine.update({
        where: { id: data.medicineId },
        data: {
          quantity: medicine.quantity + data.quantity,
        },
      });

      // Create Stock IN transaction
      const transaction = await tx.stockTransaction.create({
        data: {
          medicineId: data.medicineId,
          type: 'IN',
          quantity: data.quantity,
          performedByUserId: pharmacistUserId,
          referenceNotes: data.referenceNotes || 'Stock Inward Addition',
        },
        include: {
          medicine: true,
          performedBy: { select: { name: true, email: true } },
        },
      });

      return { medicine: updatedMedicine, transaction };
    });
  }

  /**
   * Fetch stock audit transactions log
   */
  static async getStockTransactions(filters?: { medicineId?: string; type?: string }) {
    const where: any = {};
    if (filters?.medicineId) where.medicineId = filters.medicineId;
    if (filters?.type) where.type = filters.type;

    return prisma.stockTransaction.findMany({
      where,
      include: {
        medicine: true,
        performedBy: { select: { name: true, email: true, role: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Compute low-stock and near-expiry alerts
   */
  static async getStockAlerts() {
    const medicines = await prisma.medicine.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });

    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const lowStock = medicines
      .filter((m) => m.quantity <= m.reorderLevel && m.expiryDate > now)
      .map((m) => ({
        ...m,
        alertType: 'LOW_STOCK',
        daysRemaining: Math.ceil((m.expiryDate.getTime() - now.getTime()) / (1000 * 3600 * 24)),
      }));

    const nearExpiry = medicines
      .filter((m) => m.expiryDate > now && m.expiryDate <= thirtyDaysFromNow)
      .map((m) => ({
        ...m,
        alertType: 'NEAR_EXPIRY',
        daysRemaining: Math.ceil((m.expiryDate.getTime() - now.getTime()) / (1000 * 3600 * 24)),
      }));

    const expired = medicines
      .filter((m) => m.expiryDate <= now)
      .map((m) => ({
        ...m,
        alertType: 'EXPIRED',
        daysRemaining: 0,
      }));

    return {
      summary: {
        totalMedicines: medicines.length,
        lowStockCount: lowStock.length,
        nearExpiryCount: nearExpiry.length,
        expiredCount: expired.length,
      },
      lowStock,
      nearExpiry,
      expired,
    };
  }
}
