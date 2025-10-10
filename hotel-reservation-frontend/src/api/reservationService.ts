// src/api/reservationService.ts v1.1.0
// Feature: Added city_of_origin to GuestPayload.
// Feature: Added extra_requests to BookingRoom payload.
// Feature: Added 'card_to_card' to payment_method choices.
import api from './coreService'; // نمونه Axios پیکربندی شده

// Define GuestPayload interface (based on GuestInputForm.tsx)
export interface GuestPayload {
  first_name: string;
  last_name: string;
  is_foreign: boolean;
  national_id: string;
  passport_number: string;
  phone_number: string;
  nationality: string;
  // New field
  city_of_origin?: string | null; 
}

// Endpoint: /reservations/bookings/
// This Payload is critical and maps directly to CreateBookingSerializer
export interface BookingPayload { 
  booking_rooms: Array<{
    room_type_id: number;
    quantity: number;
    adults: number;   // extra persons
    children: number; // children count
    board_type_id: number; // Selected board type from Checkout step
    // New field
    extra_requests?: string | null; 
  }>;
  check_in: string;
  check_out: string;
  guests: Array<GuestPayload>; // Explicitly using GuestPayload
  // Added 'card_to_card'
  payment_method: 'online' | 'credit' | 'in_person' | 'card_to_card'; 
  // New field for rules acceptance (write_only field on serializer)
  rules_accepted: boolean;
}

interface BookingResponse {
  booking_code: string;
  // ... other details
}

// Final booking submission
export const createBooking = async (data: BookingPayload): Promise<BookingResponse> => {
  const response = await api.post('/reservations/bookings/', data);
  return response.data;
};

// Endpoint: /reservations/initiate-payment/
export const initiatePayment = async (booking_code: string) => {
  const response = await api.post('/reservations/initiate-payment/', { booking_code });
  return response.data; // Expects to include redirect_url
};

// Endpoint: /reservations/booking-request/
export const submitBookingRequest = async (booking_code: string, request_type: 'cancellation' | 'modification') => {
  const response = await api.post('/reservations/booking-request/', { booking_code, request_type });
  return response.data;
};
