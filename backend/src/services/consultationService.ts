import { prisma } from '../config/prisma';

export interface PrescriptionItemInput {
  medicineId: string;
  quantity: number;
  dosageInstructions: string;
}

export class ConsultationService {
  /**
   * Complete a doctor consultation, log visit, and create prescription (status: PENDING_DISPENSE)
   */
  static async completeConsultation(doctorUserId: string, data: {
    appointmentId: string;
    symptoms: string;
    diagnosis: string;
    notes?: string;
    prescriptionItems?: PrescriptionItemInput[];
  }) {
    // 1. Fetch doctor record
    const doctor = await prisma.doctor.findUnique({
      where: { userId: doctorUserId },
      include: { user: true },
    });

    if (!doctor) {
      throw new Error('Doctor profile not found');
    }

    // 2. Fetch appointment record
    const appointment = await prisma.appointment.findUnique({
      where: { id: data.appointmentId },
      include: { student: { include: { user: true } } },
    });

    if (!appointment) {
      throw new Error('Appointment record not found');
    }

    if (appointment.doctorId !== doctor.id) {
      throw new Error('Unauthorized: Appointment is assigned to a different doctor');
    }

    if (appointment.status === 'COMPLETED') {
      throw new Error('Appointment has already been completed');
    }

    if (appointment.status === 'CANCELLED') {
      throw new Error('Cannot complete a cancelled appointment');
    }

    const items = data.prescriptionItems || [];
    const now = new Date();

    // 3. Validate medicines selection against live stock catalog
    if (items.length > 0) {
      for (const item of items) {
        const medicine = await prisma.medicine.findUnique({
          where: { id: item.medicineId },
        });

        if (!medicine || !medicine.isActive) {
          throw new Error(`Medicine record '${item.medicineId}' is inactive or not found`);
        }

        if (medicine.expiryDate.getTime() <= now.getTime()) {
          throw new Error(`Medicine '${medicine.name}' has expired and cannot be prescribed`);
        }

        if (medicine.quantity < item.quantity) {
          throw new Error(
            `Insufficient stock for '${medicine.name}'. Available: ${medicine.quantity}, Prescribed: ${item.quantity}`
          );
        }
      }
    }

    // 4. Atomic transaction: Update appointment, create visit, create prescription
    return prisma.$transaction(async (tx) => {
      // Mark appointment completed
      const updatedAppointment = await tx.appointment.update({
        where: { id: data.appointmentId },
        data: { status: 'COMPLETED' },
      });

      // Create Visit record
      const visit = await tx.visit.create({
        data: {
          appointmentId: data.appointmentId,
          studentId: appointment.studentId,
          doctorId: doctor.id,
          symptoms: data.symptoms,
          diagnosis: data.diagnosis,
          notes: data.notes || null,
        },
      });

      let prescription = null;

      // Create Prescription if items are included
      if (items.length > 0) {
        prescription = await tx.prescription.create({
          data: {
            appointmentId: data.appointmentId,
            visitId: visit.id,
            status: 'PENDING_DISPENSE',
            items: {
              create: items.map((it) => ({
                medicineId: it.medicineId,
                quantity: it.quantity,
                dosageInstructions: it.dosageInstructions,
              })),
            },
          },
          include: {
            items: {
              include: {
                medicine: true,
              },
            },
          },
        });
      }

      return {
        appointment: updatedAppointment,
        visit,
        prescription,
      };
    });
  }

  /**
   * Get complete patient medical history (visits & prescriptions)
   */
  static async getPatientMedicalHistory(studentId: string) {
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        user: { select: { name: true, email: true } },
      },
    });

    if (!student) {
      throw new Error('Student record not found');
    }

    const visits = await prisma.visit.findMany({
      where: { studentId },
      include: {
        doctor: {
          include: { user: { select: { name: true, email: true } } },
        },
        appointment: { select: { date: true, timeSlot: true, tokenNo: true } },
        prescriptions: {
          include: {
            items: {
              include: { medicine: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return {
      student,
      visits,
    };
  }

  /**
   * Search student records by roll number or name for doctors
   */
  static async searchPatients(query: string) {
    return prisma.student.findMany({
      where: {
        OR: [
          { rollNo: { contains: query } },
          { user: { name: { contains: query } } },
          { user: { email: { contains: query } } },
        ],
      },
      include: {
        user: { select: { name: true, email: true } },
      },
      take: 20,
    });
  }
}
