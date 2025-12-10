// src/components/payment/BookingSummary.tsx
// version: 2.0.0
// FEATURE: Enhanced booking summary with price breakdown, duration calculation, and guest details.

import React, { useState } from 'react';
import { BookingDetail } from '@/api/reservationService';
import { formatPrice } from '@/utils/format';
import { DetailCard } from '@/components/ui/DetailCard';
import { 
    Hotel, Calendar, Clock, Users, ChevronDown, ChevronUp, 
    FileText, Calculator, BedDouble 
} from 'lucide-react';
import { DateObject } from 'react-multi-date-picker';
import { DATE_CONFIG } from '@/config/date';

// تابع کمکی برای تبدیل تاریخ
const formatJalaliDate = (dateStr: string) => {
    if (!dateStr) return '';
    return new DateObject({ date: dateStr, calendar: DATE_CONFIG.calendar, locale: DATE_CONFIG.locale }).format('dddd D MMMM YYYY');
};

// تابع کمکی برای محاسبه مدت اقامت
const calculateDuration = (start: string, end: string) => {
    if (!start || !end) return 0;
    const startDate = new DateObject({ date: start, calendar: DATE_CONFIG.calendar, locale: DATE_CONFIG.locale });
    const endDate = new DateObject({ date: end, calendar: DATE_CONFIG.calendar, locale: DATE_CONFIG.locale });
    // تفاضل به روز (تقریبی برای دمو، بهتر است دقیق‌تر محاسبه شود)
    return Math.max(1, (endDate.toUnix() - startDate.toUnix()) / (24 * 3600));
};

interface Props {
    booking: BookingDetail;
}

export const BookingSummary: React.FC<Props> = ({ booking }) => {
    const [showPriceDetails, setShowPriceDetails] = useState(false);
    const duration = calculateDuration(booking.check_in, booking.check_out);

    return (
        <DetailCard title="جزئیات کامل رزرو" icon={Hotel}>
            
            {/* 1. Header Information */}
            <div className="flex justify-between items-start border-b border-gray-100 pb-4 mb-4">
                <div>
                    <h3 className="text-xl font-bold text-gray-800">{booking.hotel_name}</h3>
                    <div className="text-sm text-gray-500 mt-1 flex items-center">
                        <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs ml-2">کد: {booking.booking_code}</span>
                        {/* اگر ستاره هتل موجود است اینجا نمایش دهید */}
                    </div>
                </div>
                <div className="text-center bg-gray-50 p-2 rounded-lg border border-gray-200">
                    <span className="block text-xs text-gray-500">مدت اقامت</span>
                    <span className="font-bold text-indigo-600">{duration} شب</span>
                </div>
            </div>

            {/* 2. Dates & Times */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-100 relative overflow-hidden">
                    <div className="absolute left-0 top-0 h-full w-1 bg-indigo-500"></div>
                    <div className="flex items-center text-indigo-900 mb-1">
                        <Calendar className="w-4 h-4 ml-1 opacity-70"/>
                        <span className="text-xs font-bold">تاریخ ورود</span>
                    </div>
                    <div className="text-sm font-semibold">{formatJalaliDate(booking.check_in)}</div>
                    <div className="text-xs text-gray-500 mt-1 flex items-center">
                        <Clock className="w-3 h-3 ml-1"/> از ساعت ۱۴:۰۰
                    </div>
                </div>
                <div className="bg-pink-50 p-3 rounded-lg border border-pink-100 relative overflow-hidden">
                    <div className="absolute left-0 top-0 h-full w-1 bg-pink-500"></div>
                    <div className="flex items-center text-pink-900 mb-1">
                        <Calendar className="w-4 h-4 ml-1 opacity-70"/>
                        <span className="text-xs font-bold">تاریخ خروج</span>
                    </div>
                    <div className="text-sm font-semibold">{formatJalaliDate(booking.check_out)}</div>
                    <div className="text-xs text-gray-500 mt-1 flex items-center">
                        <Clock className="w-3 h-3 ml-1"/> تا ساعت ۱۲:۰۰
                    </div>
                </div>
            </div>

            {/* 3. Room Details */}
            <div className="mb-6">
                <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center">
                    <BedDouble className="w-4 h-4 ml-1 text-gray-400"/>
                    اتاق‌های انتخاب شده
                </h4>
                <div className="space-y-2">
                    {booking.booking_rooms.map((room, index) => (
                        <div key={index} className="flex justify-between items-center p-3 bg-white border border-gray-200 rounded-lg shadow-sm hover:border-indigo-300 transition-colors">
                            <div>
                                <p className="font-bold text-gray-800 text-sm">{room.room_type_name}</p>
                                <p className="text-xs text-gray-500 mt-1">سرویس: {room.board_type}</p>
                            </div>
                            <div className="text-left">
                                <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded ml-2">
                                    {room.quantity} باب
                                </span>
                                <span className="text-xs text-gray-500 flex items-center mt-1 justify-end">
                                    <Users className="w-3 h-3 ml-1"/>
                                    {room.adults > 0 && `${room.adults} بزرگسال`}
                                    {room.children > 0 && `، ${room.children} کودک`}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* 4. Price Breakdown (Collapsible) */}
            <div className="bg-gray-50 rounded-xl overflow-hidden border border-gray-200">
                <button 
                    onClick={() => setShowPriceDetails(!showPriceDetails)}
                    className="w-full flex justify-between items-center p-4 bg-gray-100 hover:bg-gray-200 transition-colors text-sm font-medium text-gray-700"
                >
                    <span className="flex items-center">
                        <Calculator className="w-4 h-4 ml-2 text-gray-500"/>
                        جزئیات صورتحساب
                    </span>
                    {showPriceDetails ? <ChevronUp className="w-4 h-4"/> : <ChevronDown className="w-4 h-4"/>}
                </button>
                
                {showPriceDetails && (
                    <div className="p-4 border-t border-gray-200 space-y-2 text-sm">
                        <div className="flex justify-between text-gray-600">
                            <span>هزینه پایه اتاق‌ها ({duration} شب):</span>
                            <span>{formatPrice(booking.total_room_price || 0)} تومان</span>
                        </div>
                        
                        {/* نمایش خدمات اگر وجود دارد */}
                        {booking.booked_services && booking.booked_services.length > 0 && (
                             <div className="border-t border-gray-100 pt-2 mt-2">
                                <span className="text-gray-500 text-xs block mb-1">خدمات اضافی:</span>
                                {booking.booked_services.map(s => (
                                    <div key={s.id} className="flex justify-between text-gray-600 pl-2 text-xs">
                                        <span>+ {s.hotel_service.name}</span>
                                        <span>{formatPrice(s.total_price)}</span>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="flex justify-between text-gray-600 border-t border-gray-100 pt-2 mt-2">
                            <span>مالیات بر ارزش افزوده (VAT):</span>
                            <span>{formatPrice(booking.total_vat || 0)} تومان</span>
                        </div>
                    </div>
                )}

                <div className="p-4 bg-indigo-50 border-t border-indigo-100 flex justify-between items-center">
                    <span className="font-bold text-gray-700">مبلغ قابل پرداخت:</span>
                    <span className="font-extrabold text-2xl text-indigo-600">
                        {formatPrice(booking.total_price)} <span className="text-sm font-normal text-gray-500">تومان</span>
                    </span>
                </div>
            </div>
        </DetailCard>
    );
};
