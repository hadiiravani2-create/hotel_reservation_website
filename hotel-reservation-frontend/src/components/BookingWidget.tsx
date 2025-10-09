// src/components/BookingWidget.tsx
// version: 1.0.3
// Fix: Adapted JalaliDatePicker props to match the component's actual interface (using initialValue and onDateChange).

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import moment from 'moment-jalaali';
import { Moment } from 'moment';
import { getHotelDetails } from '@/api/pricingService';
import { HotelDetails } from '@/api/pricingService';
import { CartItem } from '@/types/hotel';

// Custom components
import { JalaliDatePicker } from './ui/JalaliDatePicker'; // Your component
import { Button } from './ui/Button';

// Define the props for the component
interface BookingWidgetProps {
  hotelSlug: string;
  onRoomsFetch: (rooms: HotelDetails['available_rooms']) => void;
  setIsLoading: (isLoading: boolean) => void;
  cartItems: CartItem[];
}

const BookingWidget: React.FC<BookingWidgetProps> = ({ hotelSlug, onRoomsFetch, setIsLoading, cartItems }) => {
  const router = useRouter();
  const { query } = router;

  const [checkInDate, setCheckInDate] = useState<Moment | null>(
    query.check_in && typeof query.check_in === 'string' ? moment(query.check_in, 'jYYYY-jMM-jDD') : null
  );
  const [duration, setDuration] = useState<number>(
    query.duration && typeof query.duration === 'string' ? parseInt(query.duration, 10) : 1
  );

  useEffect(() => {
    if (checkInDate && duration > 0) {
      handleAvailabilityCheck();
    }
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
        <div>
          {/* --- START: JalaliDatePicker props corrected --- */}
          <JalaliDatePicker
            label="تاریخ ورود"
            name="check_in"
            initialValue={checkInDate ? checkInDate.format('jYYYY-jMM-jDD') : ''}
            onDateChange={(name, date) => setCheckInDate(moment(date, 'jYYYY-jMM-jDD'))}
            required
          />
          {/* --- END: JalaliDatePicker props corrected --- */}
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

      {cartItems.length > 0 && (
        <div className="mt-6 border-t pt-4">
          <h4 className="text-lg font-semibold mb-2">خلاصه رزرو</h4>
          <div className="flex justify-between items-center text-gray-700">
            <span>تعداد اتاق انتخاب شده:</span>
            <span className="font-bold">{totalItems}</span>
          </div>
          <div className="flex justify-between items-center mt-2 text-gray-900">
            <span className="font-bold">مبلغ کل:</span>
            <span className="font-extrabold text-lg">{totalPrice.toLocaleString()} تومان</span>
          </div>
           <Button 
            onClick={() => router.push('/checkout')} 
            className="w-full mt-4 bg-green-600 hover:bg-green-700"
          >
            تکمیل رزرو و پرداخت
          </Button>
        </div>
      )}
    </div>
  );
};

export default BookingWidget;
