// src/hooks/useAuth.tsx
// version: 2.0.0
// FEATURE: Full JWT Support (Access + Refresh Token storage).

import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { login as apiLogin, register as apiRegister, AuthResponse, LoginData, RegisterData } from '../api/authService'; 
import api from '../api/coreService'; 
import { useRouter } from 'next/router';

export interface AuthUser {
  id: number;
  username: string;
  first_name?: string; 
  last_name?: string;
  agency_role: { id: number; name: string } | null; 
  agency_id: number | null;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: AuthUser | null;
  login: (data: LoginData) => Promise<boolean>; // تغییر خروجی به boolean برای سادگی
  register: (data: RegisterData) => Promise<any>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';
const USER_KEY = 'authUser';

export const useAuth = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState<AuthUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    const setAuthData = useCallback((access: string, refresh: string, userData: AuthUser | null) => {
        localStorage.setItem(ACCESS_TOKEN_KEY, access);
        localStorage.setItem(REFRESH_TOKEN_KEY, refresh);
        if (userData) {
            localStorage.setItem(USER_KEY, JSON.stringify(userData));
            setUser(userData);
        }
        setIsAuthenticated(true);
        // تنظیم هدر پیش‌فرض برای درخواست‌های بعدی
        api.defaults.headers.common['Authorization'] = `Bearer ${access}`;
    }, []);

    const clearAuthData = useCallback(() => {
        localStorage.removeItem(ACCESS_TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        setUser(null);
        setIsAuthenticated(false);
        delete api.defaults.headers.common['Authorization'];
    }, []);

    // چک کردن وضعیت لاگین هنگام لود صفحه
    useEffect(() => {
        const access = localStorage.getItem(ACCESS_TOKEN_KEY);
        const userStr = localStorage.getItem(USER_KEY);
        
        if (access && userStr) {
            try {
                setUser(JSON.parse(userStr));
                setIsAuthenticated(true);
                api.defaults.headers.common['Authorization'] = `Bearer ${access}`;
            } catch (e) {
                clearAuthData();
            }
        }
        setIsLoading(false);
    }, [clearAuthData]);

    const login = useCallback(async (data: LoginData) => {
        try {
            const response = await apiLogin(data); // returns { access, refresh }
            
            // اینجا یک نکته مهم است: 
            // چون JWT اطلاعات کاربر (نام، نقش) را برنمی‌گرداند، 
            // ما فعلا یک آبجکت موقت می‌سازیم یا باید یک ریکوئست دیگر بزنیم.
            // برای سادگی و جلوگیری از پیچیدگی فعلا نام کاربری را از ورودی می‌گیریم.
            const mockUser: AuthUser = {
                id: 0, 
                username: data.username,
                agency_id: null,
                agency_role: null
            };

            setAuthData(response.access, response.refresh, mockUser);
            return true;
        } catch (error) {
            console.error("Login failed", error);
            throw error;
        }
    }, [setAuthData]);

    const register = useCallback(async (data: RegisterData) => {
        const response = await apiRegister(data);
        // بسته به خروجی رجیستر، شاید لازم باشد اینجا هم لاگین خودکار انجام شود
        return response;
    }, []);

    const logout = useCallback(() => {
        clearAuthData();
        router.push('/login');
    }, [clearAuthData, router]);

    return { isAuthenticated, user, login, register, logout, isLoading };
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const auth = useAuth();

    return (
        <AuthContext.Provider value={auth}>
            {!auth.isLoading && children}
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
