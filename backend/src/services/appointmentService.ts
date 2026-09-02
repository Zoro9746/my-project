import { prisma } from '../config/prisma';

export class AppointmentService {
  /**
   * Book appointment with atomic token generation and race-condition safety
   */
  static async bookAppointment(userId: string, data: { doctorId: string; date: string; timeSlot: string }) {
    // 1. Fetch student record
    const student = await prisma.student.findUnique({
      where: { userId },
      include: { user: true },
    });

    if (!student) {
      throw new Error('Student medical profile not found');
    }

    // 2. Validate date and time slot (No past date or past time booking)
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    if (data.date < todayStr) {
      throw new Error('Cannot book appointments in the past');
    }

    if (data.date === todayStr) {
      const [slotHour, slotMin] = data.timeSlot.split(':').map(Number);
      const slotTimeToday = new Date();
      slotTimeToday.setHours(slotHour, slotMin, 0, 0);

      if (slotTimeToday.getTime() <= now.getTime()) {
        throw new Error('Cannot book a time slot that has already passed today');
      }
    }

    // 3. Verify doctor exists
    const doctor = await prisma.doctor.findUnique({
      where: { id: data.doctorId },
      include: { user: true },
    });

    if (!doctor || !doctor.user.isActive) {
      throw new Error('Selected doctor is inactive or not found');
    }

    const appointmentDate = new Date(data.date);
    appointmentDate.setUTCHours(0, 0, 0, 0);

    const startOfDay = new Date(appointmentDate);
    const endOfDay = new Date(appointmentDate);
    endOfDay.setUTCHours(23, 59, 59, 999);

    // 4. Perform atomic transaction: check availability & generate daily token
    return prisma.$transaction(async (tx) => {
      // Check duplicate booking for doctor on slot
      const existingDoctorAppointment = await tx.appointment.findFirst({
        where: {
          doctorId: data.doctorId,
          date: {
            gte: startOfDay,
            lte: endOfDay,
          },
          timeSlot: data.timeSlot,
          status: { in: ['PENDING', 'CONFIRMED', 'COMPLETED'] },
        },
      });

      if (existingDoctorAppointment) {
        throw new Error(`Time slot ${data.timeSlot} is already booked for Dr. ${doctor.user.name}`);
      }

      // Check duplicate booking for student on same slot
      const existingStudentAppointment = await tx.appointment.findFirst({
        where: {
          studentId: student.id,
          date: {
            gte: startOfDay,
            lte: endOfDay,
          },
          timeSlot: data.timeSlot,
          status: { in: ['PENDING', 'CONFIRMED', 'COMPLETED'] },
        },
      });

      if (existingStudentAppointment) {
        throw new Error(`You already have an appointment scheduled at ${data.timeSlot} on this date`);
      }

      // Calculate next daily token number for doctor on date
      const countToday = await tx.appointment.count({
        where: {
          doctorId: data.doctorId,
          date: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
      });

      const tokenNo = countToday + 1;

      const newAppointment = await tx.appointment.create({
        data: {
          studentId: student.id,
          doctorId: data.doctorId,
          date: appointmentDate,
          timeSlot: data.timeSlot,
          status: 'CONFIRMED',
          tokenNo,
        },
        include: {
          doctor: {
            include: { user: { select: { name: true, email: true } } },
          },
          student: {
            include: { user: { select: { name: true, email: true } } },
          },
        },
      });

      return newAppointment;
    });
  }

  /**
   * Get list of appointments according to user role
   */
  static async getAppointments(user: { id: string; role: string }, filters?: { date?: string; status?: string }) {
    const where: any = {};

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.date) {
      const startOfDay = new Date(filters.date);
      startOfDay.setUTCHours(0, 0, 0, 0);

      const endOfDay = new Date(filters.date);
      endOfDay.setUTCHours(23, 59, 59, 999);

      where.date = {
        gte: startOfDay,
        lte: endOfDay,
      };
    }

    if (user.role === 'STUDENT') {
      const student = await prisma.student.findUnique({ where: { userId: user.id } });
      if (!student) return [];
      where.studentId = student.id;
    } else if (user.role === 'DOCTOR') {
      const doctor = await prisma.doctor.findUnique({ where: { userId: user.id } });
      if (!doctor) return [];
      where.doctorId = doctor.id;
    }

    return prisma.appointment.findMany({
      where,
      include: {
        doctor: {
          include: {
            user: { select: { name: true, email: true } },
          },
        },
        student: {
          include: {
            user: { select: { name: true, email: true } },
          },
        },
        visit: true,
        prescription: true,
      },
      orderBy: [{ date: 'asc' }, { timeSlot: 'asc' }],
    });
  }

