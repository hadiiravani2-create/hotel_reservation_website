// src/api/pricingService.ts v1.0.1
import api from './coreService'; // نمونه Axios پیکربندی شده در گام ۱.۳

// Interface for search parameters (for searchRooms function)
export interface SearchParams { // Exported for use in search.tsx
  city_id: number; // Reverted to strict number for API payload
  check_in: string;    // YYYY-MM-DD Jalali
  check_out: string;   // YYYY-MM-DD Jalali
  adults: number;
  children: number;
  // Optional parameters
  min_price?: number;
  max_price?: number;
  stars?: string; // May be a list of IDs
  amenities?: string; // Comma-separated list of IDs
}

// Interface for calculating multi price payload (Fixes 'any' at line 37)
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

// Interface for HotelDetails (minimal definition to avoid 'any' at line 41)
export interface HotelDetailsResponse {
    name: string;
    stars: number;
    address: string;
    description: string;
    slug: string;
    images: { id: number; url: string }[];
    amenities: { id: number; name: string; }[];
    rooms: { id: number; room_type: string; capacity: number; current_price: number; }[];
}


// Structure of data returned from RoomSearchAPIView
export interface RoomSearchResult {
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
export const calculateMultiPrice = async (data: MultiPriceData): Promise<{ total_price: number }> => {
    const response = await api.post('/pricing/api/calculate-multi-price/', data);
    return response.data;
};

// Fixed any in the Promise return type
export const getHotelDetails = async (slug: string): Promise<HotelDetailsResponse> => {
    // Endpoint: /hotels/api/hotels/<slug>/
    const response = await api.get<HotelDetailsResponse>(`/hotels/api/hotels/${slug}/`); 
    return response.data;
};

export const getCities = async () => {
    const response = await api.get('/hotels/api/cities/'); // ViewSet for Cities
    return response.data;
}

// Endpoint: /hotels/api/amenities/
export const getAmenities = async () => {
    const response = await api.get('/hotels/api/amenities/');
    return response.data;
}
