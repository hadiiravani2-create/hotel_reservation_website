// In src/api/servicesService.ts
import api from './coreService';
import { HotelService } from '@/types/hotel';

/**
 * Fetches the list of available add-on services for a specific hotel.
 * This function is designed to handle 404 errors gracefully.
 */
export const fetchHotelServices = async (hotelId: number): Promise<HotelService[]> => {
  try {
    const response = await api.get(`/api/services/hotel/${hotelId}/`);
    return response.data;
  } catch (error: any) {
    // If the API returns 404, it means the module is disabled or no services are defined.
    // We return an empty array to signify that there are no services to show.
    if (error.response && error.response.status === 404) {
      return [];
    }
    // For other errors, we re-throw them to be handled by React Query.
    throw error;
  }
};
