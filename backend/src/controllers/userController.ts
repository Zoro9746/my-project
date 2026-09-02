import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { UserService } from '../services/userService';
import { sendSuccess, sendError } from '../utils/response';

export class UserController {
  static async getProfile(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) return sendError(res, 'Unauthenticated', 401);
      const user = await UserService.getUserById(req.user.id);
      return sendSuccess(res, 'Profile retrieved successfully', user);
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to retrieve profile', 400);
    }
  }

  static async updateProfile(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) return sendError(res, 'Unauthenticated', 401);
      const updatedUser = await UserService.updateProfile(req.user.id, req.body);
      return sendSuccess(res, 'Profile updated successfully', updatedUser);
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to update profile', 400);
    }
  }

  static async getAllUsers(req: AuthenticatedRequest, res: Response) {
    try {
      const roleFilter = req.query.role as string | undefined;
      const users = await UserService.getAllUsers(roleFilter);
      return sendSuccess(res, 'Users retrieved successfully', users);
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to fetch users', 400);
    }
  }

  static async toggleUserStatus(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const { isActive } = req.body;
      if (typeof isActive !== 'boolean') {
        return sendError(res, 'isActive boolean flag is required', 400);
      }
      const updatedUser = await UserService.setUserStatus(id, isActive);
      return sendSuccess(res, `User status updated to ${isActive ? 'active' : 'deactivated'}`, updatedUser);
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to update user status', 400);
    }
  }
}
