// src/api/reservationService.ts
// version: 1.2.3
// Feature: Added BookingListItem interface and fetchMyBookings API function to support the User Dashboard.

import api from './coreService'; // نمونه Axios پیکربندی شده
import moment from 'moment-jalaali'; // Added for date formatting if needed later

// --- Interfaces for Booking Submission Payload (Kept) ---
export interface GuestPayload {
  first_name: string;
  last_name: string;
  is_foreign: boolean;
  national_id: string | null;
  passport_number: string | null;
  phone_number: string | null;
  nationality: string | null;
  city_of_origin?: string | null; 
  wants_to_register?: boolean; 
}

export interface BookingPayload { 
  booking_rooms: Array<{
    room_type_id: number;
    quantity: number;
    adults: number;   
    children: number; 
    board_type_id: number; 
    extra_requests?: string | null; 
  }>;
  check_in: string;
  check_out: string;
  guests: Array<GuestPayload>; 
  rules_accepted: boolean;
  agency_id?: number | null;
}

interface BookingResponse {
  booking_code: string;
  total_price: number;
}

// --- Interfaces for Booking Detail Retrieval (Kept) ---
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
    board_type: string; 
    hotel_name: string;
    quantity: number;
    adults: number; 
    children: number;
    extra_requests: string | null;
}

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'cancellation_requested' | 'modification_requested';

export interface BookingDetail {
    booking_code: string;
    hotel_name: string;
    check_in: string; 
    check_out: string; 
    total_price: number;
    status: BookingStatus;
    created_at: string;
    updated_at: string;
    total_guests: number;
    booking_rooms: BookingRoomDetail[];
    guests: GuestDetail[];
}

// --- NEW Interfaces for Booking List (BookingListSerializer) ---

export interface BookingListItem {
    booking_code: string;
    hotel_name: string;
    room_summary: string; // e.g., "1 x Double Room"
    check_in: string; // jDate
    check_out: string; // jDate
    total_price: number;
    status: BookingStatus;
}

export interface GuestLookupPayload {
    booking_code: string;
    national_id: string; // Used for Iranian guests
    passport_number: string; // Used for foreign guests
}

// --- NEW Interfaces for Offline Payment (Kept) ---

export interface OfflineBank {
    id: number;
    bank_name: string;
    account_holder: string;
    account_number: string;
    card_number: string;
}

export interface PaymentConfirmationPayload {
    booking_code: string; 
    offline_bank: number; 
    tracking_code: string; 
    payment_date: string; 
    payment_amount: number; 
}

interface PaymentConfirmationResponse {
    success: boolean;
    message: string;
    confirmation_id: number;
}

// --- API Service Functions ---

// Endpoint: /reservations/bookings/ (1. Create Booking)
export const createBooking = async (data: BookingPayload): Promise<BookingResponse> => {
  const response = await api.post('/reservations/bookings/', data);
  return response.data;
};

// Endpoint: /reservations/bookings/<booking_code>/details/ (2. Fetch Details)
export const fetchBookingDetails = async (booking_code: string): Promise<BookingDetail> => {
  const response = await api.get(`/reservations/bookings/${booking_code}/details/`);
  return response.data;
};

// NEW Endpoint: /reservations/guest-lookup/
export const guestBookingLookup = async (data: GuestLookupPayload): Promise<BookingDetail> => {
    const response = await api.post('/reservations/guest-lookup/', data);
    return response.data;
};


// NEW Endpoint: /reservations/my-bookings/
export const fetchMyBookings = async (): Promise<BookingListItem[]> => {
    // This endpoint requires authentication (AuthContext provides the token)
    const response = await api.get('/reservations/my-bookings/');
    return response.data;
};

// Endpoint: /reservations/initiate-payment/ (3. Initiate Payment)
export const initiatePayment = async (booking_code: string): Promise<{ redirect_url: string }> => {
  const response = await api.post('/reservations/initiate-payment/', { booking_code });
  return response.data; 
};

// Endpoint: /reservations/offline-banks/
export const fetchOfflineBanks = async (): Promise<OfflineBank[]> => {
    const response = await api.get('/reservations/offline-banks/');
    return response.data;
};

// Endpoint: /reservations/payment-confirm/
export const submitPaymentConfirmation = async (data: PaymentConfirmationPayload): Promise<PaymentConfirmationResponse> => {
    const response = await api.post('/reservations/payment-confirm/', data);
    return response.data;
};

// Endpoint: /reservations/booking-request/
export const submitBookingRequest = async (booking_code: string, request_type: 'cancellation' | 'modification') => {
  const response = await api.post('/reservations/booking-request/', { booking_code, request_type });
  return response.data;
};
