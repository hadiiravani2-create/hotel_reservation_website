// src/api/reservationService.ts v1.0.1
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
}

// Endpoint: /reservations/bookings/
// This Payload is critical and maps directly to CreateBookingSerializer
export interface BookingPayload { // Fixed: Added 'export' keyword
  booking_rooms: Array<{
    room_type_id: number;
    quantity: number;
    adults: number;   // extra persons
    children: number; // children count
    board_type_id: number; // Selected board type from Checkout step
  }>;
  check_in: string;
  check_out: string;
  guests: Array<GuestPayload>; // Explicitly using GuestPayload
  payment_method: 'online' | 'credit' | 'in_person';
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
