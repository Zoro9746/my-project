import { prisma } from '../config/prisma';

export class ReportService {
  /**
   * Appointment Volume Summary Report with status breakdown & doctor volume
   */
  static async getAppointmentSummaryReport(startDate?: string, endDate?: string) {
    const where: any = {};
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    const appointments = await prisma.appointment.findMany({
      where,
      include: {
        student: { include: { user: { select: { name: true, email: true } } } },
        doctor: { include: { user: { select: { name: true } } } },
      },
      orderBy: { date: 'desc' },
    });

    const statusCounts = {
      CONFIRMED: appointments.filter((a) => a.status === 'CONFIRMED').length,
      COMPLETED: appointments.filter((a) => a.status === 'COMPLETED').length,
      CANCELLED: appointments.filter((a) => a.status === 'CANCELLED').length,
    };

    // Doctor volume breakdown
    const doctorVolumeMap = new Map<string, { doctorName: string; total: number; completed: number }>();
    appointments.forEach((a) => {
      const docName = a.doctor.user.name;
      const current = doctorVolumeMap.get(docName) || { doctorName: docName, total: 0, completed: 0 };
      current.total += 1;
      if (a.status === 'COMPLETED') current.completed += 1;
      doctorVolumeMap.set(docName, current);
    });

    return {
      dateRange: { startDate: startDate || 'All Time', endDate: endDate || 'All Time' },
      totalAppointments: appointments.length,
      statusCounts,
      doctorVolume: Array.from(doctorVolumeMap.values()),
      appointments: appointments.map((a) => ({
        id: a.id,
        date: a.date.toISOString().split('T')[0],
        timeSlot: a.timeSlot,
        tokenNo: a.tokenNo,
        status: a.status,
        studentName: a.student.user.name,
        studentRollNo: a.student.rollNo,
        doctorName: a.doctor.user.name,
      })),
    };
  }

  /**
   * Medication Consumption Report: dispensed quantities and fast/slow moving analysis
   */
  static async getMedicationConsumptionReport(startDate?: string, endDate?: string) {
    const where: any = { type: 'OUT' };
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const stockOutTransactions = await prisma.stockTransaction.findMany({
      where,
      include: { medicine: true },
    });

    const medConsumptionMap = new Map<string, {
      medicineId: string;
      medicineName: string;
      category: string;
      unit: string;
      dispensedQuantity: number;
      movementCategory: 'FAST_MOVING' | 'SLOW_MOVING';
    }>();

    stockOutTransactions.forEach((tx) => {
      const med = tx.medicine;
      const current = medConsumptionMap.get(med.id) || {
        medicineId: med.id,
        medicineName: med.name,
        category: med.category,
        unit: med.unit,
        dispensedQuantity: 0,
        movementCategory: 'SLOW_MOVING',
      };
      current.dispensedQuantity += tx.quantity;
      current.movementCategory = current.dispensedQuantity >= 20 ? 'FAST_MOVING' : 'SLOW_MOVING';
      medConsumptionMap.set(med.id, current);
    });

    const consumptionList = Array.from(medConsumptionMap.values()).sort(
      (a, b) => b.dispensedQuantity - a.dispensedQuantity
    );

    return {
      dateRange: { startDate: startDate || 'All Time', endDate: endDate || 'All Time' },
      totalDispensedTransactions: stockOutTransactions.length,
      medicinesConsumedCount: consumptionList.length,
      fastMovingCount: consumptionList.filter((c) => c.movementCategory === 'FAST_MOVING').length,
      slowMovingCount: consumptionList.filter((c) => c.movementCategory === 'SLOW_MOVING').length,
      consumptionList,
    };
  }

  /**
   * Stock & Expiry Audit Report
   */
  static async getStockAndExpiryReport() {
    const medicines = await prisma.medicine.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });

    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const lowStock = medicines.filter((m) => m.quantity <= m.reorderLevel && m.expiryDate > now);
    const nearExpiry = medicines.filter((m) => m.expiryDate > now && m.expiryDate <= thirtyDaysFromNow);
    const expired = medicines.filter((m) => m.expiryDate <= now);

    return {
      generatedAt: now.toISOString(),
      totalActiveMedicines: medicines.length,
      lowStock,
      nearExpiry,
      expired,
    };
  }

  /**
   * Patient Visit History Report
   */
  static async getPatientVisitsReport(startDate?: string, endDate?: string) {
    const where: any = {};
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const visits = await prisma.visit.findMany({
      where,
      include: {
        student: { include: { user: { select: { name: true, email: true } } } },
        doctor: { include: { user: { select: { name: true } } } },
        prescriptions: {
          include: { items: { include: { medicine: true } } },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return {
      totalVisits: visits.length,
      visits: visits.map((v) => ({
        visitId: v.id,
        createdAt: v.createdAt.toISOString().split('T')[0],
        studentName: v.student.user.name,
        studentRollNo: v.student.rollNo,
        department: v.student.department,
        doctorName: v.doctor.user.name,
        symptoms: v.symptoms,
        diagnosis: v.diagnosis,
        notes: v.notes || 'N/A',
        prescribedMedicines: v.prescriptions[0]?.items.map((it) => `${it.medicine.name} (${it.quantity})`).join(', ') || 'None',
      })),
    };
  }
}
