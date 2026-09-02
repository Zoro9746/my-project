"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const prisma_1 = require("../config/prisma");
class UserService {
    static async getAllUsers(roleFilter) {
        const where = {};
        if (roleFilter) {
            where.role = roleFilter;
        }
        return prisma_1.prisma.user.findMany({
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
    static async setUserStatus(userId, isActive) {
        const user = await prisma_1.prisma.user.update({
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
    static async updateProfile(userId, data) {
        const user = await prisma_1.prisma.user.findUnique({
            where: { id: userId },
            include: { student: true, doctor: true },
        });
        if (!user) {
            throw new Error('User not found');
        }
        // Update user base attributes
        if (data.name) {
            await prisma_1.prisma.user.update({
                where: { id: userId },
                data: { name: data.name },
            });
        }
        // Update student attributes if student
        if (user.role === 'STUDENT' && user.student) {
            await prisma_1.prisma.student.update({
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
            await prisma_1.prisma.doctor.update({
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
    static async getUserById(userId) {
        return prisma_1.prisma.user.findUnique({
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
exports.UserService = UserService;
