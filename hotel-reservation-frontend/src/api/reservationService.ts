// src/api/reservationService.ts
// version: 1.2.7
// FIX: Updated BookingPayload interface to send 'extra_adults' and 'children_count'
//      to align with backend pricing logic and fix 400 error.

import api from './coreService';
import moment from 'moment-jalaali';
import { BookedServiceDetail, BookingResponse, OfflineBank, SelectedServicePayload } from '@/types/hotel';

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
    extra_adults: number; // <-- FIX: Changed from 'adults'
    children_count: number; // <-- FIX: Changed from 'children'
    board_type_id: number;
    extra_requests?: string | null;
  }>;
  check_in: string;
  check_out: string;
  guests: Array<GuestPayload>;
  rules_accepted: boolean;
  agency_id?: number | null;
  selected_services?: SelectedServicePayload[];
}



// ... (GuestDetail, BookingRoomDetail, BookingStatus, BookingDetail interfaces remain unchanged)
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
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'cancellation_requested' | 'modification_requested' | 'awaiting_confirmation'| 'no_capacity';
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
    booked_services?: BookedServiceDetail[];
}

// ... (BookingListItem, GuestLookupPayload interfaces remain unchanged)
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
    national_id: string | null;
    passport_number: string | null;
}

// REMOVED: OfflineBank interface is now in types/hotel.d.ts

// ... (GenericPaymentConfirmationPayload and PaymentConfirmationResponse interfaces remain unchanged)
export interface GenericPaymentConfirmationPayload {
    content_type: 'booking' | 'wallet_transaction';
    object_id: string; // This will be the booking_code or the wallet_transaction_id
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

// API function to pay for a booking using the wallet
export const payWithWallet = async (booking_code: string): Promise<{ success: boolean; message: string }> => {
  const response = await api.post(`/reservations/bookings/${booking_code}/pay-with-wallet/`);
  return response.data;
};

// ... (createBooking, fetchBookingDetails, guestBookingLookup, fetchMyBookings, initiatePayment functions remain unchanged)
export const createBooking = async (data: BookingPayload): Promise<BookingResponse> => {
  const response = await api.post('/reservations/bookings/', data);
  return response.data;
};

export const fetchBookingDetails = async (booking_code: string): Promise<BookingDetail> => {
  const response = await api.get(`/reservations/bookings/${booking_code}/details/`);
  return response.data;
};

export const guestBookingLookup = async (data: GuestLookupPayload): Promise<BookingDetail> => {
    const response = await api.post('/reservations/guest-lookup/', data);
    return response.data;
};


export const fetchMyBookings = async (): Promise<BookingListItem[]> => {
    const response = await api.get('/reservations/my-bookings/');
    return response.data;
};

export const initiatePayment = async (booking_code: string): Promise<{ redirect_url: string }> => {
  const response = await api.post('/reservations/initiate-payment/', { booking_code });
  return response.data;
};


// fetchOfflineBanks function remains unchanged, but now its return type is imported
export const fetchOfflineBanks = async (): Promise<OfflineBank[]> => {
    const response = await api.get('/reservations/offline-banks/');
    return response.data;
};

// submitPaymentConfirmation function remains unchanged
export const submitPaymentConfirmation = async (data: GenericPaymentConfirmationPayload): Promise<PaymentConfirmationResponse> => {
    const response = await api.post('/reservations/payment-confirm/', data);
    return response.data;
};

// submitBookingRequest function remains unchanged
export const submitBookingRequest = async (booking_code: string, request_type: 'cancellation' | 'modification') => {
  const response = await api.post('/reservations/booking-request/', { booking_code, request_type });
  return response.data;
};


// --- NEW PDF DOWNLOAD FUNCTIONS ---

/**
 * Downloads the booking confirmation PDF for an AUTHENTICATED user.
 * (Calls the GET endpoint defined in the backend)
 * @param booking_code The unique code of the booking.
 * @returns A Promise that resolves to a Blob (the PDF file).
 */
export const downloadMyBookingPDF = async (booking_code: string): Promise<Blob> => {
  const response = await api.get(
    `/reservations/bookings/${booking_code}/pdf/`,
    {
      // Crucial: Tell axios to expect binary data (a file/blob)
      responseType: 'blob',
    }
  );
  return response.data;
};

/**
 * Downloads the booking confirmation PDF for a GUEST user.
 * (Calls the POST endpoint defined in the backend)
 * @param booking_code The unique code of the booking.
 * @param guest_id_code The guest's National ID or Passport Number for verification.
 * @returns A Promise that resolves to a Blob (the PDF file).
 */
export const downloadGuestBookingPDF = async (
  booking_code: string,
  guest_id_code: string
): Promise<Blob> => {
  const response = await api.post(
    `/reservations/bookings/${booking_code}/pdf/`,
    { guest_id_code }, // Pass the guest's ID in the body for verification
    {
      // Crucial: Tell axios to expect binary data (a file/blob)
      responseType: 'blob',
    }
  );
  return response.data;
};
