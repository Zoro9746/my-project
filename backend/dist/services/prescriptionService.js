"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrescriptionService = void 0;
const prisma_1 = require("../config/prisma");
class PrescriptionService {
    static async getAllPrescriptions(user, statusFilter) {
        const where = {};
        if (statusFilter) {
            where.status = statusFilter;
        }
        if (user.role === 'STUDENT') {
            const student = await prisma_1.prisma.student.findUnique({ where: { userId: user.id } });
            if (!student)
                return [];
            where.appointment = { studentId: student.id };
        }
        else if (user.role === 'DOCTOR') {
            const doctor = await prisma_1.prisma.doctor.findUnique({ where: { userId: user.id } });
            if (!doctor)
                return [];
            where.appointment = { doctorId: doctor.id };
        }
        return prisma_1.prisma.prescription.findMany({
            where,
            include: {
                appointment: {
                    include: {
                        doctor: { include: { user: { select: { name: true, email: true } } } },
                        student: { include: { user: { select: { name: true, email: true } } } },
                    },
                },
                visit: true,
                items: {
                    include: {
                        medicine: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    static async getPrescriptionById(id) {
        const prescription = await prisma_1.prisma.prescription.findUnique({
            where: { id },
            include: {
                appointment: {
                    include: {
                        doctor: { include: { user: { select: { name: true, email: true } } } },
                        student: { include: { user: { select: { name: true, email: true } } } },
                    },
                },
                visit: true,
                items: {
                    include: {
                        medicine: true,
                    },
                },
            },
        });
        if (!prescription) {
            throw new Error('Prescription not found');
        }
        return prescription;
    }
}
exports.PrescriptionService = PrescriptionService;
