import { prisma } from '../config/prisma';

export class UserService {
  static async getAllUsers(roleFilter?: string) {
    const where: any = {};
    if (roleFilter) {
      where.role = roleFilter;
    }

    return prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
        student: true,
        doctor: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async setUserStatus(userId: string, isActive: boolean) {
    const user = await prisma.user.update({
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

    return user;
  }

  static async updateProfile(userId: string, data: any) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { student: true, doctor: true },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Update user base attributes
    if (data.name) {
      await prisma.user.update({
        where: { id: userId },
        data: { name: data.name },
      });
    }

    // Update student attributes if student
    if (user.role === 'STUDENT' && user.student) {
      await prisma.student.update({
        where: { id: user.student.id },
        data: {
          department: data.department || user.student.department,
          bloodGroup: data.bloodGroup || user.student.bloodGroup,
          allergies: data.allergies !== undefined ? data.allergies : user.student.allergies,
          emergencyContact: data.emergencyContact || user.student.emergencyContact,
        },
      });
    }

    // Update doctor attributes if doctor
    if (user.role === 'DOCTOR' && user.doctor) {
      await prisma.doctor.update({
        where: { id: user.doctor.id },
        data: {
          specialization: data.specialization || user.doctor.specialization,
          roomNo: data.roomNo || user.doctor.roomNo,
          phone: data.phone || user.doctor.phone,
        },
      });
    }

    return this.getUserById(userId);
  }

  static async getUserById(userId: string) {
    return prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        student: true,
        doctor: true,
      },
    });
  }
}
