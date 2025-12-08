// src/components/BookingWidget.tsx
// version: 1.2.0
// FEAT: Shows 'extra_adults' and 'children_count' badges in cart items.
// FIX: Uses 'formatPrice' and 'toPersianDigits' for correct formatting.
// FIX: Integrated JalaliDatePicker controlled props (value/onChange).

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { DateObject } from 'react-multi-date-picker';
import { DATE_CONFIG } from '@/config/date';

import { Button } from './ui/Button';
import { JalaliDatePicker } from './ui/JalaliDatePicker';
import { AvailableRoom, CartItem } from '@/types/hotel';
// NEW: Import formatting utilities
import { formatPrice, toPersianDigits } from '@/utils/format';

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
  
  // Initialize Check-in Date from URL or default to null
  const [checkIn, setCheckIn] = useState<DateObject | null>(
    checkInQuery ? new DateObject({ date: checkInQuery as string, ...DATE_CONFIG }) : null
  );
  
  // Initialize Duration from URL or default to 1
  const [duration, setDuration] = useState<number>(parseInt(durationQuery as string, 10) || 1);
  const [checkOut, setCheckOut] = useState<DateObject | null>(null);

  // Calculate Check-out date whenever Check-in or Duration changes
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
      
      // Update URL without reloading page
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
    
    // Save booking details to local storage for checkout page
    localStorage.setItem('bookingCart', JSON.stringify(cartItems));
    localStorage.setItem('checkInDate', checkIn.format("YYYY-MM-DD"));
    localStorage.setItem('checkOutDate', checkOut.format("YYYY-MM-DD"));
    localStorage.setItem('duration', duration.toString());
    
    router.push('/checkout');
  };

  // Calculate total price of all items in cart
  const totalCartPrice = cartItems.reduce((total, item) => total + item.total_price, 0);

  // Date Change Handler
  const handleDateChange = (date: DateObject | null) => {
    setCheckIn(date);
  };
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-lg border sticky top-8 transition-all duration-300">
      <div className="space-y-4">
        
        {/* Date Picker Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">تاریخ ورود</label>
          <JalaliDatePicker
            label="تاریخ ورود"
            name="check_in"
            value={checkIn}
            onChange={handleDateChange}
          />
        </div>

        {/* Duration Select */}
        <div>
          <label htmlFor="duration-select" className="block text-sm font-medium text-gray-700 mb-1">مدت اقامت (شب)</label>
          <select
            id="duration-select"
            value={duration}
            onChange={(e) => setDuration(parseInt(e.target.value, 10))}
            className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-white"
          >
            {[...Array(10).keys()].map(i => (
              <option key={i + 1} value={i + 1}>{toPersianDigits(i + 1)}</option>
            ))}
          </select>
        </div>

        <Button onClick={handleSearch} className="w-full shadow-md">جستجوی اتاق‌ها</Button>
      </div>

      {/* Cart Items Section */}
      {cartItems.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-100 animate-fadeIn">
          <h3 className="font-bold text-lg mb-4 text-gray-800 border-r-4 border-primary-brand pr-2">سبد خرید شما</h3>
          
          <div className="space-y-3 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
            {cartItems.map(item => (
              <div key={item.id} className="text-sm p-3 bg-gray-50 rounded-lg border border-gray-100 transition-colors hover:border-blue-200">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-bold text-gray-800">{item.room.name}</p>
                    <p className="text-gray-500 text-xs mt-1">
                        {item.selected_board.name} | {toPersianDigits(item.quantity)} اتاق
                    </p>
                    
                    {/* NEW: Display Extras Badges */}
                    {(item.extra_adults > 0 || item.children_count > 0) && (
                        <div className="flex flex-wrap gap-1 mt-2">
                            {item.extra_adults > 0 && (
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-100 text-blue-800 border border-blue-200">
                                    +{toPersianDigits(item.extra_adults)} نفر
                                </span>
                            )}
                            {item.children_count > 0 && (
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-pink-100 text-pink-800 border border-pink-200">
                                    +{toPersianDigits(item.children_count)} کودک
                                </span>
                            )}
                        </div>
                    )}
                  </div>
                  
                  <button 
                    onClick={() => onRemoveFromCart(item.id)} 
                    className="text-red-400 hover:text-red-600 p-1 rounded transition-colors"
                    title="حذف آیتم"
                  >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                  </button>
                </div>
                
                {/* Price Display */}
                <div className="mt-2 text-left pt-2 border-t border-gray-200 border-dashed">
                     <span className="font-bold text-primary-brand text-xs">
                         {formatPrice(item.total_price)} ریال
                     </span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center bg-gray-50 p-2 rounded-lg">
            <span className="font-bold text-gray-700 text-sm">جمع کل:</span>
            <span className="font-black text-lg text-primary-brand">{formatPrice(totalCartPrice)} <span className="text-xs font-normal text-gray-500">ریال</span></span>
          </div>

          <Button onClick={handleProceedToCheckout} className="w-full mt-4 shadow-lg shadow-blue-500/20" variant="primary">
            نهایی کردن رزرو
          </Button>
        </div>
      )}
    </div>
  );
};

export default BookingWidget;
