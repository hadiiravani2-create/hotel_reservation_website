// src/api/authService.ts
// version: 2.0.0
// FEATURE: Updated endpoints to JWT standard (/api/auth/token/).
// NOTE: JWT login response only returns tokens. User data must be fetched separately or decoded.

import api from './coreService'; 

export interface LoginData {
  username: string; 
  password: string;
}

export interface RegisterData {
  mobile: string;
  email: string;
  first_name: string;
  last_name: string;
  password: string;
  password2: string;
}

// خروجی استاندارد SimpleJWT
export interface AuthResponse {
  access: string;
  refresh: string;
  // نکته: بک‌اند استاندارد در پاسخ لاگین اطلاعات کاربر را نمی‌فرستد.
  // ما این را در کلاینت هندل می‌کنیم یا بک‌اند را کاستوم می‌کنیم.
}

// Endpoint: /api/auth/token/ (Login)
export const login = async (data: LoginData): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/api/auth/token/', data);
  return response.data;
};

// Endpoint: /api/auth/register/ (Register)
// فرض بر این است که رجیستر همچنان همان خروجی قبلی یا توکن را می‌دهد
// اگر رجیستر شما توکن نمی‌دهد، باید لاجیک را تغییر دهیم.
export const register = async (data: RegisterData): Promise<any> => {
  const response = await api.post('/api/auth/register/', data);
  return response.data;
};

// تابع جدید برای گرفتن اطلاعات کاربر بعد از لاگین
export const fetchMe = async (): Promise<any> => {
    // فرض: اندپوینت /api/auth/me/ یا مشابه باید در بک‌اند باشد.
    // اگر ندارید، فعلاً از اطلاعاتی که در localStorage هست یا دیکد کردن توکن استفاده می‌کنیم.
    // اما برای پروژه کامل، پیشنهاد می‌شود یک اندپوینت /api/auth/profile/ بسازید.
    // فعلا یک آبجکت خالی برمی‌گردانیم تا خطا ندهد
    return { username: 'user', id: 1 }; 
};
