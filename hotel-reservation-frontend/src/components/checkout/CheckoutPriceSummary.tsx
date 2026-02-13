// FILE: src/components/checkout/CheckoutPriceSummary.tsx
import React from 'react';
import { Calendar, Moon, Receipt, AlertCircle } from 'lucide-react'; // آیکون Check با AlertCircle جایگزین شد برای نمایش بهتر توجه
import { toPersianDigits, formatPrice } from '@/utils/format';
import { DateObject } from 'react-multi-date-picker';
import { DATE_CONFIG } from '@/config/date';

interface CheckoutPriceSummaryProps {
  checkIn: string;
  checkOut: string;
  duration: number;
  basePrice: number;
  totalServicesPrice: number;
  totalVat: number; // فیلد جدید برای دریافت مالیات محاسبه شده
  finalPrice: number;
  isLoading: boolean;
}

const CheckoutPriceSummary: React.FC<CheckoutPriceSummaryProps> = ({
  checkIn,
  checkOut,
  duration,
  basePrice,
  totalServicesPrice,
  totalVat,
  finalPrice,
  isLoading
}) => {
  
  // فرمت کردن تاریخ‌ها برای نمایش زیباتر
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    return new DateObject({ date: dateStr, ...DATE_CONFIG }).format("dd MMMM YYYY");
  };

  if (isLoading) {
    return <PriceSummarySkeleton />;
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden sticky top-4">
      <div className="bg-gray-50 p-4 border-b border-gray-100">
        <h2 className="font-bold text-gray-800 flex items-center gap-2">
          <Receipt className="w-5 h-5 text-primary-brand" />
          جزئیات صورتحساب
        </h2>
      </div>

      <div className="p-5 space-y-6">
        {/* بخش تاریخ‌ها */}
        <div className="space-y-3">
            <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500 flex items-center gap-2">
                    <Calendar className="w-4 h-4" /> تاریخ ورود
                </span>
                <span className="font-medium text-gray-800">{formatDate(checkIn)}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500 flex items-center gap-2">
                    <Calendar className="w-4 h-4" /> تاریخ خروج
                </span>
                <span className="font-medium text-gray-800">{formatDate(checkOut)}</span>
            </div>
            <div className="flex justify-between items-center text-sm bg-blue-50 p-2 rounded text-blue-800">
                <span className="flex items-center gap-2">
                    <Moon className="w-4 h-4" /> مدت اقامت
                </span>
                <span className="font-bold">{toPersianDigits(duration)} شب</span>
            </div>
        </div>

        <hr className="border-gray-100" />

        {/* بخش مبالغ */}
        <div className="space-y-3">
            <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">هزینه اقامت ({toPersianDigits(duration)} شب):</span>
                <span className="font-medium">{formatPrice(basePrice)} ریال</span>
            </div>
            
            {totalServicesPrice > 0 && (
                <div className="flex justify-between items-center text-sm text-green-700">
                    <span>خدمات اضافه:</span>
                    <span className="font-medium"> + {formatPrice(totalServicesPrice)} ریال</span>
                </div>
            )}

            {/* نمایش مالیات واقعی */}
            <div className="flex justify-between items-center text-sm text-amber-700 bg-amber-50 p-2 rounded">
                <span className="flex items-center gap-1">
                     <AlertCircle className="w-3 h-3" />
                     مالیات و ارزش افزوده:
                </span>
                <span className="font-bold">
                    {totalVat > 0 ? formatPrice(totalVat) : '0'} ریال
                </span>
            </div>
        </div>

        {/* جمع کل */}
        <div className="bg-primary-brand/5 p-4 rounded-lg border border-primary-brand/10">
            <div className="flex flex-col gap-1 text-center">
                <span className="text-sm text-gray-600">مبلغ قابل پرداخت</span>
                <span className="text-2xl font-black text-primary-brand tracking-tight">
                    {formatPrice(finalPrice)} <span className="text-xs font-normal text-gray-500">ریال</span>
                </span>
            </div>
        </div>
      </div>
    </div>
  );
};

// کامپوننت لودینگ (Skeleton)
const PriceSummarySkeleton = () => (
    <div className="bg-white rounded-xl shadow border p-4 animate-pulse space-y-4">
        <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
        <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-8 bg-gray-200 rounded w-full"></div>
        </div>
        <hr />
        <div className="h-20 bg-gray-100 rounded w-full"></div>
    </div>
);

export default CheckoutPriceSummary;
