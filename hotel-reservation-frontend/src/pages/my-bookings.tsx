// hotel-reservation-frontend/src/pages/my-bookings.tsx
// version: 0.0.4
// Feature: Guest dashboard for listing and managing personal/agency bookings.
// FIX: Corrected imports for Header and Footer to use Default Export. Module installation assumed to be fixed by user.
// IMPROVEMENT: Added max-width constraint to the main content area for better display on large screens.

import React, { useCallback } from 'react';
import { useRouter } from 'next/router';
import useSWR from 'swr';
import moment from 'moment-jalaali';
import { FaCalendarAlt, FaHotel, FaMoneyBillAlt, FaTimesCircle, FaEdit } from 'react-icons/fa';

import { useAuth } from '@/hooks/useAuth'; 
import Header from '@/components/Header'; 
import Footer from '@/components/Footer'; 
import { Button } from '@/components/ui/Button'; 
import { fetchMyBookings, BookingListItem, BookingStatus, submitBookingRequest } from '@/api/reservationService';

// Define status map for display in Persian and assign Tailwind color classes
const statusMap: Record<BookingStatus, { label: string; color: string }> = {
  pending: { label: 'در انتظار پرداخت', color: 'text-yellow-600 bg-yellow-100' },
  confirmed: { label: 'تایید شده', color: 'text-green-700 bg-green-100' },
  cancelled: { label: 'لغو شده', color: 'text-red-700 bg-red-100' },
  cancellation_requested: { label: 'درخواست لغو', color: 'text-orange-600 bg-orange-100' },
  modification_requested: { label: 'درخواست ویرایش', color: 'text-blue-600 bg-blue-100' },
};

/**
 * A reusable component to display a single booking item card.
 */
const BookingCard: React.FC<{ booking: BookingListItem }> = ({ booking }) => {
  const router = useRouter();
  const { label, color } = statusMap[booking.status] || { label: 'نامشخص', color: 'text-gray-500 bg-gray-100' };

  const handleAction = useCallback(async (request_type: 'cancellation' | 'modification') => {
    if (!confirm(`آیا مطمئنید که می‌خواهید ${request_type === 'cancellation' ? 'رزرو را لغو کنید' : 'درخواست ویرایش رزرو را ثبت کنید'}؟`)) {
        return;
    }
    try {
        await submitBookingRequest(booking.booking_code, request_type);
        alert(`درخواست شما برای ${request_type === 'cancellation' ? 'لغو' : 'ویرایش'} با موفقیت ثبت شد و در حال بررسی است.`);
        // Note: Revalidation should occur automatically if useSWR is configured globally with a revalidation strategy
        // Optionally, manually revalidate the SWR key here: mutate('/reservations/my-bookings/')
        router.reload(); // Simple reload for demonstration
    } catch (error) {
        alert('خطا در ثبت درخواست. لطفا دوباره تلاش کنید.');
        console.error('Booking action failed:', error);
    }
  }, [booking.booking_code, router]);

  return (
    <div className="bg-white p-6 shadow-lg rounded-xl border border-gray-100 hover:shadow-xl transition duration-300 mb-6">
      <div className="flex justify-between items-start border-b pb-4 mb-4">
        <h2 className="text-xl font-bold text-gray-800 flex items-center">
          <FaHotel className="ml-2 text-primary-500" />
          {booking.hotel_name}
        </h2>
        <span className={`px-3 py-1 text-sm font-medium rounded-full ${color}`}>
          {label}
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-4">
        <div className='flex flex-col'>
            <span className="font-medium text-gray-800">کد رزرو:</span>
            <span className="text-lg font-mono text-primary-600">{booking.booking_code}</span>
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
                {booking.total_price.toLocaleString()} تومان
            </div>
        </div>
      </div>

      <p className="text-gray-700 mb-4 border-t pt-4">
        <span className="font-medium">خلاصه اتاق: </span>
        {booking.room_summary}
      </p>

      <div className="flex justify-end space-x-2 pt-4 border-t">
        {/* Button to view details (and potentially complete payment) */}
        <Button 
          onClick={() => router.push(`/payment/${booking.booking_code}`)}
          variant="primary"
          size="sm"
        >
          {booking.status === 'pending' ? 'تکمیل پرداخت' : 'مشاهده جزئیات'}
        </Button>

        {/* Cancellation Request Button (Only for Confirmed or Pending) */}
        {(booking.status === 'confirmed' || booking.status === 'pending') && (
          <Button 
            onClick={() => handleAction('cancellation')}
            variant="danger"
            size="sm"
            className="flex items-center"
          >
            <FaTimesCircle className="ml-1" />
            درخواست لغو
          </Button>
        )}
        
        {/* Modification Request Button (Only for Confirmed) */}
        {booking.status === 'confirmed' && (
          <Button 
            onClick={() => handleAction('modification')}
            variant="secondary"
            size="sm"
            className="flex items-center"
          >
            <FaEdit className="ml-1" />
            درخواست ویرایش
          </Button>
        )}
      </div>
    </div>
  );
};


const MyBookingsPage: React.FC = () => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();

  // Redirect unauthenticated users to login page
  React.useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  // Fetch bookings data using useSWR
  const { data: bookings, error } = useSWR<BookingListItem[]>(
    isAuthenticated ? '/reservations/my-bookings/' : null,
    fetchMyBookings
  );

  // Show loading state if authentication is pending or data is loading
  if (authLoading || !isAuthenticated || (!bookings && !error)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg">در حال بارگذاری داشبورد...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-8">
        <Header />
        <div className="container mx-auto mt-10">
          <h1 className="text-3xl font-extrabold text-red-600 mb-6">خطا در بارگذاری رزروها</h1>
          <p className="text-gray-700">متأسفانه، در حال حاضر امکان نمایش لیست رزروهای شما وجود ندارد. لطفاً دقایقی دیگر دوباره تلاش کنید.</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto max-w-6xl p-4 md:p-8">
        <h1 className="text-3xl font-extrabold text-gray-800 mb-8 border-b pb-3">
          داشبورد رزروهای من
        </h1>

        {bookings && bookings.length > 0 ? (
          <div className="space-y-6">
            {bookings.map((booking) => (
              <BookingCard key={booking.booking_code} booking={booking} />
            ))}
          </div>
        ) : (
          <div className="bg-white p-10 rounded-xl shadow-md text-center">
            <h2 className="text-2xl font-bold text-gray-600 mb-4">رزروی یافت نشد!</h2>
            <p className="text-gray-500 mb-6">شما تاکنون هیچ رزروی در سیستم ثبت نکرده‌اید.</p>
            <Button onClick={() => router.push('/search')} variant="primary">
              شروع رزرو هتل
            </Button>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default MyBookingsPage;
