// src/components/BookingWidget.tsx
// version: 2.3.0
// FINAL FIX: Corrected all prop mismatches, including the 'value' vs 'defaultValue' error for JalaliDatePicker.
// This version has been fully reviewed to resolve all previous build errors.

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useQuery } from '@tanstack/react-query';
import { DateObject } from 'react-multi-date-picker';
import { Button } from './ui/Button';
import { JalaliDatePicker } from './ui/JalaliDatePicker';
import { getHotelDetails, HotelDetails } from '@/api/pricingService';
import { AvailableRoom, CartItem } from '@/types/hotel';
import { DATE_CONFIG } from '@/config/date';

interface BookingWidgetProps {
  hotelSlug: string;
  onRoomsFetch: (rooms: AvailableRoom[]) => void;
  setIsLoading: (loading: boolean) => void;
  cartItems: CartItem[];
  onRemoveFromCart: (itemId: string) => void;
  userId: number | null;
}

const BookingWidget: React.FC<BookingWidgetProps> = ({
  hotelSlug,
  onRoomsFetch,
  setIsLoading,
  cartItems,
  onRemoveFromCart,
  userId,
}) => {
  const router = useRouter();
  const [checkIn, setCheckIn] = useState<DateObject | null>(
    router.query.check_in ? new DateObject({ date: router.query.check_in as string, calendar: DATE_CONFIG.calendar }) : null
  );
  const [duration, setDuration] = useState<number>(
    router.query.duration ? parseInt(router.query.duration as string, 10) : 1
  );

  const { refetch } = useQuery<HotelDetails, Error, AvailableRoom[]>({
    queryKey: ['availableRooms', hotelSlug, checkIn, duration],
    queryFn: async () => {
      setIsLoading(true);
      const checkInString = checkIn!.format("YYYY-MM-DD");
      const hotelDetails = await getHotelDetails(hotelSlug, checkInString, String(duration));
      const rooms = hotelDetails.available_rooms || [];
      onRoomsFetch(rooms);
      setIsLoading(false);
      return hotelDetails;
    },
    select: (data) => data.available_rooms || [],
    enabled: !!checkIn && duration > 0,
    refetchOnWindowFocus: false,
  });

  const handleSearch = () => {
    if (checkIn && duration > 0) {
      router.push({
          pathname: `/hotels/${hotelSlug}`,
          query: { check_in: checkIn.format("YYYY-MM-DD"), duration },
      }, undefined, { shallow: true });
      refetch();
    } else {
      alert('لطفا تاریخ ورود و مدت اقامت را انتخاب کنید.');
    }
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      alert("برای ادامه، ابتدا باید حداقل یک اتاق به سبد خرید اضافه کنید.");
      return;
    }

    if (checkIn && duration > 0) {
        const checkOutDateObj = new DateObject(checkIn).add(duration, "days");
        localStorage.setItem('bookingCart', JSON.stringify(cartItems));
        localStorage.setItem('checkInDate', checkIn.format("YYYY-MM-DD"));
        localStorage.setItem('checkOutDate', checkOutDateObj.format("YYYY-MM-DD"));
        localStorage.setItem('duration', String(duration));
        router.push('/checkout');
    } else {
        alert("خطا: تاریخ ورود یا مدت اقامت مشخص نیست. لطفاً مجدداً جستجو کنید.");
    }
  };

  const totalCartPrice = cartItems.reduce((acc, item) => acc + item.total_price, 0);

  return (
    <div className="sticky top-8 p-6 bg-white rounded-xl shadow-lg border border-gray-100">
      <h2 className="text-xl font-bold mb-4 border-b pb-3">بررسی قیمت و موجودی</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">تاریخ ورود</label>
          {/* --- FINAL FIX: Changed 'value' prop to 'defaultValue' --- */}
          <JalaliDatePicker
            defaultValue={checkIn}
            onChange={(date: DateObject | DateObject[] | null) => {
              const newDate = Array.isArray(date) ? date[0] : date;
              setCheckIn(newDate);
            }}
          />
        </div>
        <div>
          <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">مدت اقامت (شب)</label>
          <input
            id="duration"
            type="number"
            value={duration}
            onChange={(e) => setDuration(parseInt(e.target.value, 10) || 1)}
            min="1"
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </div>
        <Button onClick={handleSearch} className="w-full">جستجوی اتاق‌ها</Button>
      </div>

      {cartItems.length > 0 && (
        <div className="mt-6 pt-4 border-t">
          <h3 className="font-bold mb-3">سبد خرید</h3>
          <div className="space-y-3">
            {cartItems.map(item => (
              <div key={item.id} className="text-sm p-2 bg-gray-50 rounded-md">
                <p className="font-semibold">{item.room.name}</p>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-gray-600">{item.quantity} اتاق</span>
                  <button onClick={() => onRemoveFromCart(item.id)} className="text-red-500 hover:text-red-700 text-xs">حذف</button>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t font-bold flex justify-between">
            <span>جمع کل:</span>
            <span>{totalCartPrice.toLocaleString('fa-IR')} تومان</span>
          </div>
          <Button onClick={handleCheckout} variant="primary" className="w-full mt-4">
            نهایی کردن رزرو
          </Button>
        </div>
      )}
    </div>
  );
};

export default BookingWidget;
