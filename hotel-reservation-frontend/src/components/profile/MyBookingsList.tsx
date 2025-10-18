// src/components/profile/MyBookingsList.tsx
// version: 1.0.5
// FIX: Corrected JSX parsing error by refactoring conditional rendering logic for buttons.
// FIX: Corrected syntax error by adding a missing comma in the statusMap object.

import React, { useCallback } from 'react';
import { useRouter } from 'next/router';
import { useQuery } from '@tanstack/react-query';
import moment from 'moment-jalaali';
import { FaCalendarAlt, FaHotel, FaMoneyBillAlt, FaTimesCircle, FaEdit, FaInfoCircle } from 'react-icons/fa';

import { Button } from '@/components/ui/Button';
import { fetchMyBookings, BookingListItem, BookingStatus, submitBookingRequest } from '@/api/reservationService';

moment.locale('fa');

const statusMap: Record<BookingStatus, { label: string; color: string }> = {
  pending: { label: 'در انتظار پرداخت', color: 'text-yellow-600 bg-yellow-100' },
  awaiting_confirmation: { label: 'منتظر تایید', color: 'text-cyan-600 bg-cyan-100' },
  confirmed: { label: 'تایید شده', color: 'text-green-700 bg-green-100' },
  cancelled: { label: 'لغو شده', color: 'text-red-700 bg-red-100' },
  cancellation_requested: { label: 'درخواست لغو', color: 'text-orange-600 bg-orange-100' },
  modification_requested: { label: 'درخواست ویرایش', color: 'text-blue-600 bg-blue-100' },
  no_capacity: { label: 'عدم ظرفیت', color: 'text-gray-600 bg-gray-200' },
};

const BookingCard: React.FC<{ booking: BookingListItem; onAction: () => void }> = ({ booking, onAction }) => {
  const router = useRouter();
  const { label, color } = statusMap[booking.status] || { label: 'نامشخص', color: 'text-gray-500 bg-gray-100' };

  const handleAction = useCallback(async (request_type: 'cancellation' | 'modification') => {
    if (!confirm(`آیا از درخواست ${request_type === 'cancellation' ? 'لغو' : 'ویرایش'} این رزرو مطمئن هستید؟`)) return;
    try {
      await submitBookingRequest(booking.booking_code, request_type);
      alert('درخواست شما با موفقیت ثبت شد.');
      onAction();
    } catch (error) {
      alert('خطا در ثبت درخواست.');
      console.error('Booking action failed:', error);
    }
  }, [booking.booking_code, onAction]);

  return (
    <div className="bg-white p-6 shadow-lg rounded-xl border border-gray-100 hover:shadow-xl transition duration-300 mb-6">
      <div className="flex justify-between items-start border-b pb-4 mb-4">
        <h2 className="text-xl font-bold text-gray-800 flex items-center">
          <FaHotel className="ml-2 text-primary-brand" />
          {booking.hotel_name}
        </h2>
        <span className={`px-3 py-1 text-sm font-medium rounded-full ${color}`}>
          {label}
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-4">
        <div className='flex flex-col'>
            <span className="font-medium text-gray-800">کد رزرو:</span>
            <span className="text-lg font-mono text-primary-brand">{booking.booking_code}</span>
        </div>
        <div className='flex flex-col'>
            <span className="font-medium text-gray-800">تاریخ ورود:</span>
            <div className="flex items-center mt-1">
                <FaCalendarAlt className="ml-1 text-gray-400" />
                <span>{moment(booking.check_in, 'YYYY-MM-DD').format('jD jMMMM jYYYY')}</span>
            </div>
        </div>
        <div className='flex flex-col'>
            <span className="font-medium text-gray-800">تاریخ خروج:</span>
            <div className="flex items-center mt-1">
                <FaCalendarAlt className="ml-1 text-gray-400" />
                <span>{moment(booking.check_out, 'YYYY-MM-DD').format('jD jMMMM jYYYY')}</span>
            </div>
        </div>
        <div className='flex flex-col'>
            <span className="font-medium text-gray-800">مبلغ کل:</span>
            <div className="flex items-center mt-1 text-lg font-bold text-green-700">
                <FaMoneyBillAlt className="ml-1" />
                {booking.total_price.toLocaleString('fa-IR')} تومان
            </div>
        </div>
      </div>

      <p className="text-gray-700 mb-4 border-t pt-4">
        <span className="font-medium">خلاصه اتاق: </span>
        {booking.room_summary}
      </p>

      <div className="flex justify-end space-x-4 space-x-reverse pt-4 border-t">
        {booking.status === 'pending' && (
            <Button onClick={() => router.push(`/payment/${booking.booking_code}`)} variant="primary" size="sm">
                تکمیل پرداخت
            </Button>
        )}

        {booking.status !== 'pending' && booking.status !== 'awaiting_confirmation' && booking.status !== 'no_capacity' && (
            <Button onClick={() => router.push(`/payment/${booking.booking_code}`)} variant="secondary" size="sm" className="flex items-center">
                <FaInfoCircle className="ml-1" />
                مشاهده جزئیات
            </Button>
        )}
        
        {(booking.status === 'confirmed' || booking.status === 'pending') && (
            <Button onClick={() => handleAction('cancellation')} variant="danger" size="sm" className="flex items-center">
                <FaTimesCircle className="ml-1" />
                درخواست لغو
            </Button>
        )}
        
        {booking.status === 'confirmed' && (
            <Button onClick={() => handleAction('modification')} variant="secondary" size="sm" className="flex items-center">
                <FaEdit className="ml-1" />
                درخواست ویرایش
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
        <div className="text-center py-10 bg-gray-50 rounded-lg">
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
