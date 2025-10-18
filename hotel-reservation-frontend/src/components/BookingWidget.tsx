// src/components/BookingWidget.tsx
// version: 1.0.3
// FIX: Reverted 'defaultValue' prop back to 'value' for JalaliDatePicker to resolve TypeScript error.

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { DateObject } from 'react-multi-date-picker';
import { DATE_CONFIG } from '@/config/date';

import { Button } from './ui/Button';
import { JalaliDatePicker } from './ui/JalaliDatePicker';
import { AvailableRoom, CartItem } from '@/types/hotel';

interface BookingWidgetProps {
  hotelSlug: string;
  onRoomsFetch: (rooms: AvailableRoom[]) => void;
  setIsLoading: (loading: boolean) => void;
  cartItems: CartItem[];
  onRemoveFromCart: (itemId: string) => void;
  userId: number | null;
}

const BookingWidget: React.FC<BookingWidgetProps> = ({ hotelSlug, onRoomsFetch, setIsLoading, cartItems, onRemoveFromCart, userId }) => {
  const router = useRouter();
  const { check_in: checkInQuery, duration: durationQuery } = router.query;
  
  const [checkIn, setCheckIn] = useState<DateObject | null>(
    checkInQuery ? new DateObject({ date: checkInQuery as string, ...DATE_CONFIG }) : null
  );
  
  const [duration, setDuration] = useState<number>(parseInt(durationQuery as string, 10) || 1);
  const [checkOut, setCheckOut] = useState<DateObject | null>(null);

  useEffect(() => {
    if (checkIn) {
      const newCheckOut = new DateObject(checkIn).add(duration, "days");
      setCheckOut(newCheckOut);
    }
  }, [checkIn, duration]);

  const handleSearch = async () => {
    if (!checkIn) {
      alert("لطفا تاریخ ورود را انتخاب کنید.");
      return;
    }
    setIsLoading(true);
    
    const checkInStr = checkIn.format("YYYY-MM-DD");
    
    const queryParams = new URLSearchParams({
      check_in: checkInStr,
      duration: duration.toString(),
    });

    try {
      const response = await fetch(`/api/hotels/${hotelSlug}/?${queryParams}`);
      if (!response.ok) {
        throw new Error('Failed to fetch rooms');
      }
      const data = await response.json();
      onRoomsFetch(data.available_rooms || []);
      
      // Update URL to reflect the new search dates
      router.push(`/hotels/${hotelSlug}?${queryParams}`, undefined, { shallow: true });

    } catch (error) {
      console.error("Error fetching available rooms:", error);
      onRoomsFetch([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProceedToCheckout = () => {
    if (cartItems.length === 0) {
        alert("سبد خرید شما خالی است.");
        return;
    }

    if (!checkIn || !checkOut) {
        alert("لطفا تاریخ ورود و خروج را مشخص کنید.");
        return;
    }
    
    localStorage.setItem('bookingCart', JSON.stringify(cartItems));
    localStorage.setItem('checkInDate', checkIn.format("YYYY-MM-DD"));
    localStorage.setItem('checkOutDate', checkOut.format("YYYY-MM-DD"));
    localStorage.setItem('duration', duration.toString());
    
    router.push('/checkout');
  };

  const totalCartPrice = cartItems.reduce((total, item) => total + item.total_price, 0);

  const handleDateChange = (name: string, dateString: string) => {
    if (dateString) {
      const newDate = new DateObject({ date: dateString, ...DATE_CONFIG });
      setCheckIn(newDate);
    } else {
      setCheckIn(null);
    }
  };
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-lg border sticky top-8">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">تاریخ ورود</label>
          <JalaliDatePicker
            label="تاریخ ورود"
            name="check_in"
            initialValue={checkIn?.format("YYYY-MM-DD")}
            onDateChange={handleDateChange}
        />
        </div>
        <div>
          <label htmlFor="duration-select" className="block text-sm font-medium text-gray-700 mb-1">مدت اقامت (شب)</label>
          <select
            id="duration-select"
            value={duration}
            onChange={(e) => setDuration(parseInt(e.target.value, 10))}
            className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          >
            {[...Array(10).keys()].map(i => (
              <option key={i + 1} value={i + 1}>{i + 1}</option>
            ))}
          </select>
        </div>
        <Button onClick={handleSearch} className="w-full">جستجوی اتاق‌ها</Button>
      </div>

      {cartItems.length > 0 && (
        <div className="mt-6 pt-6 border-t">
          <h3 className="font-bold text-lg mb-4">سبد خرید شما</h3>
          <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
            {cartItems.map(item => (
              <div key={item.id} className="text-sm p-2 bg-gray-50 rounded-md">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold">{item.room.name}</p>
                    <p className="text-gray-600">{item.selected_board.name} ({item.quantity} اتاق)</p>
                  </div>
                  <button onClick={() => onRemoveFromCart(item.id)} className="text-red-500 hover:text-red-700 text-xs">حذف</button>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t flex justify-between items-center">
            <span className="font-bold">جمع کل:</span>
            <span className="font-bold text-red-600">{totalCartPrice.toLocaleString('fa-IR')} تومان</span>
          </div>
          <Button onClick={handleProceedToCheckout} className="w-full mt-4" variant="primary">
            نهایی کردن رزرو
          </Button>
        </div>
      )}
    </div>
  );
};

export default BookingWidget;
