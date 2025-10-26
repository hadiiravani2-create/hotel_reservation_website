// src/api/pricingService.ts
// version: 1.2.4
// FIX: Corrected API paths for hotel services to match the new standardized /api/hotels/ prefix.

import api from './coreService';
import { AvailableRoom, CancellationPolicy } from '@/types/hotel'; 

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
    latitude: string;
    longitude: string;
    is_online: boolean;
    rules: string | null;
    check_in_time: string | null;
    check_out_time: string | null;
    available_rooms: AvailableRoom[];
    cancellation_policy_normal: CancellationPolicy | null;
    cancellation_policy_peak: CancellationPolicy | null;
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
    total_price: number; 
}

// Endpoint: /pricing/api/calculate-multi-price/
//export const calculateMultiPrice = async (data: MultiPriceData): Promise<{ total_price: number }> => {
export const calculateMultiPrice = async (data: any): Promise<MultiPriceData> => {
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

    // FIX: Removed redundant /hotels prefix. Correct path is /api/hotels/<slug>
    const response = await api.get<HotelDetails>(`/api/hotels/${slug}/`, { params });
    return response.data;
};

export const getCities = async () => {
    // FIX: Removed redundant /hotels prefix. Correct path is /api/hotels/cities/
    const response = await api.get('/api/hotels/cities/');
    return response.data;
}

export const getAmenities = async () => {
    // FIX: Removed redundant /hotels prefix. Correct path is /api/hotels/amenities/
    const response = await api.get('/api/hotels/amenities/');
    return response.data;
}
