// src/hooks/useAuth.tsx v1.1.1
import React, { useState, useEffect, useContext, createContext } from 'react';
import { useRouter } from 'next/router';

import api from '../api/coreService'; 
// Import types and functions from authService (assuming LoginData/RegisterData/AuthResponse are exported)
import { login, register, LoginData, RegisterData, AuthResponse } from '../api/authService'; 

// Define User data model
interface User {
  username: string;
  // Added agency_role to support dashboard logic and fix type error
  agency_role: string | null; 
}


// Define the type for Context
interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null; // Use the corrected User interface
  // Use LoginData and AuthResponse for strong typing
  login: (data: LoginData) => Promise<void>; 
  register: (data: RegisterData) => Promise<void>; 
  logout: () => void;
  loading: boolean; // Add loading state for context
}

// Create Context with a default value that throws an error
const AuthContext = createContext<AuthContextType | undefined>(undefined);
// Key for token storage
const AUTH_TOKEN_KEY = 'authToken';

// --- Auth Provider ---
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // useEffect for loading token and setting up the Interceptor
  useEffect(() => {
    
    // 1. Setup Interceptor (It is now safe to run here as the file is a Provider/Hook)
    api.interceptors.request.use(config => {
        const currentToken = localStorage.getItem(AUTH_TOKEN_KEY);
        if (currentToken) {
            // Inject token into the Authorization header for all protected requests
            config.headers.Authorization = `Token ${currentToken}`;
        }
        return config;
    });

    // 2. Check token on load
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    if (token) {
        // MOCK: In a real scenario, an API call to get the user profile would be here.
        // For local testing, we mock an Agency Admin user for dashboard access test.
        // This assumes the backend returns 'AgencyUser' for login checks
        setUser({ username: "Guest", agency_role: "admin" }); 
    }
    
    setLoading(false);
  }, []); 

  // Use LoginData for type safety
  const loginHandler = async (data: LoginData) => {
    // We assume the API response includes the user object with agency_role
    const { token, user: userData }: AuthResponse = await login(data); 
    localStorage.setItem(AUTH_TOKEN_KEY, token);
    
    // MOCK: Simulating fetching the agency_role from the API response (or based on a dummy check)
    // FIX: Safely access username and nested agency_role for login
    const username = userData?.username || 'Guest';
    const agencyRole = userData?.agency_role?.name || null;
    
    setUser({ username: username, agency_role: agencyRole }); 
    router.push('/'); 
  };

  // Use RegisterData for type safety
  const registerHandler = async (data: RegisterData) => {
    const { token, user: userData }: AuthResponse = await register(data); 
    localStorage.setItem(AUTH_TOKEN_KEY, token);
    
    // FIX: Safely access username and nested agency_role for registration (where agency_role is null for regular users)
    const username = userData?.username || 'Guest';
    // Access the 'name' property inside the nested 'agency_role' object
    const agencyRole = userData?.agency_role?.name || null;
    
    setUser({ username: username, agency_role: agencyRole });
    // Redirect to login page after successful registration
    router.push('/login?registered=true'); 
  };

  const logoutHandler = () => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    setUser(null);
    router.push('/login');
  };

  const value = {
    user,
    isAuthenticated: !!user,
    login: loginHandler,
    register: registerHandler,
    logout: logoutHandler,
    loading, // Added loading
  };

  // Do not display anything until user status is determined.
  if (loading) {
    return <div>Loading System...</div>; 
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};


// --- Custom Hook ---
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
