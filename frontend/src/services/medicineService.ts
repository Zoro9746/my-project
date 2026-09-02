import { api } from './api';
import { ApiResponse } from '../types';

export interface Medicine {
  id: string;
  name: string;
  category: string;
  unit: string;
  quantity: number;
  expiryDate: string;
  reorderLevel: number;
  isActive: boolean;
}

export const medicineService = {
  async getAllMedicines(): Promise<Medicine[]> {
    const res = await api.get<ApiResponse<Medicine[]>>('/medicines');
    return res.data.data || [];
  },
};
