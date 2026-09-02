"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const authService_1 = require("../services/authService");
const response_1 = require("../utils/response");
class AuthController {
    static async registerStudent(req, res) {
        try {
            const result = await authService_1.AuthService.registerStudent(req.body);
            return (0, response_1.sendSuccess)(res, 'Student account registered successfully', result, 201);
        }
        catch (error) {
            return (0, response_1.sendError)(res, error.message || 'Registration failed', 400);
        }
    }
    static async login(req, res) {
        try {
            const { email, password } = req.body;
            const result = await authService_1.AuthService.login(email, password);
            return (0, response_1.sendSuccess)(res, 'Login successful', result);
        }
        catch (error) {
            return (0, response_1.sendError)(res, error.message || 'Login failed', 401);
        }
    }
    static async getCurrentUser(req, res) {
        try {
            if (!req.user) {
                return (0, response_1.sendError)(res, 'Unauthenticated', 401);
            }
            const user = await authService_1.AuthService.getUserProfile(req.user.id);
            return (0, response_1.sendSuccess)(res, 'User profile fetched successfully', user);
        }
        catch (error) {
            return (0, response_1.sendError)(res, error.message || 'Failed to fetch user profile', 400);
        }
    }
    static async logout(req, res) {
        // Stateles JWT logout acknowledgement
        return (0, response_1.sendSuccess)(res, 'Logged out successfully');
    }
}
exports.AuthController = AuthController;
