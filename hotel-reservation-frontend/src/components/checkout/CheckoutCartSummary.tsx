import React from 'react';
import { CartItem } from '@/types/hotel';
import { Users } from 'lucide-react';
import { toPersianDigits } from '@/utils/format';

interface CheckoutCartSummaryProps {
  cartItems: CartItem[];
}

const RoomSummaryItem: React.FC<{ item: CartItem }> = ({ item }) => {
  return (
    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 mb-3 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors hover:border-blue-200">
      <div>
        <h3 className="font-bold text-gray-800 flex items-center gap-2">
            {item.room.name}
            <span className="text-xs font-normal bg-white px-2 py-1 rounded border text-gray-600">
                {toPersianDigits(item.quantity)} اتاق
            </span>
        </h3>
        <p className="text-sm text-gray-500 mt-1">
            سرویس: <span className="font-medium text-gray-700">{item.selected_board.name}</span>
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm">
          <div className="px-3 py-1 bg-blue-50 text-blue-700 rounded-md flex items-center gap-1 border border-blue-100">
              <Users className="w-4 h-4" />
              <span>ظرفیت پایه: {toPersianDigits(item.room.base_capacity)}</span>
          </div>
          
          {(item.extra_adults > 0 || item.children_count > 0) && (
              <div className="flex gap-2">
                  {item.extra_adults > 0 && (
                      <span className="px-2 py-1 bg-green-50 text-green-700 rounded-md border border-green-100 font-medium">
                          +{toPersianDigits(item.extra_adults)} نفر اضافه
                      </span>
                  )}
                  {item.children_count > 0 && (
                      <span className="px-2 py-1 bg-pink-50 text-pink-700 rounded-md border border-pink-100 font-medium">
                          +{toPersianDigits(item.children_count)} کودک
                      </span>
                  )}
              </div>
          )}
      </div>
    </div>
  );
};

const CheckoutCartSummary: React.FC<CheckoutCartSummaryProps> = ({ cartItems }) => {
  return (
    <div className="p-6 bg-white rounded-xl shadow-lg border border-gray-100">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-800">
        <span className="w-1 h-6 bg-primary-brand rounded-full"></span>
        ۱. جزئیات اتاق‌های انتخابی
        </h2>
        <div className="space-y-2">
            {cartItems.map(item => (
                <RoomSummaryItem key={item.id} item={item} />
            ))}
        </div>
    </div>
  );
};

export default CheckoutCartSummary;
