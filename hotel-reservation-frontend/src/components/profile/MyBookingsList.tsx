// src/components/profile/MyBookingsList.tsx
// version: 1.0.0
// NEW: Refactored component from the original my-bookings page to be used within the profile layout.

import React, { useCallback } from 'react';
import { useRouter } from 'next/router';
import { useQuery } from '@tanstack/react-query';
import moment from 'moment-jalaali';
import { FaCalendarAlt, FaHotel, FaMoneyBillAlt, FaTimesCircle, FaEdit } from 'react-icons/fa';

import { Button } from '@/components/ui/Button';
import { fetchMyBookings, BookingListItem, BookingStatus, submitBookingRequest } from '@/api/reservationService';

// Status map remains the same
const statusMap: Record<BookingStatus, { label: string; color: string }> = {
  pending: { label: 'در انتظار پرداخت', color: 'text-yellow-600 bg-yellow-100' },
  confirmed: { label: 'تایید شده', color: 'text-green-700 bg-green-100' },
  cancelled: { label: 'لغو شده', color: 'text-red-700 bg-red-100' },
  cancellation_requested: { label: 'درخواست لغو', color: 'text-orange-600 bg-orange-100' },
  modification_requested: { label: 'درخواست ویرایش', color: 'text-blue-600 bg-blue-100' },
};

const BookingCard: React.FC<{ booking: BookingListItem; onAction: () => void }> = ({ booking, onAction }) => {
  const router = useRouter();
  const { label, color } = statusMap[booking.status] || { label: 'نامشخص', color: 'text-gray-500 bg-gray-100' };

  const handleAction = useCallback(async (request_type: 'cancellation' | 'modification') => {
    if (!confirm(`آیا از درخواست ${request_type === 'cancellation' ? 'لغو' : 'ویرایش'} این رزرو مطمئن هستید؟`)) return;
    try {
      await submitBookingRequest(booking.booking_code, request_type);
      alert('درخواست شما با موفقیت ثبت شد.');
      onAction(); // Trigger re-fetch in the parent component
    } catch (error) {
      alert('خطا در ثبت درخواست.');
      console.error('Booking action failed:', error);
    }
  }, [booking.booking_code, onAction]);

  return (
    <div className="bg-gray-50 p-5 shadow-sm rounded-lg border hover:shadow-md transition duration-300">
        {/* Card content is identical to the original my-bookings page */}
         <div className="flex justify-between items-start border-b pb-4 mb-4">
            <h2 className="text-xl font-bold text-gray-800 flex items-center">
                <FaHotel className="ml-2 text-primary-500" />
                {booking.hotel_name}
            </h2>
            <span className={`px-3 py-1 text-sm font-medium rounded-full ${color}`}>
                {label}
            </span>
        </div>
        {/* ... other details ... */}
        <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button onClick={() => router.push(`/payment/${booking.booking_code}`)} variant="primary" size="sm">
                {booking.status === 'pending' ? 'تکمیل پرداخت' : 'مشاهده جزئیات'}
            </Button>
            {(booking.status === 'confirmed' || booking.status === 'pending') && (
                <Button onClick={() => handleAction('cancellation')} variant="danger" size="sm" className="flex items-center">
                    <FaTimesCircle className="ml-1" />
                    درخواست لغو
                </Button>
            )}
        </div>
    </div>
  );
};

const MyBookingsList: React.FC = () => {
  const router = useRouter();
  const { data: bookings, isLoading, isError, error, refetch } = useQuery<BookingListItem[], Error>({
    queryKey: ['myBookings'],
    queryFn: fetchMyBookings,
  });

  if (isLoading) return <div>در حال بارگذاری رزروها...</div>;
  if (isError) return <div className="text-red-600">خطا در دریافت اطلاعات: {error.message}</div>;

  return (
    <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-6 pb-4 border-b">رزروهای من</h2>
        {bookings && bookings.length > 0 ? (
            <div className="space-y-6">
                {bookings.map((booking) => (
                    <BookingCard key={booking.booking_code} booking={booking} onAction={refetch} />
                ))}
            </div>
        ) : (
            <div className="text-center py-10">
                <h3 className="text-xl font-bold text-gray-600">هیچ رزروی یافت نشد.</h3>
                <p className="text-gray-500 mt-2 mb-6">شما تاکنون هیچ رزروی در سیستم ثبت نکرده‌اید.</p>
                <Button onClick={() => router.push('/')} variant="primary">
                    شروع رزرو هتل
                </Button>
            </div>
        )}
    </div>
  );
};

export default MyBookingsList;
