// src/api/authService.ts v1.0.1
import api from './coreService'; // Axios configured instance from step 1.3

// Interface for login data payload
export interface LoginData {
  username: string;
  password: string;
}

// Interface for register data payload (including password confirmation)
export interface RegisterData {
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  password: string;
  password2: string;
}

// NEW: Interface for the Agency Role object returned by the backend (nested in user)
interface AgencyRoleResponse {
    id: number;
    name: string; // The role name string expected by useAuth
}

// Interface for API response
export interface AuthResponse {
  token: string;
  user: {
    username: string;
    // ADDED: agency_role which is now a nested object (or null)
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
// Using RegisterData for input data
export const register = async (data: RegisterData): Promise<AuthResponse> => {
  // Uses UserRegisterSerializer which includes username, password, and password2.
  const response = await api.post<AuthResponse>('/api/auth/register/', data);
  return response.data;
};

// Can also include logout and getUserProfile functions.
