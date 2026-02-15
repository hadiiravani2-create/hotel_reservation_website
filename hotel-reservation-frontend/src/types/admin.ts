// src/types/admin.ts

export interface AdminHotel {
  id: number;
  name: string;
  city_name: string; // فرض بر این است که نام شهر از بک‌اند می‌آید
  stars: number;
  is_active: boolean;
  image?: string;
  total_rooms: number; // تعداد انواع اتاق (اختیاری)
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}
