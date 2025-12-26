// src/components/RoomRateCalendar.tsx
// version: 2.0.0
// FIX: Added Board Type Selector to handle multiple pricing plans per room.

import React, { useState, useEffect } from "react";
import { Calendar, DateObject } from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import axios from "axios";
import { toPersianDigits, formatPrice } from "@/utils/format";
import { PricedBoardType } from "@/types/hotel"; // اطمینان از ایمپورت تایپ صحیح

const WEEK_DAYS = ["ش", "ی", "د", "س", "چ", "پ", "ج"];

interface DailyRate {
  date: string;
  day: number;
  price: number | null;
  is_available: boolean;
  status_text: string;
}

interface Props {
    roomId: number;
    availableBoards: PricedBoardType[]; // لیست بردهای موجود برای این اتاق
    initialBoardId?: number; // برد پیش‌فرض (انتخاب شده در کارت)
}

export const RoomRateCalendar: React.FC<Props> = ({ roomId, availableBoards, initialBoardId }) => {
  const [rates, setRates] = useState<Record<string, DailyRate>>({});
  const [currentDate, setCurrentDate] = useState(new DateObject({ calendar: persian, locale: persian_fa }));
  const [isLoading, setIsLoading] = useState(false);
  
  // استیت برای برد انتخاب شده در تقویم
  const [selectedBoardId, setSelectedBoardId] = useState<number>(initialBoardId || (availableBoards[0]?.board_type.id));

  const fetchRates = async (year: number, month: number, boardId: number) => {
    if (!boardId) return;
    
    setIsLoading(true);
    try {
      // ارسال board_type_id به سرور
      const res = await axios.get(`/pricing/api/room-calendar/${roomId}/?year=${year}&month=${month}&board_type_id=${boardId}`);
      
      const rateMap: Record<string, DailyRate> = {};
      res.data.forEach((item: DailyRate) => {
        rateMap[item.date] = item; 
      });
      setRates(prev => ({ ...prev, ...rateMap }));
    } catch (error) {
      console.error("Error fetching rates", error);
    } finally {
        setIsLoading(false);
    }
  };

  useEffect(() => {
    if (selectedBoardId) {
        fetchRates(currentDate.year, currentDate.month.number, selectedBoardId);
    }
  }, [currentDate.year, currentDate.month.number, roomId, selectedBoardId]);

  return (
    <div className="room-calendar-wrapper dir-rtl select-none">
      
      {/* --- انتخابگر نوع سرویس (برد) --- */}
      <div className="mb-4 px-2">
        <label className="text-xs text-gray-500 block mb-1">نوع سرویس را انتخاب کنید:</label>
        <select 
            value={selectedBoardId}
            onChange={(e) => {
                setRates({}); // پاک کردن قیمت‌های قبلی هنگام تغییر برد
                setSelectedBoardId(Number(e.target.value));
            }}
            className="w-full p-2 border border-gray-300 rounded-md text-sm bg-white focus:border-blue-500 outline-none"
        >
            {availableBoards.map((b) => (
                <option key={b.board_type.id} value={b.board_type.id}>
                    {b.board_type.name}
                </option>
            ))}
        </select>
      </div>

      <Calendar
        calendar={persian}
        locale={persian_fa}
        weekDays={WEEK_DAYS}
        currentDate={currentDate}
        onMonthChange={(date: DateObject) => setCurrentDate(date)}
        readOnly
        
        mapDays={({ date }) => {
          const year = date.year;
          const month = date.month.number.toString().padStart(2, '0');
          const day = date.day.toString().padStart(2, '0');
          const dateStr = `${year}-${month}-${day}`;
          
          const rateInfo = rates[dateStr];
          
          if (!rateInfo) return {};

          const isSoldOut = !rateInfo.is_available;
          const hasPrice = rateInfo.price && rateInfo.price > 0;

          return {
            children: (
              <div className="flex flex-col items-center justify-center h-full w-full py-1">
                <span className={`text-sm font-bold ${isSoldOut ? 'text-gray-400' : 'text-gray-800'}`}>
                  {toPersianDigits(date.day)}
                </span>
                <span className={`text-[10px] mt-1 leading-tight ${isSoldOut ? 'text-red-500' : 'text-blue-600'}`}>
                   {isSoldOut ? 'تکمیل' : (hasPrice ? formatPrice(rateInfo.price!) : '')}
                </span>
              </div>
            ),
            disabled: isSoldOut,
            className: isSoldOut 
                ? "bg-gray-50 cursor-not-allowed border-gray-100" 
                : "hover:bg-blue-50 cursor-pointer border-gray-100 transition-colors"
          };
        }}
      />
      {isLoading && <p className="text-center text-xs text-gray-400 mt-2">در حال دریافت قیمت‌ها...</p>}
    </div>
  );
};
