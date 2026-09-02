import { api } from './api';
import { ApiResponse } from '../types';

export interface PrescriptionItemInput {
  medicineId: string;
  quantity: number;
  dosageInstructions: string;
}

export interface CompleteConsultationInput {
  appointmentId: string;
  symptoms: string;
  diagnosis: string;
  notes?: string;
  prescriptionItems?: PrescriptionItemInput[];
}

export interface VisitRecord {
  id: string;
  appointmentId: string;
  studentId: string;
  doctorId: string;
  symptoms: string;
  diagnosis: string;
  notes?: string;
  createdAt: string;
  doctor: {
    user: {
      name: string;
      email: string;
    };
  };
  appointment: {
    date: string;
    timeSlot: string;
    tokenNo: number;
  };
  prescriptions: {
    id: string;
    status: 'PENDING_DISPENSE' | 'DISPENSED';
    createdAt: string;
    items: {
      id: string;
      quantity: number;
      dosageInstructions: string;
      medicine: {
        name: string;
        category: string;
        unit: string;
      };
    }[];
  }[];
}

export interface PatientHistory {
  student: {
    id: string;
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
  visits: VisitRecord[];
}

export const consultationService = {
  async completeConsultation(data: CompleteConsultationInput) {
    const res = await api.post<ApiResponse<any>>('/consultations', data);
    return res.data.data!;
  },

  async getPatientHistory(studentId: string): Promise<PatientHistory> {
    const res = await api.get<ApiResponse<PatientHistory>>(`/consultations/patients/${studentId}/history`);
    return res.data.data!;
  },

  async getMyMedicalHistory(): Promise<PatientHistory> {
    const res = await api.get<ApiResponse<PatientHistory>>('/consultations/my-history');
    return res.data.data!;
  },

  async searchPatients(query: string) {
    const res = await api.get<ApiResponse<any[]>>(`/consultations/patients/search?q=${query}`);
    return res.data.data || [];
  },
};
