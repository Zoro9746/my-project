import { api } from './api';
import { ApiResponse } from '../types';

export interface DoctorSchedule {
  id: string;
  doctorId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  slotDuration: number;
  active: boolean;
}

export interface Doctor {
  id: string;
  userId: string;
  specialization: string;
  roomNo: string;
  phone: string;
  user: {
    id: string;
    name: string;
    email: string;
    isActive: boolean;
  };
  schedules?: DoctorSchedule[];
}

export interface TimeSlot {
  timeSlot: string;
  isBooked: boolean;
  isPast: boolean;
  bookedByStudentName?: string;
}

export interface DoctorAvailability {
  doctorId: string;
  date: string;
  dayOfWeek: number;
  isWorkingDay: boolean;
  slotDuration?: number;
  workingHours?: string;
  slots: TimeSlot[];
  message?: string;
}

export const doctorService = {
  async getAllDoctors(): Promise<Doctor[]> {
    const res = await api.get<ApiResponse<Doctor[]>>('/doctors');
    return res.data.data || [];
  },

  async getDoctorById(id: string): Promise<Doctor> {
    const res = await api.get<ApiResponse<Doctor>>(`/doctors/${id}`);
    return res.data.data!;
  },

  async getDoctorAvailability(doctorId: string, date: string): Promise<DoctorAvailability> {
    const res = await api.get<ApiResponse<DoctorAvailability>>(`/doctors/${doctorId}/availability?date=${date}`);
    return res.data.data!;
  },

  async updateDoctorSchedule(doctorId: string, scheduleData: any): Promise<DoctorSchedule> {
    const res = await api.post<ApiResponse<DoctorSchedule>>(`/doctors/${doctorId}/schedule`, scheduleData);
    return res.data.data!;
  },
};
