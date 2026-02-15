// src/api/coreService.ts
// version: 2.1.0
// FIX: Added 'isRefreshing' lock to prevent multiple refresh calls (Race Condition).
// FIX: Queue failed requests to retry them once token is refreshed.

import axios from 'axios';
import { SuggestedHotel, Wallet } from '@/types/hotel';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://admin.mirisafar.com';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// پرچم برای جلوگیری از رفرش همزمان
let isRefreshing = false;
// صفی برای نگه داشتن درخواست‌های معطل مانده
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

api.interceptors.request.use(config => {
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
}, error => Promise.reject(error));

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            
            if (isRefreshing) {
                // اگر رفرش در حال انجام است، این درخواست را به صف اضافه کن تا بعدا انجام شود
                return new Promise(function(resolve, reject) {
                    failedQueue.push({resolve, reject});
                }).then(token => {
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                    return api(originalRequest);
                }).catch(err => {
                    return Promise.reject(err);
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const refreshToken = localStorage.getItem('refreshToken');
                if (!refreshToken) throw new Error('No refresh token');

                const response = await axios.post(`${API_BASE_URL}/api/auth/token/refresh/`, {
                    refresh: refreshToken
                });

                const { access } = response.data;
                
                // لاگ برای اطمینان از دریافت توکن
                console.log("✅ Token Refreshed:", access);

                localStorage.setItem('accessToken', access);
                
                // هدر دیفالت را هم آپدیت کن برای درخواست‌های بعدی
                api.defaults.headers.common['Authorization'] = `Bearer ${access}`;
                originalRequest.headers.Authorization = `Bearer ${access}`;

                // پردازش صف انتظار
                processQueue(null, access);
                
                return api(originalRequest);

            } catch (refreshError) {
                processQueue(refreshError, null);
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('authUser');
                if (typeof window !== 'undefined') {
                    window.location.href = '/login';
                }
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }
        return Promise.reject(error);
    }
);

// ... (بقیه توابع API مثل getSiteSettings بدون تغییر)
export interface SiteSettings { site_name: string; logo_url: string; }
export interface MenuItem { id: number; title: string; url: string; target: string; }
export const getSiteSettings = async (): Promise<SiteSettings> => { const response = await api.get('/api/settings/'); return response.data; };
export const getMenu = async (menuSlug: string): Promise<MenuItem[]> => { const response = await api.get(`/api/menu/${menuSlug}/`); return response.data; };
export const getSuggestedHotels = async (): Promise<SuggestedHotel[]> => { const response = await api.get('/api/hotels/suggested/'); return response.data; };
export const getUserWallet = async (): Promise<Wallet> => { const response = await api.get('/api/wallet/'); return response.data; };
export const initiateWalletDeposit = async (amount: number): Promise<{ transaction_id: string }> => { const response = await api.post('/api/wallet/initiate-deposit/', { amount }); return response.data; };

export default api;