  /**
   * Cancel an appointment (frees the slot)
   */
  static async cancelAppointment(userId: string, userRole: string, appointmentId: string) {
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: { student: true, doctor: true },
    });

    if (!appointment) {
      throw new Error('Appointment not found');
    }

    // Role permission check
    if (userRole === 'STUDENT' && appointment.student.userId !== userId) {
      throw new Error('Unauthorized to cancel this appointment');
    }
    if (userRole === 'DOCTOR' && appointment.doctor.userId !== userId) {
      throw new Error('Unauthorized to cancel this appointment');
    }

    if (appointment.status === 'CANCELLED') {
      throw new Error('Appointment is already cancelled');
    }

    if (appointment.status === 'COMPLETED') {
      throw new Error('Cannot cancel a completed consultation');
    }

    return prisma.appointment.update({
      where: { id: appointmentId },
      data: { status: 'CANCELLED' },
      include: {
        doctor: { include: { user: { select: { name: true } } } },
        student: { include: { user: { select: { name: true } } } },
      },
    });
  }

  /**
   * Reschedule appointment to a new date and time slot
   */
  static async rescheduleAppointment(userId: string, userRole: string, appointmentId: string, newDate: string, newTimeSlot: string) {
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: { student: true, doctor: true },
    });

    if (!appointment) {
      throw new Error('Appointment not found');
    }

    if (userRole === 'STUDENT' && appointment.student.userId !== userId) {
      throw new Error('Unauthorized to reschedule this appointment');
    }

    if (appointment.status === 'CANCELLED' || appointment.status === 'COMPLETED') {
      throw new Error(`Cannot reschedule an appointment in '${appointment.status}' status`);
    }

    // Validate new date
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    if (newDate < todayStr) {
      throw new Error('Cannot reschedule to a past date');
    }

    const appointmentDate = new Date(newDate);
    appointmentDate.setUTCHours(0, 0, 0, 0);

    const startOfDay = new Date(appointmentDate);
    const endOfDay = new Date(appointmentDate);
    endOfDay.setUTCHours(23, 59, 59, 999);

    return prisma.$transaction(async (tx) => {
      // Check target slot availability
      const existingSlot = await tx.appointment.findFirst({
        where: {
          doctorId: appointment.doctorId,
          date: { gte: startOfDay, lte: endOfDay },
          timeSlot: newTimeSlot,
          status: { in: ['PENDING', 'CONFIRMED', 'COMPLETED'] },
          id: { not: appointmentId },
        },
      });

      if (existingSlot) {
        throw new Error(`Target time slot ${newTimeSlot} on ${newDate} is already occupied`);
      }

      const countToday = await tx.appointment.count({
        where: {
          doctorId: appointment.doctorId,
          date: { gte: startOfDay, lte: endOfDay },
        },
      });

      return tx.appointment.update({
        where: { id: appointmentId },
        data: {
          date: appointmentDate,
          timeSlot: newTimeSlot,
          tokenNo: countToday + 1,
          status: 'CONFIRMED',
        },
        include: {
          doctor: { include: { user: { select: { name: true } } } },
          student: { include: { user: { select: { name: true } } } },
        },
      });
    });
  }

  /**
   * Fetch today's live queue & metrics for Doctor console
   */
  static async getDoctorTodayQueue(userId: string) {
    const doctor = await prisma.doctor.findUnique({
      where: { userId },
      include: { user: true },
    });

    if (!doctor) {
      throw new Error('Doctor record not found');
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const startOfDay = new Date(todayStr);
    startOfDay.setUTCHours(0, 0, 0, 0);

    const endOfDay = new Date(todayStr);
    endOfDay.setUTCHours(23, 59, 59, 999);

    const appointments = await prisma.appointment.findMany({
      where: {
        doctorId: doctor.id,
        date: { gte: startOfDay, lte: endOfDay },
      },
      include: {
        student: {
          include: {
            user: { select: { name: true, email: true } },
          },
        },
      },
      orderBy: { tokenNo: 'asc' },
    });

    const total = appointments.length;
    const pending = appointments.filter((a) => a.status === 'CONFIRMED' || a.status === 'PENDING').length;
    const completed = appointments.filter((a) => a.status === 'COMPLETED').length;
    const cancelled = appointments.filter((a) => a.status === 'CANCELLED').length;

    return {
      todayDate: todayStr,
      doctorName: doctor.user.name,
      specialization: doctor.specialization,
      roomNo: doctor.roomNo,
      metrics: {
        total,
        pending,
        completed,
        cancelled,
      },
      queue: appointments,
    };
  }
}
