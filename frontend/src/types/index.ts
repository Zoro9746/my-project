export type Role = 'STUDENT' | 'DOCTOR' | 'PHARMACIST' | 'ADMIN';

export interface StudentProfile {
  id: string;
  userId: string;
  rollNo: string;
  department: string;
  bloodGroup: string;
  allergies?: string;
  emergencyContact: string;
}

export interface DoctorProfile {
  id: string;
  userId: string;
  specialization: string;
  roomNo: string;
  phone: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  isActive: boolean;
  createdAt?: string;
  student?: StudentProfile;
  doctor?: DoctorProfile;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: any;
}
