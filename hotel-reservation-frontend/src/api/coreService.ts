// src/api/coreService.ts
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://your-backend-domain.com/', // URL اصلی بک اند جنگو
});

export const getSiteSettings = async () => {
  const response = await api.get('/api/settings/');
  return response.data;
};

export const getMenu = async (menuSlug: string) => {
  const response = await api.get(`/api/menu/${menuSlug}/`);
  return response.data;
};

// Export کردن نمونه axios برای استفاده در جای دیگر (اختیاری)
export default api;