import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { AdminService } from '../services/adminService';
import { sendSuccess, sendError } from '../utils/response';

export class AdminController {
  static async getAnalyticsOverview(req: AuthenticatedRequest, res: Response) {
    try {
      const analytics = await AdminService.getAnalyticsOverview();
      return sendSuccess(res, 'System analytics overview retrieved', analytics);
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to fetch analytics', 400);
    }
  }

  static async getUsers(req: AuthenticatedRequest, res: Response) {
    try {
      const filters = {
        role: req.query.role as string | undefined,
        status: req.query.status as string | undefined,
        search: req.query.search as string | undefined,
      };
      const users = await AdminService.getUsers(filters);
      return sendSuccess(res, 'Users retrieved successfully', users);
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to fetch users', 400);
    }
  }

  static async updateUserStatus(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const { isActive } = req.body;
      const updatedUser = await AdminService.updateUserStatus(id, isActive);
      return sendSuccess(res, `User account ${isActive ? 'activated' : 'deactivated'} successfully`, updatedUser);
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to update user status', 400);
    }
  }

  static async resetUserPassword(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const { newPassword } = req.body;
      const result = await AdminService.resetUserPassword(id, newPassword);
      return sendSuccess(res, 'User password reset successfully', result);
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to reset password', 400);
    }
  }

  static async getDoctorsRoster(req: AuthenticatedRequest, res: Response) {
    try {
      const roster = await AdminService.getDoctorsRoster();
      return sendSuccess(res, 'Doctor roster retrieved successfully', roster);
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to fetch doctor roster', 400);
    }
  }

  static async updateDoctorInfo(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const updatedDoctor = await AdminService.updateDoctorInfo(id, req.body);
      return sendSuccess(res, 'Doctor profile updated successfully', updatedDoctor);
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to update doctor profile', 400);
    }
  }
}
