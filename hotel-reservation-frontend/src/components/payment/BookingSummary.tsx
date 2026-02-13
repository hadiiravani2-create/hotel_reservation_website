// FILE: src/components/payment/BookingSummary.tsx
// version: 2.1.0
// REFACTOR: Added safer date handling and duration calculation.

import React, { useState } from 'react';
import { BookingDetail } from '@/api/reservationService';
import { formatPrice, toPersianDigits } from '@/utils/format';
import { DetailCard } from '@/components/ui/DetailCard';
import { 
    Hotel, Calendar, Clock, Users, ChevronDown, ChevronUp, 
    Calculator, BedDouble, CheckCircle 
} from 'lucide-react';
import { DateObject } from 'react-multi-date-picker';
import { DATE_CONFIG } from '@/config/date';

// Helper: Format Date safely
const formatJalaliDate = (dateStr: string) => {
    if (!dateStr) return '---';
    try {
        return new DateObject({ date: dateStr, ...DATE_CONFIG }).format('dddd D MMMM YYYY');
    } catch (e) {
        return dateStr;
    }
};

// Helper: Calculate Duration
const calculateDuration = (start: string, end: string) => {
    if (!start || !end) return 0;
    try {
        const startDate = new DateObject({ date: start, ...DATE_CONFIG });
        const endDate = new DateObject({ date: end, ...DATE_CONFIG });
        // Calculate difference in days
        const diff = (endDate.toUnix() - startDate.toUnix()) / (24 * 3600);
        return Math.max(1, Math.round(diff));
    } catch (e) {
        return 1;
    }
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
                    <div className="flex items-center gap-2 mt-2">
                         <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs border border-blue-100 font-mono">
                            کد پیگیری: {booking.booking_code}
                         </span>
                    </div>
                </div>
                <div className="text-center bg-indigo-50 p-2 rounded-lg border border-indigo-100 min-w-[80px]">
                    <span className="block text-xs text-indigo-500 mb-1">مدت اقامت</span>
                    <span className="font-bold text-indigo-700 text-lg">{toPersianDigits(duration)} شب</span>
                </div>
            </div>

            {/* 2. Dates & Times */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 relative">
                    <div className="flex items-center text-gray-700 mb-1 gap-2">
                        <Calendar className="w-4 h-4 text-green-600"/>
                        <span className="text-xs font-bold">زمان ورود</span>
                    </div>
                    <div className="text-sm font-semibold mr-6">{formatJalaliDate(booking.check_in)}</div>
                    <div className="text-xs text-gray-500 mt-1 flex items-center mr-6">
                        <Clock className="w-3 h-3 ml-1"/> ساعت ۱۴:۰۰
                    </div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 relative">
                    <div className="flex items-center text-gray-700 mb-1 gap-2">
                        <Calendar className="w-4 h-4 text-red-500"/>
                        <span className="text-xs font-bold">زمان خروج</span>
                    </div>
                    <div className="text-sm font-semibold mr-6">{formatJalaliDate(booking.check_out)}</div>
                    <div className="text-xs text-gray-500 mt-1 flex items-center mr-6">
                        <Clock className="w-3 h-3 ml-1"/> ساعت ۱۲:۰۰
                    </div>
                </div>
            </div>

            {/* 3. Room Details */}
            <div className="mb-6">
                <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                    <BedDouble className="w-4 h-4 text-gray-400"/>
                    لیست اتاق‌ها
                </h4>
                <div className="space-y-2">
                    {booking.booking_rooms.map((room, index) => (
                        <div key={index} className="flex justify-between items-center p-3 bg-white border border-gray-100 rounded-lg shadow-sm">
                            <div>
                                <p className="font-bold text-gray-800 text-sm">{room.room_type_name}</p>
                                <p className="text-xs text-gray-500 mt-1">سرویس: {room.board_type}</p>
                            </div>
                            <div className="text-left flex flex-col items-end">
                                <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                                    {toPersianDigits(room.quantity)} باب
                                </span>
                                <span className="text-xs text-gray-400 flex items-center mt-1">
                                    <Users className="w-3 h-3 ml-1"/>
                                    {toPersianDigits(room.adults)} + {toPersianDigits(room.children)}
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
                    <span className="flex items-center gap-2">
                        <Calculator className="w-4 h-4 text-gray-500"/>
                        مشاهده جزئیات صورتحساب
                    </span>
                    {showPriceDetails ? <ChevronUp className="w-4 h-4"/> : <ChevronDown className="w-4 h-4"/>}
                </button>
                
                {showPriceDetails && (
                    <div className="p-4 border-t border-gray-200 space-y-2 text-sm bg-white">
                        <div className="flex justify-between text-gray-600">
                            <span>هزینه پایه اقامت:</span>
                            <span>{formatPrice(booking.total_room_price || 0)} ریال</span>
                        </div>
                        
                        {/* Services */}
                        {booking.booked_services && booking.booked_services.length > 0 && (
                             <div className="border-t border-gray-100 pt-2 mt-2">
                                <span className="text-gray-500 text-xs block mb-1 font-bold">خدمات اضافه:</span>
                                {booking.booked_services.map(s => (
                                    <div key={s.id} className="flex justify-between text-gray-600 pl-2 text-xs mb-1">
                                        <span>+ {s.hotel_service.name} ({toPersianDigits(s.quantity)} عدد)</span>
                                        <span>{formatPrice(s.total_price)}</span>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* VAT */}
                        {(booking.total_vat || 0) > 0 && (
                            <div className="flex justify-between text-gray-600 border-t border-gray-100 pt-2 mt-2">
                                <span>مالیات بر ارزش افزوده:</span>
                                <span>{formatPrice(booking.total_vat || 0)} ریال</span>
                            </div>
                        )}
                    </div>
                )}

                <div className="p-4 bg-primary-brand/5 border-t border-primary-brand/10 flex justify-between items-center">
                    <span className="font-bold text-gray-700">مبلغ قابل پرداخت:</span>
                    <span className="font-black text-xl text-primary-brand">
                        {formatPrice(booking.total_price)} <span className="text-xs font-normal text-gray-500">ریال</span>
                    </span>
                </div>
            </div>
        </DetailCard>
    );
};
