import { api } from './api';
import { ApiResponse, User } from '../types';

export const authService = {
  async registerStudent(data: any): Promise<{ user: User; token: string }> {
    const res = await api.post<ApiResponse<{ user: User; token: string }>>('/auth/register', data);
    return res.data.data!;
  },

  async login(credentials: any): Promise<{ user: User; token: string }> {
    const res = await api.post<ApiResponse<{ user: User; token: string }>>('/auth/login', credentials);
    return res.data.data!;
  },

  async me(): Promise<User> {
    const res = await api.get<ApiResponse<User>>('/auth/me');
    return res.data.data!;
  },

  async updateProfile(data: any): Promise<User> {
    const res = await api.put<ApiResponse<User>>('/users/profile', data);
    return res.data.data!;
  },
};
