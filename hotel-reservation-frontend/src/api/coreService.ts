// src/api/coreService.ts
// src/api/coreService.ts (حتماً این Placeholder را تغییر دهید)
import axios from 'axios';

const api = axios.create({
  // آدرس واقعی سرور جنگو شما را اینجا قرار دهید:
  baseURL: 'https://demo.mirisafar.com/', 
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