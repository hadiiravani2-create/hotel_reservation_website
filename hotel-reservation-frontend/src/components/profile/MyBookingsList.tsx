// FILE: src/components/profile/MyBookingsList.tsx
// version: 2.1.1
// FIX: Added 'awaiting_completion' to statusMap to resolve TypeScript error.
// UI: Added correct label and styling for the new status.

import React, { useCallback, useState } from 'react';
import { useRouter } from 'next/router';
import { useQuery } from '@tanstack/react-query';
import { DateObject } from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import { 
    Hotel, Calendar, Clock, CreditCard, ChevronDown, ChevronUp, 
    FileText, XCircle, Edit, Info, CheckCircle, AlertTriangle, 
    User, Users, Wallet 
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { fetchMyBookings, BookingListItem, BookingStatus, submitBookingRequest, downloadMyBookingPDF } from '@/api/reservationService';
import { formatPrice } from '@/utils/format';

// تابع نمایش تاریخ شمسی
const formatDate = (dateStr: string): string => {
  if (!dateStr) return '-';
  return new DateObject({ date: dateStr, calendar: persian, locale: persian_fa })
    .format("dddd D MMMM YYYY");
};

const calculateDuration = (start: string, end: string) => {
    if (!start || !end) return 0;
    const startDate = new DateObject({ date: start, calendar: persian, locale: persian_fa });
    const endDate = new DateObject({ date: end, calendar: persian, locale: persian_fa });
    return Math.max(1, Math.round((endDate.toUnix() - startDate.toUnix()) / (24 * 3600)));
};

// 1. MAP UPDATE: Added 'awaiting_completion'
const statusMap: Record<BookingStatus, { label: string; color: string; icon: React.ElementType }> = {
  pending: { label: 'در انتظار پرداخت', color: 'text-yellow-700 bg-yellow-50 border-yellow-200', icon: Clock },
  awaiting_confirmation: { label: 'منتظر تایید', color: 'text-cyan-700 bg-cyan-50 border-cyan-200', icon: Clock },
  awaiting_completion: { label: 'در انتظار تکمیل وجه', color: 'text-purple-700 bg-purple-50 border-purple-200', icon: Wallet }, // <--- ADDED
  confirmed: { label: 'تایید شده', color: 'text-green-700 bg-green-50 border-green-200', icon: CheckCircle },
  cancelled: { label: 'لغو شده', color: 'text-red-700 bg-red-50 border-red-200', icon: XCircle },
  cancellation_requested: { label: 'درخواست لغو', color: 'text-orange-700 bg-orange-50 border-orange-200', icon: AlertTriangle },
  modification_requested: { label: 'درخواست ویرایش', color: 'text-blue-700 bg-blue-50 border-blue-200', icon: Edit },
  no_capacity: { label: 'عدم ظرفیت', color: 'text-gray-700 bg-gray-50 border-gray-200', icon: XCircle },
};

const BookingCard: React.FC<{ booking: BookingListItem; onAction: () => void }> = ({ booking, onAction }) => {
  const router = useRouter();
  const [showDetails, setShowDetails] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  
  const { label, color, icon: StatusIcon } = statusMap[booking.status] || { label: 'نامشخص', color: 'text-gray-500 bg-gray-100', icon: Info };
  const duration = calculateDuration(booking.check_in, booking.check_out);

  const handleAction = useCallback(async (request_type: 'cancellation' | 'modification') => {
    if (!confirm(`آیا از درخواست ${request_type === 'cancellation' ? 'لغو' : 'ویرایش'} این رزرو مطمئن هستید؟`)) return;
    try {
      await submitBookingRequest(booking.booking_code, request_type);
      alert('درخواست شما با موفقیت ثبت شد.');
      onAction();
    } catch (error) {
      alert('خطا در ثبت درخواست.');
    }
  }, [booking.booking_code, onAction]);

  const handleDownloadPDF = async () => {
    setIsDownloading(true);
    try {
      const pdfBlob = await downloadMyBookingPDF(booking.booking_code);
      const url = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `booking_${booking.booking_code}.pdf`);
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        link.parentNode?.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 100);
    } catch (error) {
      alert('خطا در دانلود فایل PDF.');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-indigo-100 mb-6">
      
      {/* Header Section */}
      <div className="p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white">
        <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-50 rounded-full text-indigo-600">
                <Hotel className="w-6 h-6" />
            </div>
            <div>
                <h2 className="text-lg font-bold text-gray-800">{booking.hotel_name}</h2>
                <div className="flex flex-wrap items-center text-sm text-gray-500 mt-1 gap-3">
                    <span className="font-mono bg-gray-100 px-2 py-0.5 rounded text-gray-600">
                        {booking.booking_code}
                    </span>
                    <span className="flex items-center" title="مدت اقامت">
                        <Clock className="w-3 h-3 mr-1" /> {duration} شب
                    </span>
                    <span className="flex items-center text-gray-700 font-medium" title="سرپرست">
                        <User className="w-3 h-3 mr-1" /> {booking.main_guest}
                    </span>
                </div>
            </div>
        </div>

        <div className="flex flex-col items-end gap-2 w-full md:w-auto">
            <span className={`flex items-center px-3 py-1 text-xs font-bold rounded-full border ${color}`}>
                <StatusIcon className="w-3 h-3 ml-1" /> {label}
            </span>
            <div className="text-lg font-bold text-indigo-700">
                {formatPrice(booking.total_price)} <span className="text-xs font-normal text-gray-500">ریال</span>
            </div>
        </div>
      </div>

      {/* Toggle Button */}
      <div 
        onClick={() => setShowDetails(!showDetails)}
        className="w-full flex justify-between items-center px-5 py-3 bg-gray-50 hover:bg-gray-100 border-t border-gray-100 transition-colors text-sm font-medium text-gray-600 cursor-pointer select-none"
      >
        <span className="flex items-center">
            {showDetails ? 'بستن جزئیات' : 'مشاهده جزئیات کامل'}
        </span>
        {showDetails ? <ChevronUp className="w-4 h-4"/> : <ChevronDown className="w-4 h-4"/>}
      </div>

      {/* Expanded Details */}
      {showDetails && (
        <div className="px-5 py-6 bg-gray-50 border-t border-gray-200 animate-fadeIn">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                
                {/* Dates */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                        <div className="flex items-center text-gray-500">
                            <Calendar className="w-4 h-4 ml-2 text-indigo-500"/>
                            <span>تاریخ ورود:</span>
                        </div>
                        <span className="font-semibold text-gray-800">{formatDate(booking.check_in)}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                        <div className="flex items-center text-gray-500">
                            <Calendar className="w-4 h-4 ml-2 text-pink-500"/>
                            <span>تاریخ خروج:</span>
                        </div>
                        <span className="font-semibold text-gray-800">{formatDate(booking.check_out)}</span>
                    </div>
                </div>

                {/* Capacity & Room Info */}
                <div className="space-y-3">
                    <div className="p-3 bg-white rounded-lg border border-gray-200 flex justify-between items-center">
                        <div className="flex items-center text-gray-500">
                            <Hotel className="w-4 h-4 ml-2 text-gray-400"/>
                            <span>اطلاعات اتاق:</span>
                        </div>
                        <span className="font-medium text-gray-800">{booking.room_summary}</span>
                    </div>
                    
                    <div className="p-3 bg-white rounded-lg border border-gray-200 flex justify-between items-center">
                        <div className="flex items-center text-gray-500">
                            <Users className="w-4 h-4 ml-2 text-gray-400"/>
                            <span>ظرفیت و نفرات:</span>
                        </div>
                        <span className="font-medium text-gray-800">{booking.capacity_details}</span>
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 pt-6 border-t border-gray-200 flex flex-wrap gap-3 justify-end">
                
                {/* دکمه پرداخت برای حالت‌های pending و awaiting_completion فعال است */}
                {(booking.status === 'pending' || booking.status === 'awaiting_completion') && (
                    <Button onClick={() => router.push(`/payment/${booking.booking_code}`)} variant="primary" size="sm" className="flex items-center">
                        <CreditCard className="w-4 h-4 ml-1" />
                        تکمیل/پرداخت وجه
                    </Button>
                )}

                {/* دکمه فاکتور برای سایر حالت‌ها */}
                {booking.status !== 'pending' && booking.status !== 'awaiting_completion' && (
                    <Button onClick={() => router.push(`/payment/${booking.booking_code}`)} variant="outline" size="sm" className="flex items-center">
                        <FileText className="w-4 h-4 ml-1" />
                        مشاهده فاکتور
                    </Button>
                )}

                {booking.status === 'confirmed' && (
                    <Button
                        onClick={handleDownloadPDF}
                        variant="success"
                        size="sm"
                        className="flex items-center bg-green-600 hover:bg-green-700 text-white"
                        disabled={isDownloading}
                    >
                        <FileText className="w-4 h-4 ml-1" />
                        {isDownloading ? 'در حال دانلود...' : 'دانلود واچر (PDF)'}
                    </Button>
                )}

                {['confirmed', 'pending', 'awaiting_completion', 'awaiting_confirmation'].includes(booking.status) && (
                    <Button onClick={() => handleAction('cancellation')} variant="danger" size="sm" className="flex items-center bg-red-50 text-red-600 hover:bg-red-100 border border-red-200">
                        <XCircle className="w-4 h-4 ml-1" />
                        لغو رزرو
                    </Button>
                )}
                
                {booking.status === 'confirmed' && (
                    <Button onClick={() => handleAction('modification')} variant="secondary" size="sm" className="flex items-center">
                        <Edit className="w-4 h-4 ml-1" />
                        ویرایش
                    </Button>
                )}
            </div>
        </div>
      )}
    </div>
  );
};

const MyBookingsList: React.FC = () => {
    const router = useRouter();
    const { data: bookings, isLoading, isError, error, refetch } = useQuery<BookingListItem[], Error>({
      queryKey: ['myBookings'],
      queryFn: fetchMyBookings,
    });
  
    if (isLoading) return (
        <div className="flex justify-center items-center p-16">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-brand"></div>
            <span className="mr-3 text-gray-500">در حال دریافت لیست رزروها...</span>
        </div>
    );
    
    if (isError) return (
        <div className="text-center p-10 bg-red-50 rounded-xl border border-red-100 text-red-600">
            <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
            <p>خطا در دریافت اطلاعات: {error.message}</p>
            <Button onClick={() => refetch()} variant="outline" className="mt-4" size="sm">تلاش مجدد</Button>
        </div>
    );
  
    return (
      <div>
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FileText className="w-6 h-6 text-indigo-600" />
            تاریخچه رزروهای من
          </h2>
          <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-sm font-mono border border-indigo-100">
              {bookings?.length || 0} رزرو
          </span>
        </div>
  
        {bookings && bookings.length > 0 ? (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <BookingCard key={booking.booking_code} booking={booking} onAction={refetch} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center">
            <div className="bg-gray-50 p-4 rounded-full mb-4">
                <Hotel className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-700">هنوز رزروی انجام نداده‌اید</h3>
            <p className="text-gray-500 mt-2 mb-6 max-w-md mx-auto">شما تاکنون هیچ رزروی در سیستم ثبت نکرده‌اید. همین حالا هتل مورد نظر خود را پیدا کنید.</p>
            <Button onClick={() => router.push('/')} variant="primary" className="shadow-lg shadow-blue-500/20">
              جستجو و رزرو هتل
            </Button>
          </div>
        )}
      </div>
    );
};

export default MyBookingsList;
