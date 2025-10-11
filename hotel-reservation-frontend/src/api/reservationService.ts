// src/api/reservationService.ts
// version: 1.2.1
// Feature: Added BookingDetail interfaces and fetchBookingDetails API call to support the two-step payment flow.
import api from './coreService'; // نمونه Axios پیکربندی شده

// --- Interfaces for Booking Submission Payload ---

// Define GuestPayload interface (based on GuestInputForm.tsx)
export interface GuestPayload {
  first_name: string;
  last_name: string;
  is_foreign: boolean;
  national_id: string | null; // Allow null to match BE model fix
  passport_number: string | null; // Allow null to match BE model fix
  phone_number: string | null; // Allow null to match BE model fix
  nationality: string | null; // Allow null to match BE model fix
  // New fields
  city_of_origin?: string | null; 
  wants_to_register?: boolean; // NEW: Added for optional registration support (maps to serializer field)
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
    extra_requests?: string | null; 
  }>;
  check_in: string;
  check_out: string;
  guests: Array<GuestPayload>; // Explicitly using GuestPayload
  // REMOVED: payment_method is now selected on the separate payment page
  rules_accepted: boolean;
  agency_id?: number | null;
}

interface BookingResponse {
  booking_code: string;
  total_price: number;
  // NOTE: The backend view returns these two fields upon successful creation
}

// --- Interfaces for Booking Detail Retrieval (Backend BookingDetailSerializer) ---

export interface GuestDetail {
    first_name: string;
    last_name: string;
    is_foreign: boolean;
    national_id: string | null;
    passport_number: string | null;
    phone_number: string | null;
    nationality: string | null;
    city_of_origin: string | null;
}

export interface BookingRoomDetail {
    id: number; 
    room_type_name: string;
    board_type: string; // Name of board type (e.g., 'BB', 'FB')
    hotel_name: string;
    quantity: number;
    adults: number; // Extra adults
    children: number;
    extra_requests: string | null;
}

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'cancellation_requested' | 'modification_requested';

export interface BookingDetail {
    booking_code: string;
    hotel_name: string;
    check_in: string; // jDate
    check_out: string; // jDate
    total_price: number;
    status: BookingStatus;
    created_at: string;
    updated_at: string;
    total_guests: number;
    booking_rooms: BookingRoomDetail[];
    guests: GuestDetail[];
    // NOTE: If payment_method is needed, it must be added to the Booking Model and Serializer
    // payment_method: 'online' | 'credit' | 'in_person' | 'card_to_card'; 
}


// --- API Service Functions ---

// Endpoint: /reservations/bookings/ (1. Create Booking)
export const createBooking = async (data: BookingPayload): Promise<BookingResponse> => {
  // Authentication is optional for this endpoint (Guest Booking support)
  // Removed payment_method from data before sending, as it's now optional from payload
  const response = await api.post('/reservations/bookings/', data);
  return response.data;
};

// NEW Endpoint: /reservations/bookings/<booking_code>/details/ (2. Fetch Details)
export const fetchBookingDetails = async (booking_code: string): Promise<BookingDetail> => {
  const response = await api.get(`/reservations/bookings/${booking_code}/details/`);
  return response.data;
};


// Endpoint: /reservations/initiate-payment/ (3. Initiate Payment)
export const initiatePayment = async (booking_code: string): Promise<{ redirect_url: string }> => {
  const response = await api.post('/reservations/initiate-payment/', { booking_code });
  return response.data; // Expects to include redirect_url
};

// Endpoint: /reservations/booking-request/
export const submitBookingRequest = async (booking_code: string, request_type: 'cancellation' | 'modification') => {
  const response = await api.post('/reservations/booking-request/', { booking_code, request_type });
  return response.data;
};
