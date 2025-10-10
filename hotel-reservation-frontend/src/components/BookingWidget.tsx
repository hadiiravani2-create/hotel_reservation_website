// src/components/BookingWidget.tsx
// version: 2.0.0
// Feature: Added cart summary display with item details and removal functionality (to address Issue 3).
// Fix: Added onRemoveFromCart to props.

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import moment from 'moment-jalaali';
import { Moment } from 'moment';
import { getHotelDetails } from '@/api/pricingService';
import { HotelDetails } from '@/api/pricingService';
import { CartItem } from '@/types/hotel';
import { XCircleIcon } from '@heroicons/react/24/outline'; // Icon for removal

// Custom components
import { JalaliDatePicker } from './ui/JalaliDatePicker';
import { Button } from './ui/Button';

// Utility Functions
const toEnglishDigits = (str: string | null | undefined): string => {
    if (!str) return '';
    const persianNumbers = [/۰/g, /۱/g, /۲/g, /۳/g, /۴/g, /۵/g, /۶/g, /۷/g, /۸/g, /۹/g];
    const arabicNumbers  = [/٠/g, /١/g, /٢/g, /٣/g, /٤/g, /٥/g, /٦/g, /٧/g, /٨/g, /٩/g];
    let newStr = str;
    for (let i = 0; i < 10; i++) {
        newStr = newStr.replace(persianNumbers[i], i.toString()).replace(arabicNumbers[i], i.toString());
    }
    return newStr;
};

interface BookingWidgetProps {
  hotelSlug: string;
  onRoomsFetch: (rooms: HotelDetails['available_rooms']) => void;
  setIsLoading: (isLoading: boolean) => void;
  cartItems: CartItem[];
  // START FIX 3: Added prop to handle item removal
  onRemoveFromCart: (itemId: string) => void;
  // END FIX 3
}

const BookingWidget: React.FC<BookingWidgetProps> = ({ hotelSlug, onRoomsFetch, setIsLoading, cartItems, onRemoveFromCart }) => {
  const router = useRouter();
  const { query } = router;

  const sanitizedCheckIn = query.check_in && typeof query.check_in === 'string' ? toEnglishDigits(query.check_in) : null;

  const [checkInDate, setCheckInDate] = useState<Moment | null>(
    sanitizedCheckIn ? moment(sanitizedCheckIn, 'jYYYY-jMM-jDD') : null
  );
  const [duration, setDuration] = useState<number>(
    query.duration && typeof query.duration === 'string' ? parseInt(query.duration, 10) : 1
  );

  useEffect(() => {
    // Initial fetch is handled by getServerSideProps, subsequent fetches are manual.
  }, []); 

  const handleAvailabilityCheck = async () => {
    if (!checkInDate) {
      alert('لطفا تاریخ ورود را انتخاب کنید.');
      return;
    }
    setIsLoading(true);
    try {
      const formattedCheckIn = checkInDate.format('jYYYY-jMM-jDD');
      
      router.push(`/hotels/${hotelSlug}?check_in=${formattedCheckIn}&duration=${duration}`, undefined, { shallow: true });

      const hotelDetails = await getHotelDetails(hotelSlug, formattedCheckIn, duration.toString());
      onRoomsFetch(hotelDetails.available_rooms || []);
    } catch (error) {
      console.error("Failed to fetch room availability:", error);
      onRoomsFetch([]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const calculateCartTotal = () => {
    return cartItems.reduce((total, item) => total + item.total_price, 0);
  };

  const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0);
  const totalPrice = calculateCartTotal();

  return (
    <div className="sticky top-4 bg-white p-6 rounded-lg shadow-lg border border-gray-200">
      <h3 className="text-xl font-bold mb-4 text-gray-800">رزرو اتاق</h3>
      
      <div className="space-y-4">
        {/* Date Picker and Duration Input (Unchanged) */}
        <div>
          <JalaliDatePicker
            label="تاریخ ورود"
            name="check_in"
            initialValue={checkInDate ? checkInDate.format('jYYYY-jMM-jDD') : ''}
            onDateChange={(name, date) => setCheckInDate(moment(toEnglishDigits(date), 'jYYYY-jMM-jDD'))}
            required
          />
        </div>
        <div>
          <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">مدت اقامت (شب)</label>
          <input
            id="duration"
            type="number"
            min="1"
            value={duration}
            onChange={(e) => setDuration(parseInt(e.target.value, 10) || 1)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      <div className="mt-6">
        <Button onClick={handleAvailabilityCheck} className="w-full">
          بررسی قیمت و موجودی
        </Button>
      </div>

      {/* START FIX 3: Detailed Cart Summary */}
      {cartItems.length > 0 && (
        <div className="mt-6 border-t pt-4">
          <h4 className="text-lg font-semibold mb-3">خلاصه رزرو ({totalItems} اتاق)</h4>
          
          <ul className="space-y-3 mb-4">
            {cartItems.map(item => (
              <li key={item.id} className="flex justify-between items-start text-sm bg-gray-50 p-3 rounded-md border">
                <div className="flex-grow">
                  <p className="font-semibold text-gray-800">{item.room.name}</p>
                  <p className="text-gray-600">
                    <span className="font-medium">{item.quantity}</span> اتاق 
                    (سرویس: {item.selected_board.name})
                  </p>
                  <p className="font-medium text-blue-600 mt-1">{item.total_price.toLocaleString()} تومان</p>
                </div>
                <button 
                  onClick={() => onRemoveFromCart(item.id)}
                  className="text-red-500 hover:text-red-700 transition-colors mr-2 flex-shrink-0"
                  aria-label={`حذف ${item.room.name} از سبد خرید`}
                >
                  <XCircleIcon className="w-6 h-6" />
                </button>
              </li>
            ))}
          </ul>

          <div className="flex justify-between items-center mt-4 border-t pt-3 text-gray-900">
            <span className="font-bold text-xl">مبلغ کل:</span>
            <span className="font-extrabold text-xl text-blue-700">{totalPrice.toLocaleString()} تومان</span>
          </div>
           <Button 
            onClick={() => router.push('/checkout')} 
            className="w-full mt-4 bg-green-600 hover:bg-green-700"
          >
            تکمیل رزرو و پرداخت
          </Button>
        </div>
      )}
      {/* END FIX 3 */}
    </div>
  );
};

export default BookingWidget;
