// src/api/authService.ts
// version: 1.1.0
// CHANGE: Updated RegisterData interface to use 'mobile' instead of 'username'.

import api from './coreService'; 

// Interface for login data payload
export interface LoginData {
  username: string; // This can be mobile or email
  password: string;
}

// Interface for register data payload
export interface RegisterData {
  mobile: string; // CHANGED from username
  email: string;
  first_name: string;
  last_name: string;
  password: string;
  password2: string;
}

interface AgencyRoleResponse {
    id: number;
    name: string; 
}

// Interface for API response
export interface AuthResponse {
  token: string;
  user: {
    username: string;
    agency_role: AgencyRoleResponse | null; 
    // ... other user info
  };
}

// Endpoint: /api/auth/login/
export const login = async (data: LoginData): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/api/auth/login/', data);
  return response.data;
};

// Endpoint: /api/auth/register/
export const register = async (data: RegisterData): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/api/auth/register/', data);
  return response.data;
};
