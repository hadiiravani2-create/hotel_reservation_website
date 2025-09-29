// src/api/coreService.ts v1.0.1
import axios from "axios";

const api = axios.create({
    // CHANGED: Using the frontend domain. Nginx will proxy /api/ to Django.
    baseURL: "http://hotel.mirisafar.com",
});

export const getSiteSettings = async () => {
    const response = await api.get("/api/settings/");
    return response.data;
};

export const getMenu = async (menuSlug: string) => {
    const response = await api.get(`/api/menu/${menuSlug}/`);
    return response.data;
};

// Export کردن نمونه axios برای استفاده در جای دیگر (اختیاری)
export default api;
