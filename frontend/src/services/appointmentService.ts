import { api } from './api';
import { ApiResponse } from '../types';

export interface Appointment {
  id: string;
  studentId: string;
  doctorId: string;
  date: string;
  timeSlot: string;
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  tokenNo: number;
  createdAt: string;
  doctor: {
    specialization: string;
    roomNo: string;
    phone: string;
    user: {
      name: string;
      email: string;
    };
  };
  student: {
    rollNo: string;
    department: string;
    bloodGroup: string;
    allergies?: string;
    emergencyContact: string;
    user: {
      name: string;
      email: string;
    };
  };
  visit?: any;
  prescription?: any;
}

export interface DoctorQueueData {
  todayDate: string;
  doctorName: string;
  specialization: string;
  roomNo: string;
  metrics: {
    total: number;
    pending: number;
    completed: number;
    cancelled: number;
  };
  queue: Appointment[];
}

export const appointmentService = {
  async bookAppointment(data: { doctorId: string; date: string; timeSlot: string }): Promise<Appointment> {
    const res = await api.post<ApiResponse<Appointment>>('/appointments', data);
    return res.data.data!;
  },

  async getAppointments(filters?: { date?: string; status?: string }): Promise<Appointment[]> {
    const params = new URLSearchParams();
    if (filters?.date) params.append('date', filters.date);
    if (filters?.status) params.append('status', filters.status);

    const res = await api.get<ApiResponse<Appointment[]>>(`/appointments?${params.toString()}`);
    return res.data.data || [];
  },

  async cancelAppointment(appointmentId: string): Promise<Appointment> {
    const res = await api.patch<ApiResponse<Appointment>>(`/appointments/${appointmentId}/cancel`);
    return res.data.data!;
  },

  async rescheduleAppointment(appointmentId: string, newDate: string, newTimeSlot: string): Promise<Appointment> {
    const res = await api.patch<ApiResponse<Appointment>>(`/appointments/${appointmentId}/reschedule`, {
      newDate,
      newTimeSlot,
    });
    return res.data.data!;
  },

  async getDoctorTodayQueue(): Promise<DoctorQueueData> {
    const res = await api.get<ApiResponse<DoctorQueueData>>('/appointments/queue/today');
    return res.data.data!;
  },
};
