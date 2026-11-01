import { api } from './api';
import { ApiResponse } from '../types';

export interface AppointmentReportData {
  dateRange: { startDate: string; endDate: string };
  totalAppointments: number;
  statusCounts: { CONFIRMED: number; COMPLETED: number; CANCELLED: number };
  doctorVolume: { doctorName: string; total: number; completed: number }[];
  appointments: {
    id: string;
    date: string;
    timeSlot: string;
    tokenNo: number;
    status: string;
    studentName: string;
    studentRollNo: string;
    doctorName: string;
  }[];
}

export interface MedicationConsumptionReportData {
  dateRange: { startDate: string; endDate: string };
  totalDispensedTransactions: number;
  medicinesConsumedCount: number;
  fastMovingCount: number;
  slowMovingCount: number;
  consumptionList: {
    medicineId: string;
    medicineName: string;
    category: string;
    unit: string;
    dispensedQuantity: number;
    movementCategory: 'FAST_MOVING' | 'SLOW_MOVING';
  }[];
}

export interface PatientVisitsReportData {
  totalVisits: number;
  visits: {
    visitId: string;
    createdAt: string;
    studentName: string;
    studentRollNo: string;
    department: string;
    doctorName: string;
    symptoms: string;
    diagnosis: string;
    notes: string;
    prescribedMedicines: string;
  }[];
}

export const reportService = {
  async getAppointmentSummaryReport(startDate?: string, endDate?: string): Promise<AppointmentReportData> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const res = await api.get<ApiResponse<AppointmentReportData>>(`/reports/appointments?${params.toString()}`);
    return res.data.data!;
  },

  async getMedicationConsumptionReport(startDate?: string, endDate?: string): Promise<MedicationConsumptionReportData> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const res = await api.get<ApiResponse<MedicationConsumptionReportData>>(`/reports/medications?${params.toString()}`);
    return res.data.data!;
  },

  async getPatientVisitsReport(startDate?: string, endDate?: string): Promise<PatientVisitsReportData> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const res = await api.get<ApiResponse<PatientVisitsReportData>>(`/reports/visits?${params.toString()}`);
    return res.data.data!;
  },
};
