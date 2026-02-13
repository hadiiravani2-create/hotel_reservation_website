// src/api/pricingService.ts
// version: 1.5.0
// FIX: Restored correct API paths (/api/hotels/...) and preserved all original functions.
// FIX: Removed 'HotelDetails' definition (it's now in types/hotel.d.ts) to avoid duplication.

import api from './coreService';
import { AvailableRoom, HotelDetails } from '@/types/hotel';

// --- Interfaces ---

export interface SearchParams {
  city_id: number;
  check_in: string;
  duration: number;
  // Optional Filter params
  min_price?: string; 
  max_price?: string;
  stars?: string;     
  amenities?: string; 
}

export interface PriceQuoteInput {
  room_type_id: number;
  board_type_id: number;
  check_in: string;
  check_out: string;
  adults?: number;
  children?: number;
}

export interface MultiPriceInput {
  booking_rooms: Array<{
    room_type_id: number;
    board_type_id: number;
    quantity: number;
    extra_adults: number;
    children_count: number;
  }>;
  check_in: string;
  check_out: string;
  user_id?: number | null;
}

export interface MultiPriceData {
  check_in: string;
  check_out: string;
  booking_rooms: any[]; // Simplified for brevity, detailed in input
  user_id?: number | null;
  total_room_price: number; // قیمت خالص اتاق‌ها (بدون مالیات)
  total_vat: number;        // مجموع مالیات محاسبه شده برای اتاق‌ها
  total_price: number;      // قیمت نهایی (شامل همه موارد)
  tax_percentage?: number;
}

export interface CityOption {
    id: number;
    name: string;
    slug: string;
}

// --- API Functions ---

// 1. Get List of Cities
export const getCities = async (): Promise<CityOption[]> => {
    try {
        // FIX: Restored correct path
        const response = await api.get('/api/hotels/cities/');
        return response.data;
    } catch (error) {
        console.error("Error fetching cities:", error);
        return [];
    }
};

// 2. Search Hotels (Enhanced with filters)
export const searchHotels = async (params: SearchParams): Promise<any[]> => {
  const queryParams = new URLSearchParams();
  queryParams.append('city_id', params.city_id.toString());
  queryParams.append('check_in', params.check_in);
  queryParams.append('duration', params.duration.toString());

  if (params.min_price) queryParams.append('min_price', params.min_price);
  if (params.max_price) queryParams.append('max_price', params.max_price);
  if (params.stars) queryParams.append('stars', params.stars);
  if (params.amenities) queryParams.append('amenities', params.amenities);

  const response = await api.get(`/pricing/api/search/?${queryParams.toString()}`);
  return response.data;
};

// 3. Get Hotel Details
export const getHotelDetails = async (
    slug: string,
    check_in?: string,
    duration?: string | number, // Accept string or number
    user_id?: number | null 
): Promise<HotelDetails> => {
    const params: { [key: string]: string | number | undefined } = {};
    if (check_in) params.check_in = check_in;
    if (duration) params.duration = duration;
    if (user_id) params.user_id = user_id; 

    // FIX: Restored correct path
    const response = await api.get<HotelDetails>(`/api/hotels/${slug}/`, { params });
    return response.data;
};

// Wrapper for backward compatibility
export const getAvailableRooms = async (hotelSlug: string, checkIn: string, duration: number): Promise<HotelDetails> => {
  return getHotelDetails(hotelSlug, checkIn, duration);
};

// 4. Get Price Quote (Single Room)
export const getPriceQuote = async (data: PriceQuoteInput) => {
  const response = await api.post('/pricing/api/quote/', data);
  return response.data;
};

// 5. Calculate Multi-Room Price (Cart)
export const calculateMultiPrice = async (data: MultiPriceInput): Promise<MultiPriceData> => {
  // FIX: Restored correct endpoint from your uploaded file
  const response = await api.post('/pricing/api/calculate-multi-price/', data);
  return response.data;
};

// 6. Get Amenities List
export const getAmenities = async (): Promise<{ id: number; name: string }[]> => {
  try {
      // FIX: Restored correct path
      const response = await api.get('/api/hotels/amenities/'); 
      return response.data;
  } catch (error) {
      console.warn("Amenities endpoint error, returning empty list.", error);
      return [];
  }
};
