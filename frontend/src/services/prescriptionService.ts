import { api } from './api';
import { ApiResponse } from '../types';

export interface Prescription {
  id: string;
  appointmentId: string;
  visitId?: string;
  status: 'PENDING_DISPENSE' | 'DISPENSED';
  createdAt: string;
  updatedAt: string;
  appointment: {
    doctor: {
      user: {
        name: string;
        email: string;
      };
    };
    student: {
      rollNo: string;
      department: string;
      user: {
        name: string;
        email: string;
      };
    };
  };
  visit?: {
    symptoms: string;
    diagnosis: string;
  };
  items: {
    id: string;
    medicineId: string;
    quantity: number;
    dosageInstructions: string;
    medicine: {
      id: string;
      name: string;
      category: string;
      unit: string;
      quantity: number;
    };
  }[];
}

export const prescriptionService = {
  async getAllPrescriptions(statusFilter?: string): Promise<Prescription[]> {
    const params = statusFilter ? `?status=${statusFilter}` : '';
    const res = await api.get<ApiResponse<Prescription[]>>(`/prescriptions${params}`);
    return res.data.data || [];
  },

  async getPrescriptionById(id: string): Promise<Prescription> {
    const res = await api.get<ApiResponse<Prescription>>(`/prescriptions/${id}`);
    return res.data.data!;
  },
};
