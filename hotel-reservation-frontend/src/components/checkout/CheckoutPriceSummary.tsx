import React from 'react';
import { DateObject } from "react-multi-date-picker";
import { DATE_CONFIG } from '@/config/date';
import { formatPrice, toPersianDigits } from '@/utils/format';

interface CheckoutPriceSummaryProps {
  checkIn: string;
  checkOut: string;
  duration: number;
  basePrice: number;
  totalServicesPrice: number;
  finalPrice: number;
  isLoading: boolean;
}

const CheckoutPriceSummary: React.FC<CheckoutPriceSummaryProps> = ({
  checkIn,
  checkOut,
  duration,
  basePrice,
  totalServicesPrice,
  finalPrice,
  isLoading
}) => {
  
  const formattedCheckIn = checkIn ? new DateObject({ date: checkIn, calendar: DATE_CONFIG.calendar, locale: DATE_CONFIG.locale }).format("dddd D MMMM") : '';
  const formattedCheckOut = checkOut ? new DateObject({ date: checkOut, calendar: DATE_CONFIG.calendar, locale: DATE_CONFIG.locale }).format("dddd D MMMM") : '';

  return (
    <div className="p-6 bg-white rounded-xl shadow-lg border border-gray-100 sticky top-24 transition-all duration-300">
        <h2 className="text-xl font-bold mb-4 border-b pb-3 text-gray-800">خلاصه رزرو</h2>
        
        <div className="space-y-3 pb-3 border-b text-sm">
            <div className="flex justify-between"><span className="text-gray-500">تاریخ ورود:</span><span className="font-semibold text-gray-800">{toPersianDigits(formattedCheckIn)}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">تاریخ خروج:</span><span className="font-semibold text-gray-800">{toPersianDigits(formattedCheckOut)}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">مدت اقامت:</span><span className="font-semibold text-gray-800">{toPersianDigits(duration)} شب</span></div>
        </div>

        <div className="mt-4 pt-2 space-y-2">
            <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">مبلغ اتاق‌ها و نفرات:</span>
                <span className="font-bold text-gray-900">{isLoading ? '...' : formatPrice(basePrice)} <span className="text-xs font-normal">ریال</span></span>
            </div>
            
            {totalServicesPrice > 0 && (
                <div className="flex justify-between items-center text-sm text-blue-600">
                    <span>خدمات اضافی:</span>
                    <span className="font-bold">{formatPrice(totalServicesPrice)} <span className="text-xs font-normal">ریال</span></span>
                </div>
            )}
            
            <div className="border-t border-dashed my-3 pt-3">
                    <div className="flex justify-between items-center text-lg font-black text-primary-brand">
                    <span>مبلغ نهایی:</span>
                    <span>{isLoading ? 'محاسبه...' : formatPrice(finalPrice)} ریال</span>
                </div>
            </div>
        </div>
    </div>
  );
};

export default CheckoutPriceSummary;
