import { prisma } from '../config/prisma';
import { hashPassword } from '../utils/password';

export class AdminService {
  /**
   * System-wide analytics overview metrics calculation
   */
  static async getAnalyticsOverview() {
    const todayStr = new Date().toISOString().split('T')[0];
    const todayStart = new Date(`${todayStr}T00:00:00.000Z`);
    const todayEnd = new Date(`${todayStr}T23:59:59.999Z`);

    const [
      totalStudents,
      totalDoctors,
      totalPharmacists,
      todayAppointmentsCount,
      confirmedAppointmentsCount,
      completedAppointmentsCount,
      cancelledAppointmentsCount,
      totalVisitsCount,
      dispensedPrescriptionsCount,
      allMedicines,
    ] = await Promise.all([
      prisma.student.count(),
      prisma.doctor.count(),
      prisma.user.count({ where: { role: 'PHARMACIST' } }),
      prisma.appointment.count({
        where: { date: { gte: todayStart, lte: todayEnd } },
      }),
      prisma.appointment.count({
        where: { date: { gte: todayStart, lte: todayEnd }, status: 'CONFIRMED' },
      }),
      prisma.appointment.count({
        where: { status: 'COMPLETED' },
      }),
      prisma.appointment.count({
        where: { status: 'CANCELLED' },
      }),
      prisma.visit.count(),
      prisma.prescription.count({ where: { status: 'DISPENSED' } }),
      prisma.medicine.findMany({ where: { isActive: true } }),
    ]);

    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const lowStockCount = allMedicines.filter((m) => m.quantity <= m.reorderLevel && m.expiryDate > now).length;
    const nearExpiryCount = allMedicines.filter((m) => m.expiryDate > now && m.expiryDate <= thirtyDaysFromNow).length;

    // 7-day appointment trends
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const recentAppointments = await prisma.appointment.findMany({
      where: { createdAt: { gte: sevenDaysAgo } },
      select: { createdAt: true, status: true },
    });

    return {
      users: {
        totalStudents,
        totalDoctors,
        totalPharmacists,
      },
      appointments: {
        todayTotal: todayAppointmentsCount,
        todayConfirmed: confirmedAppointmentsCount,
        totalCompleted: completedAppointmentsCount,
        totalCancelled: cancelledAppointmentsCount,
      },
      medical: {
        totalVisits: totalVisitsCount,
        prescriptionsDispensed: dispensedPrescriptionsCount,
      },
      inventory: {
        totalActiveMedicines: allMedicines.length,
        lowStockCount,
        nearExpiryCount,
      },
      recentActivity: recentAppointments.length,
    };
  }

  /**
   * Search and list system users filterable by role and status
   */
  static async getUsers(filters?: { role?: string; status?: string; search?: string }) {
    const where: any = {};

    if (filters?.role) {
      where.role = filters.role;
    }

    if (filters?.status) {
      where.isActive = filters.status === 'active';
    }

    if (filters?.search) {
      const q = filters.search;
      where.OR = [
        { name: { contains: q } },
        { email: { contains: q } },
        { student: { rollNo: { contains: q } } },
      ];
    }

    return prisma.user.findMany({
      where,
      include: {
        student: true,
        doctor: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Toggle user active/inactive status
   */
  static async updateUserStatus(userId: string, isActive: boolean) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new Error('User record not found');
    }

    return prisma.user.update({
      where: { id: userId },
      data: { isActive },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
      },
    });
  }

  /**
   * Forced password reset by Admin
   */
  static async resetUserPassword(userId: string, newPassword: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new Error('User record not found');
    }

    const passwordHash = await hashPassword(newPassword);

    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });

    return { userId, email: user.email, message: 'Password reset successfully' };
  }

  /**
   * Doctor roster management: view doctors with total completed appointments count
   */
  static async getDoctorsRoster() {
    const doctors = await prisma.doctor.findMany({
      include: {
        user: { select: { id: true, name: true, email: true, isActive: true } },
        schedules: true,
        appointments: {
          select: { id: true, status: true },
        },
      },
    });

    return doctors.map((doc) => ({
      id: doc.id,
      userId: doc.user.id,
      name: doc.user.name,
      email: doc.user.email,
      isActive: doc.user.isActive,
      specialization: doc.specialization,
      roomNo: doc.roomNo,
      phone: doc.phone,
      totalAppointments: doc.appointments.length,
      completedAppointments: doc.appointments.filter((a) => a.status === 'COMPLETED').length,
      activeSchedulesCount: doc.schedules.filter((s) => s.active).length,
    }));
  }

  /**
   * Update doctor specialization, room number, and contact info
   */
  static async updateDoctorInfo(doctorId: string, data: { specialization: string; roomNo: string; phone?: string }) {
    const doctor = await prisma.doctor.findUnique({ where: { id: doctorId } });
    if (!doctor) {
      throw new Error('Doctor record not found');
    }

    return prisma.doctor.update({
      where: { id: doctorId },
      data: {
        specialization: data.specialization,
        roomNo: data.roomNo,
        phone: data.phone || doctor.phone,
      },
      include: {
        user: { select: { name: true, email: true } },
      },
    });
  }
}
