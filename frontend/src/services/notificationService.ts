import { api } from './api';
import { ApiResponse } from '../types';

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'APPOINTMENT' | 'STOCK' | 'SYSTEM';
  isRead: boolean;
  createdAt: string;
}

export interface UserNotificationsData {
  unreadCount: number;
  notifications: NotificationItem[];
}

export const notificationService = {
  async getNotifications(): Promise<UserNotificationsData> {
    const res = await api.get<ApiResponse<UserNotificationsData>>('/notifications');
    return res.data.data!;
  },

  async markAsRead(id: string) {
    const res = await api.patch<ApiResponse<any>>(`/notifications/${id}/read`);
    return res.data.data!;
  },

  async markAllAsRead() {
    const res = await api.patch<ApiResponse<any>>('/notifications/read-all');
    return res.data.data!;
  },
};
