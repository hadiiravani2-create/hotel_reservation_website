// src/api/authService.ts
import api from './coreService'; // نمونه Axios پیکربندی شده در گام ۱.۳

interface LoginData {
  username: string;
  password: string;
}

interface AuthResponse {
  token: string;
  user: {
    username: string;
    // ... سایر اطلاعات کاربر
  };
}

// Endpoint: /api/auth/login/
export const login = async (data: LoginData): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/api/auth/login/', data);
  return response.data;
};

// Endpoint: /api/auth/register/
export const register = async (data: any): Promise<AuthResponse> => {
  // استفاده از UserRegisterSerializer که شامل username، password و password2 است.
  const response = await api.post<AuthResponse>('/api/auth/register/', data);
  return response.data;
};

// می تواند شامل توابع logout و getUserProfile هم باشد.