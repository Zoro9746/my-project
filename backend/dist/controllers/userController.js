"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const userService_1 = require("../services/userService");
const response_1 = require("../utils/response");
class UserController {
    static async getProfile(req, res) {
        try {
            if (!req.user)
                return (0, response_1.sendError)(res, 'Unauthenticated', 401);
            const user = await userService_1.UserService.getUserById(req.user.id);
            return (0, response_1.sendSuccess)(res, 'Profile retrieved successfully', user);
        }
        catch (error) {
            return (0, response_1.sendError)(res, error.message || 'Failed to retrieve profile', 400);
        }
    }
    static async updateProfile(req, res) {
        try {
            if (!req.user)
                return (0, response_1.sendError)(res, 'Unauthenticated', 401);
            const updatedUser = await userService_1.UserService.updateProfile(req.user.id, req.body);
            return (0, response_1.sendSuccess)(res, 'Profile updated successfully', updatedUser);
        }
        catch (error) {
            return (0, response_1.sendError)(res, error.message || 'Failed to update profile', 400);
        }
    }
    static async getAllUsers(req, res) {
        try {
            const roleFilter = req.query.role;
            const users = await userService_1.UserService.getAllUsers(roleFilter);
            return (0, response_1.sendSuccess)(res, 'Users retrieved successfully', users);
        }
        catch (error) {
            return (0, response_1.sendError)(res, error.message || 'Failed to fetch users', 400);
        }
    }
    static async toggleUserStatus(req, res) {
        try {
            const { id } = req.params;
            const { isActive } = req.body;
            if (typeof isActive !== 'boolean') {
                return (0, response_1.sendError)(res, 'isActive boolean flag is required', 400);
            }
            const updatedUser = await userService_1.UserService.setUserStatus(id, isActive);
            return (0, response_1.sendSuccess)(res, `User status updated to ${isActive ? 'active' : 'deactivated'}`, updatedUser);
        }
        catch (error) {
            return (0, response_1.sendError)(res, error.message || 'Failed to update user status', 400);
        }
    }
}
exports.UserController = UserController;
