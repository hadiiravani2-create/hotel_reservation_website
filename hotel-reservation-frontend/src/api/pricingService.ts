// src/api/pricingService.ts
// version: 1.2.0
// Final Version: Merged the new HotelDetails interface with the existing calculateMultiPrice function to support both the hotel details and checkout pages.

import api from './coreService';
import { AvailableRoom } from '@/types/hotel'; // Using the standardized, correct type

// --- START: Final, Corrected HotelDetails Interface ---
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
    // Uses the correct, detailed room structure from types/hotel.d.ts
    available_rooms: AvailableRoom[]; 
}
// --- END: Final, Corrected HotelDetails Interface ---

// --- START: Retained from your v1.0.2 for checkout page compatibility ---
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
}

// Endpoint: /pricing/api/calculate-multi-price/
export const calculateMultiPrice = async (data: MultiPriceData): Promise<{ total_price: number }> => {
    const response = await api.post('/pricing/api/calculate-multi-price/', data);
    return response.data;
};
// --- END: Retained from your v1.0.2 ---

// --- Other existing functions ---
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

export const searchHotels = async (params: SearchParams): Promise<HotelSearchResult[]> => {
  const response = await api.get('/pricing/api/search/', { params });
  return response.data;
};

// This function now correctly returns the new HotelDetails type
export const getHotelDetails = async (
    slug: string,
    check_in?: string,
    duration?: string
): Promise<HotelDetails> => {
    const params: { [key: string]: string | undefined } = {};
    if (check_in) params.check_in = check_in;
    if (duration) params.duration = duration;

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
