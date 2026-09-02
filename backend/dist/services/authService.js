"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const prisma_1 = require("../config/prisma");
const password_1 = require("../utils/password");
const jwt_1 = require("../utils/jwt");
class AuthService {
    static async registerStudent(data) {
        // Check email uniqueness
        const existingUser = await prisma_1.prisma.user.findUnique({
            where: { email: data.email },
        });
        if (existingUser) {
            throw new Error('Email address is already registered');
        }
        // Check roll number uniqueness
        const existingStudent = await prisma_1.prisma.student.findUnique({
            where: { rollNo: data.rollNo },
        });
        if (existingStudent) {
            throw new Error('Roll number is already registered');
        }
        const passwordHash = await (0, password_1.hashPassword)(data.password);
        // Create user and student record in a single transaction
        const user = await prisma_1.prisma.$transaction(async (tx) => {
            const newUser = await tx.user.create({
                data: {
                    email: data.email,
                    passwordHash,
                    name: data.name,
                    role: 'STUDENT',
                    isActive: true,
                },
            });
            const newStudent = await tx.student.create({
                data: {
                    userId: newUser.id,
                    rollNo: data.rollNo,
                    department: data.department,
                    bloodGroup: data.bloodGroup,
                    allergies: data.allergies || null,
                    emergencyContact: data.emergencyContact,
                },
            });
            return { ...newUser, student: newStudent };
        });
        const token = (0, jwt_1.generateToken)({
            userId: user.id,
            email: user.email,
            role: user.role,
            name: user.name,
        });
        const { passwordHash: _, ...userWithoutPassword } = user;
        return { user: userWithoutPassword, token };
    }
    static async login(email, password) {
        const user = await prisma_1.prisma.user.findUnique({
            where: { email },
            include: {
                student: true,
                doctor: true,
            },
        });
        if (!user) {
            throw new Error('Invalid email or password');
        }
        if (!user.isActive) {
            throw new Error('Your account has been deactivated. Please contact administrator.');
        }
        const isMatch = await (0, password_1.comparePassword)(password, user.passwordHash);
        if (!isMatch) {
            throw new Error('Invalid email or password');
        }
        const token = (0, jwt_1.generateToken)({
            userId: user.id,
            email: user.email,
            role: user.role,
            name: user.name,
        });
        const { passwordHash: _, ...userWithoutPassword } = user;
        return { user: userWithoutPassword, token };
    }
    static async getUserProfile(userId) {
        const user = await prisma_1.prisma.user.findUnique({
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
        if (!user) {
            throw new Error('User profile not found');
        }
        return user;
    }
}
exports.AuthService = AuthService;
