import { api } from './api';
import { ApiResponse } from '../types';

export interface AnalyticsOverview {
  users: {
    totalStudents: number;
    totalDoctors: number;
    totalPharmacists: number;
  };
  appointments: {
    todayTotal: number;
    todayConfirmed: number;
    totalCompleted: number;
    totalCancelled: number;
  };
  medical: {
    totalVisits: number;
    prescriptionsDispensed: number;
  };
  inventory: {
    totalActiveMedicines: number;
    lowStockCount: number;
    nearExpiryCount: number;
  };
  recentActivity: number;
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'STUDENT' | 'DOCTOR' | 'PHARMACIST' | 'ADMIN';
  isActive: boolean;
  createdAt: string;
  student?: {
    id: string;
    rollNo: string;
    department: string;
    bloodGroup: string;
    emergencyContact: string;
  };
  doctor?: {
    id: string;
    specialization: string;
    roomNo: string;
    phone: string;
  };
}

export interface DoctorRosterItem {
  id: string;
  userId: string;
  name: string;
  email: string;
  isActive: boolean;
  specialization: string;
  roomNo: string;
  phone: string;
  totalAppointments: number;
  completedAppointments: number;
  activeSchedulesCount: number;
}

export const adminService = {
  async getAnalyticsOverview(): Promise<AnalyticsOverview> {
    const res = await api.get<ApiResponse<AnalyticsOverview>>('/admin/analytics');
    return res.data.data!;
  },

  async getUsers(filters?: { role?: string; status?: string; search?: string }): Promise<AdminUser[]> {
    const params = new URLSearchParams();
    if (filters?.role) params.append('role', filters.role);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.search) params.append('search', filters.search);

    const res = await api.get<ApiResponse<AdminUser[]>>(`/admin/users?${params.toString()}`);
    return res.data.data || [];
  },

  async updateUserStatus(userId: string, isActive: boolean) {
    const res = await api.patch<ApiResponse<any>>(`/admin/users/${userId}/status`, { isActive });
    return res.data.data!;
  },

  async resetUserPassword(userId: string, newPassword: string) {
    const res = await api.post<ApiResponse<any>>(`/admin/users/${userId}/reset-password`, { newPassword });
    return res.data.data!;
  },

  async getDoctorsRoster(): Promise<DoctorRosterItem[]> {
    const res = await api.get<ApiResponse<DoctorRosterItem[]>>('/admin/doctors');
    return res.data.data || [];
  },

  async updateDoctorInfo(doctorId: string, data: { specialization: string; roomNo: string; phone?: string }) {
    const res = await api.put<ApiResponse<any>>(`/admin/doctors/${doctorId}`, data);
    return res.data.data!;
  },
};
