// src/api/admin/hotelService.ts

import api from '@/api/coreService';
import { AdminHotel, PaginatedResponse } from '@/types/admin';
import { HotelDetails, BoardType } from '@/types/hotel';
// تبدیل کننده داده‌های بک‌اِند به فرمت مورد نیاز ادمین
// این تابع کمک می‌کند حتی اگر نام فیلدها کمی متفاوت بود، برنامه کرش نکند
const transformToAdminHotel = (data: any): AdminHotel => {
    return {
        id: data.id,
        name: data.name,
        // اگر city یک آبجکت بود (مثل تایپ HotelDetails)، نامش را بردار، اگر رشته بود خودش را
        city_name: typeof data.city === 'object' ? data.city?.name : (data.city_name || 'نامشخص'),
        stars: data.stars || 0,
        is_active: data.is_active ?? true, // اگر فیلد is_active نبود، پیش‌فرض فعال در نظر بگیر
        // عکس اصلی را پیدا کن
        image: data.main_image || (data.images && data.images.length > 0 ? data.images[0].image : undefined),
        total_rooms: data.total_rooms || 0
    };
};


export const getBoardTypes = async (): Promise<BoardType[]> => {
    const response = await api.get<BoardType[]>('/api/hotels/board-types/');
    return response.data;
};

export const getAdminHotels = async (page = 1, search = ''): Promise<PaginatedResponse<AdminHotel>> => {
  try {
    // درخواست به API
    const response = await api.get(`/api/hotels/`, {
      params: { page, search }
    });
    
    const data = response.data;
    
    // حالت ۱: اگر پاسخ صفحه‌بندی شده استاندارد باشد (دارای count و results)
    if (data.results && Array.isArray(data.results)) {
        return {
            count: data.count,
            next: data.next,
            previous: data.previous,
            results: data.results.map(transformToAdminHotel)
        };
    } 
    // حالت ۲: اگر پاسخ مستقیماً یک آرایه باشد (بدون صفحه‌بندی)
    else if (Array.isArray(data)) {
        return {
            count: data.length,
            next: null,
            previous: null,
            results: data.map(transformToAdminHotel)
        };
    }
    
    // حالت ۳: ساختار ناشناخته
    console.warn("ساختار داده دریافتی از API هتل‌ها ناشناخته است:", data);
    return { count: 0, next: null, previous: null, results: [] };

  } catch (error) {
    console.error("خطا در دریافت لیست هتل‌ها:", error);
    throw error;
  }
};
