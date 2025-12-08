// src/components/hotel-detail/HotelInfoSummary.tsx
// version: 1.0.1
// FIX: Handled 'null' values for checkInTime/checkOutTime to satisfy TypeScript strict typing.

import React from 'react';
import { LogIn, LogOut } from 'lucide-react';
import { toPersianDigits } from '@/utils/format';

interface HotelInfoSummaryProps {
  checkInTime: string | null;
  checkOutTime: string | null;
}

const HotelInfoSummary: React.FC<HotelInfoSummaryProps> = ({ checkInTime, checkOutTime }) => {
  return (
    <div className="flex justify-around items-center bg-white p-4 rounded-xl shadow-sm mb-8 border border-gray-100">
      <div className="flex items-center gap-3 text-gray-700">
        <div className="bg-cyan-50 p-2 rounded-full">
            <LogIn className="w-6 h-6 text-cyan-600" />
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">ساعت ورود</p>
          {/* FIX: Added || '' to handle null values */}
          <p className="font-bold text-lg">{toPersianDigits(checkInTime || '')}</p>
        </div>
      </div>
      
      <div className="w-px h-10 bg-gray-200"></div>

      <div className="flex items-center gap-3 text-gray-700">
        <div className="bg-red-50 p-2 rounded-full">
            <LogOut className="w-6 h-6 text-red-600" />
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">ساعت خروج</p>
          {/* FIX: Added || '' to handle null values */}
          <p className="font-bold text-lg">{toPersianDigits(checkOutTime || '')}</p>
        </div>
      </div>
    </div>
  );
};

export default HotelInfoSummary;
