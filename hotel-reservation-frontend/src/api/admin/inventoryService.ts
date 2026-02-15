// src/api/admin/inventoryService.ts
import api from '@/api/coreService';
import { RoomType } from '@/types/hotel';

export interface StockUpdateData {
  room: number;
  start_date: string; // YYYY-MM-DD (Miladi)
  end_date: string;
  quantity: number;   // موجودی کل اتاق
}

// تایپ فقط برای آپدیت قیمت (Pricing)
export interface PriceUpdateData {
  room: number;
  start_date: string;
  end_date: string;
  board_type: number;  // نوع برد (صبحانه، ...)
  price: number;
  extra_price: number;
  child_price: number;
}

export interface CalendarDayData {
  date: string;       // YYYY-MM-DD
  price?: number;
  stock?: number;
  is_closed?: boolean;
}

// تابع جدید: دریافت وضعیت تقویمی یک اتاق
export const getRoomCalendar = async (roomId: number, start: string, end: string): Promise<CalendarDayData[]> => {
  // فرض: بک‌اند اندپوینتی دارد که لیست قیمت/موجودی بازه را می‌دهد
  // اگر ندارید، فعلاً آرایه خالی برمی‌گردانیم تا فرانت کرش نکند
  try {
      const response = await api.get(`/pricing/api/inventory/calendar/`, {
        params: { room: roomId, start_date: start, end_date: end }
      });
      return response.data;
  } catch (e) {
      console.warn("API تقویم هنوز آماده نیست");
      return []; 
  }
};

export const getHotelRooms = async (hotelId: number): Promise<RoomType[]> => {
  const response = await api.get(`/api/hotels/${hotelId}/rooms/`);
  return response.data;
};

// تابع ۱: فقط آپدیت موجودی
export const updateStock = async (data: StockUpdateData) => {
  // فرض: اندپوینت بک‌اند برای آپدیت موجودی
  return await api.post(`/pricing/api/inventory/update-stock/`, data);
};

// تابع ۲: فقط آپدیت قیمت
export const updatePrice = async (data: PriceUpdateData) => {
  // فرض: اندپوینت بک‌اند برای آپدیت قیمت
  return await api.post(`/pricing/api/inventory/update-price/`, data);
};

