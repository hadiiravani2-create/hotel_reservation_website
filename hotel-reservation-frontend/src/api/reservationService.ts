// src/api/reservationService.ts
import api from './coreService'; // نمونه Axios پیکربندی شده

// Endpoint: /reservations/bookings/
// این Payload بسیار حیاتی است و مستقیماً با CreateBookingSerializer نگاشت می‌شود
interface BookingPayload {
  booking_rooms: Array<{
    room_type_id: number;
    quantity: number;
    adults: number;   // نفرات اضافی
    children: number; // تعداد کودکان
    board_type_id: number; // از مرحله قبل در Checkout انتخاب می‌شود
  }>;
  check_in: string;
  check_out: string;
  guests: Array<any>; // Payload از GuestSerializer
  payment_method: 'online' | 'credit' | 'in_person';
}

interface BookingResponse {
  booking_code: string;
  // ... سایر جزئیات
}

// ثبت نهایی رزرو
export const createBooking = async (data: BookingPayload): Promise<BookingResponse> => {
  const response = await api.post('/reservations/bookings/', data);
  return response.data;
};

// Endpoint: /reservations/initiate-payment/
export const initiatePayment = async (booking_code: string) => {
  const response = await api.post('/reservations/initiate-payment/', { booking_code });
  return response.data; // انتظار داریم شامل redirect_url باشد
};

// Endpoint: /reservations/booking-request/
export const submitBookingRequest = async (booking_code: string, request_type: 'cancellation' | 'modification') => {
  const response = await api.post('/reservations/booking-request/', { booking_code, request_type });
  return response.data;
};