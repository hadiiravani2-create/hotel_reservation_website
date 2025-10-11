// src/api/pricingService.ts
// version: 1.2.3
// FIX: Confirmed explicit export of searchHotels, SearchParams, and HotelSearchResult to resolve compilation error in search.tsx.

import api from './coreService';
import { AvailableRoom } from '@/types/hotel'; 

// --- START: HotelDetails Interface (Unchanged) ---
export interface HotelDetails {
    id: number;
    name: string;
    slug: string;
    stars: number;
    description: string;
    address: string;
    images: { image: string; caption: string | null; }[];
    amenities: { id: number; name: string; icon: string | null; }[];
    rules: string | null;
    check_in_time: string | null;
    check_out_time: string | null;
    available_rooms: AvailableRoom[]; 
}
// --- END: HotelDetails Interface ---

// --- START: MultiPriceData (Unchanged) ---
export interface MultiPriceData {
    check_in: string;
    check_out: string;
    booking_rooms: Array<{
      room_type_id: number;
      board_type_id: number;
      quantity: number;
      extra_adults: number;
      children_count: number;
    }>;
    user_id?: number | null; 
}

// Endpoint: /pricing/api/calculate-multi-price/
export const calculateMultiPrice = async (data: MultiPriceData): Promise<{ total_price: number }> => {
    const response = await api.post('/pricing/api/calculate-multi-price/', data);
    return response.data;
};
// --- END: MultiPriceData ---

// --- Hotel Search Functions ---

export interface SearchParams { 
  city_id: number;
  check_in: string;    
  duration: number; 
  // ... other optional params
}

export interface HotelSearchResult {
  hotel_id: number;
  hotel_name: string;
  hotel_slug: string;
  hotel_stars: number;
  min_price: number;
}

// Exported function required by search.tsx
export const searchHotels = async (params: SearchParams): Promise<HotelSearchResult[]> => {
  const response = await api.get('/pricing/api/search/', { params });
  return response.data;
};


// --- Other existing functions ---

// This function now accepts and includes user_id in the request parameters
export const getHotelDetails = async (
    slug: string,
    check_in?: string,
    duration?: string,
    user_id?: number | null 
): Promise<HotelDetails> => {
    const params: { [key: string]: string | number | undefined } = {};
    if (check_in) params.check_in = check_in;
    if (duration) params.duration = duration;
    if (user_id) params.user_id = user_id; 

    const response = await api.get<HotelDetails>(`/hotels/api/hotels/${slug}/`, { params });
    return response.data;
};

export const getCities = async () => {
    const response = await api.get('/hotels/api/cities/');
    return response.data;
}

export const getAmenities = async () => {
    const response = await api.get('/hotels/api/amenities/');
    return response.data;
}
