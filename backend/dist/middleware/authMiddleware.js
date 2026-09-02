"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateToken = void 0;
const jwt_1 = require("../utils/jwt");
const response_1 = require("../utils/response");
const prisma_1 = require("../config/prisma");
const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return (0, response_1.sendError)(res, 'Authentication token missing or invalid format', 401);
        }
        const token = authHeader.split(' ')[1];
        const decoded = (0, jwt_1.verifyToken)(token);
        // Check user active status in database
        const user = await prisma_1.prisma.user.findUnique({
            where: { id: decoded.userId },
            select: { id: true, email: true, name: true, role: true, isActive: true },
        });
        if (!user) {
            return (0, response_1.sendError)(res, 'User profile no longer exists', 401);
        }
        if (!user.isActive) {
            return (0, response_1.sendError)(res, 'User account is deactivated. Contact Admin.', 403);
        }
        req.user = {
            id: user.id,
            userId: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
        };
        next();
    }
    catch (error) {
        return (0, response_1.sendError)(res, 'Invalid or expired authentication token', 401, error.message);
    }
};
exports.authenticateToken = authenticateToken;
