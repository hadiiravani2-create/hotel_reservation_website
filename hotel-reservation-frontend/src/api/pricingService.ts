// src/api/pricingService.ts
import api from './coreService'; // نمونه Axios پیکربندی شده در گام ۱.۳

interface SearchParams {
  city_id: number;
  check_in: string;    // YYYY-MM-DD Jalali
  check_out: string;   // YYYY-MM-DD Jalali
  adults: number;
  children: number;
  // پارامترهای اختیاری
  min_price?: number;
  max_price?: number;
  stars?: string; // ممکن است یک لیست از ID ها باشد
  amenities?: string; // لیست IDها (Comma-separated)
}

// ساختار داده برگشتی از RoomSearchAPIView
interface RoomSearchResult {
  room_id: number;
  room_name: string;
  hotel_id: number;
  hotel_name: string;
  board_options: Array<{
    board_type_id: number;
    board_type_name: string;
    total_price: number;
  }>;
}

// Endpoint: /pricing/api/search/
export const searchRooms = async (params: SearchParams): Promise<RoomSearchResult[]> => {
  const response = await api.get('/pricing/api/search/', { params });
  return response.data;
};

// Endpoint: /pricing/api/calculate-multi-price/
export const calculateMultiPrice = async (data: any): Promise<{ total_price: number }> => {
    const response = await api.post('/pricing/api/calculate-multi-price/', data);
    return response.data;
};

// می‌توانید در این مرحله سرویس‌های City و Amenities را نیز از /hotels/api/ دریافت کنید
export const getCities = async () => {
    const response = await api.get('/hotels/api/cities/'); // ViewSet برای Cities
    return response.data;
}

// Endpoint: /hotels/api/amenities/
export const getAmenities = async () => {
    const response = await api.get('/hotels/api/amenities/');
    return response.data;
}