"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProfileSchema = exports.loginSchema = exports.registerStudentSchema = void 0;
const zod_1 = require("zod");
exports.registerStudentSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email address format'),
    password: zod_1.z.string().min(6, 'Password must be at least 6 characters'),
    name: zod_1.z.string().min(2, 'Name is required'),
    rollNo: zod_1.z.string().min(3, 'Roll number is required'),
    department: zod_1.z.string().min(2, 'Department is required'),
    bloodGroup: zod_1.z.string().min(1, 'Blood group is required'),
    allergies: zod_1.z.string().optional(),
    emergencyContact: zod_1.z.string().min(5, 'Emergency contact is required'),
});
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email address format'),
    password: zod_1.z.string().min(1, 'Password is required'),
});
exports.updateProfileSchema = zod_1.z.object({
    name: zod_1.z.string().min(2).optional(),
    department: zod_1.z.string().optional(),
    bloodGroup: zod_1.z.string().optional(),
    allergies: zod_1.z.string().optional(),
    emergencyContact: zod_1.z.string().optional(),
    specialization: zod_1.z.string().optional(),
    roomNo: zod_1.z.string().optional(),
    phone: zod_1.z.string().optional(),
});
