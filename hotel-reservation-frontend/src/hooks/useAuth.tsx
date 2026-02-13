// FILE: src/hooks/useAuth.tsx
// version: 1.1.1
// FIX: Changed TOKEN_STORAGE_KEY to 'token' to match coreService interceptor.
// FIX: This ensures logout correctly removes the token used by API requests.

import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { login as apiLogin, register as apiRegister, AuthResponse, LoginData, RegisterData } from '../api/authService'; 
import api from '../api/coreService'; 
import { useRouter } from 'next/router';

// Interface for the Authenticated User object
export interface AuthUser {
  id: number;
  username: string;
  first_name?: string; 
  last_name?: string;
  agency_role: { id: number; name: string } | null; 
  agency_id: number | null;
}

// Interface for the context state
interface AuthContextType {
  isAuthenticated: boolean;
  user: AuthUser | null;
  token: string | null;
  login: (data: LoginData) => Promise<AuthResponse>;
  register: (data: RegisterData) => Promise<AuthResponse>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// --- CRITICAL FIX: Key must match what coreService.ts reads ---
const TOKEN_STORAGE_KEY = 'token'; 
// -------------------------------------------------------------
const USER_STORAGE_KEY = 'authUser';

export const useAuth = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState<AuthUser | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    const setAuthData = useCallback((newToken: string, newUser: AuthUser) => {
        setToken(newToken);
        setUser(newUser);
        setIsAuthenticated(true);
        localStorage.setItem(TOKEN_STORAGE_KEY, newToken);
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(newUser));
        api.defaults.headers.common['Authorization'] = `Token ${newToken}`;
    }, []);

    const clearAuthData = useCallback(() => {
        setToken(null);
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        localStorage.removeItem(USER_STORAGE_KEY);
        delete api.defaults.headers.common['Authorization'];
    }, []);

    useEffect(() => {
        const storedToken = localStorage.getItem(TOKEN_STORAGE_KEY);
        const storedUser = localStorage.getItem(USER_STORAGE_KEY);
        
        if (storedToken && storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser) as AuthUser; 
                setAuthData(storedToken, parsedUser);
            } catch (error) {
                clearAuthData();
            }
        }
        setIsLoading(false);
    }, [clearAuthData, setAuthData]);

    // Login API call
    const login = useCallback(async (data: LoginData) => {
        const response = await apiLogin(data);
        setAuthData(response.token, response.user as AuthUser); 
        return response; 
    }, [setAuthData]);

    // Register API call
    const register = useCallback(async (data: RegisterData) => {
        const response = await apiRegister(data);
        setAuthData(response.token, response.user as AuthUser); 
        return response; 
    }, [setAuthData]);

    const logout = useCallback(() => {
        clearAuthData();
        // جهت اطمینان بیشتر، اگر کلیدی با نام قدیمی وجود دارد هم پاک شود
        localStorage.removeItem('authToken'); 
        router.push('/login'); 
    }, [clearAuthData, router]);

    return { isAuthenticated, user, token, login, register, logout, isLoading };
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const auth = useAuth();

    return (
        <AuthContext.Provider value={auth}>
            {auth.isLoading ? (
                <div className="flex items-center justify-center min-h-screen">Checking auth status...</div>
            ) : (
                children
            )}
        </AuthContext.Provider>
    );
};

export const useAuthContext = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuthContext must be used within an AuthProvider');
    }
    return context;
};
