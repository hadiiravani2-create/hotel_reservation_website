// src/api/pricingService.ts v1.0.2
// Update: Search params now use duration instead of check_out, adults, and children.
import api from './coreService'; // نمونه Axios پیکربندی شده در گام ۱.۳

// Interface for search parameters (for searchRooms function)
export interface SearchParams { // Exported for use in search.tsx
  city_id: number;
  check_in: string;    // YYYY-MM-DD Jalali
  duration: number; // Number of nights
  // Optional parameters are kept for filtering on the results page
  min_price?: number;
  max_price?: number;
  stars?: string; 
  amenities?: string;
}

// Interface for calculating multi price payload (No changes needed here)
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

// Interface for HotelDetails (No changes needed here)
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


// Structure of data returned from the new HotelSearchAPIView
export interface HotelSearchResult {
  hotel_id: number;
  hotel_name: string;
  hotel_slug: string; // Added for linking to the details page
  hotel_stars: number;
  min_price: number; // The starting price for the cheapest available room
  // other hotel details can be added here
}

// Endpoint: /pricing/api/search/ - Now searches for hotels
export const searchHotels = async (params: SearchParams): Promise<HotelSearchResult[]> => {
  const response = await api.get('/pricing/api/search/', { params });
  return response.data;
};

// Endpoint: /pricing/api/calculate-multi-price/
export const calculateMultiPrice = async (data: MultiPriceData): Promise<{ total_price: number }> => {
    const response = await api.post('/pricing/api/calculate-multi-price/', data);
    return response.data;
};

// No changes to this function
export const getHotelDetails = async (slug: string): Promise<HotelDetailsResponse> => {
    const response = await api.get<HotelDetailsResponse>(`/hotels/api/hotels/${slug}/`); 
    return response.data;
};

// No changes to this function
export const getCities = async () => {
    const response = await api.get('/hotels/api/cities/');
    return response.data;
}

// No changes to this function
export const getAmenities = async () => {
    const response = await api.get('/hotels/api/amenities/');
    return response.data;
}
