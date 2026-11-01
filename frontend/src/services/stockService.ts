import { api } from './api';
import { ApiResponse } from '../types';
import { Medicine } from './medicineService';

export interface StockTransaction {
  id: string;
  medicineId: string;
  type: 'IN' | 'OUT';
  quantity: number;
  performedByUserId: string;
  referenceNotes?: string;
  createdAt: string;
  medicine: Medicine;
  performedBy: {
    name: string;
    email: string;
    role?: string;
  };
}

export interface StockAlertsSummary {
  summary: {
    totalMedicines: number;
    lowStockCount: number;
    nearExpiryCount: number;
    expiredCount: number;
  };
  lowStock: (Medicine & { alertType: string; daysRemaining: number })[];
  nearExpiry: (Medicine & { alertType: string; daysRemaining: number })[];
  expired: (Medicine & { alertType: string; daysRemaining: number })[];
}

export const stockService = {
  async dispensePrescription(prescriptionId: string) {
    const res = await api.post<ApiResponse<any>>('/stock/dispense', { prescriptionId });
    return res.data.data!;
  },

  async addStockIn(data: { medicineId: string; quantity: number; referenceNotes?: string }) {
    const res = await api.post<ApiResponse<any>>('/stock/in', data);
    return res.data.data!;
  },

  async createMedicine(data: any): Promise<Medicine> {
    const res = await api.post<ApiResponse<Medicine>>('/medicines', data);
    return res.data.data!;
  },

  async updateMedicine(id: string, data: any): Promise<Medicine> {
    const res = await api.put<ApiResponse<Medicine>>(`/medicines/${id}`, data);
    return res.data.data!;
  },

  async getStockTransactions(filters?: { medicineId?: string; type?: string }): Promise<StockTransaction[]> {
    const params = new URLSearchParams();
    if (filters?.medicineId) params.append('medicineId', filters.medicineId);
    if (filters?.type) params.append('type', filters.type);

    const res = await api.get<ApiResponse<StockTransaction[]>>(`/stock/transactions?${params.toString()}`);
    return res.data.data || [];
  },

  async getStockAlerts(): Promise<StockAlertsSummary> {
    const res = await api.get<ApiResponse<StockAlertsSummary>>('/stock/alerts');
    return res.data.data!;
  },
};
