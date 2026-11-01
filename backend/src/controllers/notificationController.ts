import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { NotificationService } from '../services/notificationService';
import { sendSuccess, sendError } from '../utils/response';

export class NotificationController {
  static async getNotifications(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) return sendError(res, 'Unauthenticated', 401);
      const data = await NotificationService.getUserNotifications(req.user.id);
      return sendSuccess(res, 'Notifications retrieved successfully', data);
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to fetch notifications', 400);
    }
  }

  static async markAsRead(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) return sendError(res, 'Unauthenticated', 401);
      const { id } = req.params;
      const updated = await NotificationService.markAsRead(id, req.user.id);
      return sendSuccess(res, 'Notification marked as read', updated);
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to mark notification as read', 400);
    }
  }

  static async markAllAsRead(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) return sendError(res, 'Unauthenticated', 401);
      const result = await NotificationService.markAllAsRead(req.user.id);
      return sendSuccess(res, 'All notifications marked as read', result);
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to mark all as read', 400);
    }
  }
}
