// src/hooks/useAuth.ts
import React, { useState, useEffect, useContext, createContext } from 'react';
import { useRouter } from 'next/router';

import api from '../api/coreService'; 
import { login, register } from '../api/authService'; // <--- این خط صحیح است
// ...
// تعریف مدل داده‌های کاربر
interface User {
  username: string;
  // می توانید فیلدهای بیشتری مانند firstName, lastName, agencyRole را اضافه کنید
}


// تعریف نوع (Type) برای Context
interface AuthContextType {
  isAuthenticated: boolean;
  user: { id: number; name: string } | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

// ایجاد Context با یک مقدار پیش‌فرض که خطا (Error) پرتاب کند
const AuthContext = createContext<AuthContextType | undefined>(undefined);
// نام کلید ذخیره‌سازی توکن
const AUTH_TOKEN_KEY = 'authToken';

// --- Auth Provider ---
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // useEffect برای بارگذاری توکن و تنظیم Interceptor
  useEffect(() => {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    
    // ۱. تنظیم Interceptor
    api.interceptors.request.use(config => {
        const currentToken = localStorage.getItem(AUTH_TOKEN_KEY);
        if (currentToken) {
            // تزریق توکن به هدر Authorization برای تمام درخواست‌های محافظت‌شده
            config.headers.Authorization = `Token ${currentToken}`;
        }
        return config;
    });

    // ۲. بررسی توکن در زمان بارگذاری (می‌تواند شامل فراخوانی /api/profile هم باشد)
    if (token) {
        // در یک سناریوی واقعی، باید توکن را اعتبارسنجی کرد، اما برای سادگی فرض می‌کنیم معتبر است.
        // در اینجا باید منطقی برای دیکد کردن یا فراخوانی یک API برای دریافت اطلاعات کاربر بر اساس توکن اضافه شود.
        setUser({ username: "Guest" }); // مقداردهی موقت
    }
    
    setLoading(false);
  }, []);

  const loginHandler = async (data: any) => {
    const { token } = await login(data);
    localStorage.setItem(AUTH_TOKEN_KEY, token);
    setUser({ username: data.username }); 
    router.push('/'); // هدایت پس از ورود موفق
  };

  const registerHandler = async (data: any) => {
    const { token, user: userData } = await register(data);
    localStorage.setItem(AUTH_TOKEN_KEY, token);
    setUser({ username: userData.username });
    router.push('/'); // هدایت پس از ثبت نام موفق
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
  };

  // تا زمانی که وضعیت کاربر مشخص نشده، چیزی نمایش نمی‌دهیم.
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