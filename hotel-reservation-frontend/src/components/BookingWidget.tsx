// src/components/BookingWidget.tsx
// version: 3.0.3
// Feature: Accepted userId and passed it to getHotelDetails for correct dynamic pricing check.

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import moment from 'moment-jalaali';
// FIX: The API service needs to be updated to accept the userId parameter
import { getHotelDetails } from '@/api/pricingService'; 
import { HotelDetails } from '@/api/pricingService';
import { CartItem } from '@/types/hotel';
import { XCircleIcon } from '@heroicons/react/24/outline';

// Custom components
import { JalaliDatePicker } from './ui/JalaliDatePicker';
import { Button } from './ui/Button';

// --- LocalStorage Keys (Must match checkout.tsx) ---
const CHECKOUT_CART_KEY = 'localCart';
const CHECKOUT_DATES_KEY = 'localDates';
// ----------------------------------------------------


// Utility Functions (remains unchanged)
const toEnglishDigits = (str: string | null | undefined): string => {
// ... (implementation remains unchanged)
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
  onRemoveFromCart: (itemId: string) => void;
  // NEW: Accept userId for pricing checks
  userId: number | null; 
}

const BookingWidget: React.FC<BookingWidgetProps> = ({ hotelSlug, onRoomsFetch, setIsLoading, cartItems, onRemoveFromCart, userId }) => { // <-- Accepted new prop
  const router = useRouter();
  const { query } = router;

  const sanitizedCheckIn = query.check_in && typeof query.check_in === 'string' ? toEnglishDigits(query.check_in) : null;

  // FIX: Using typeof moment.Moment to correctly reference the type of the Moment instance
  const [checkInDate, setCheckInDate] = useState<typeof moment.Moment | null>( 
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
      
      // Update URL first
      router.push(`/hotels/${hotelSlug}?check_in=${formattedCheckIn}&duration=${duration}`, undefined, { shallow: true });

      // Fetch details, passing userId for accurate pricing
      const hotelDetails = await getHotelDetails(
        hotelSlug, 
        formattedCheckIn, 
        duration.toString(),
        userId // NEW: Pass the authenticated user ID
      ); 
      onRoomsFetch(hotelDetails.available_rooms || []);
    } catch (error) {
      console.error("Failed to fetch room availability:", error);
      onRoomsFetch([]);
    } finally {
      setIsLoading(false);
    }
  };
  
  // --- Start: Logic to save cart and navigate (remains unchanged) ---
  const handleCheckoutClick = () => {
    if (!checkInDate || duration <= 0 || cartItems.length === 0) {
        alert("لطفاً تاریخ ورود و اتاق‌های مورد نظر را انتخاب نمایید.");
        return;
    }
    
    try {
        const dates = {
            check_in: checkInDate.format('jYYYY-jMM-jDD'),
            duration: duration,
        };
        
        // Save items and dates to LocalStorage
        localStorage.setItem(CHECKOUT_CART_KEY, JSON.stringify(cartItems));
        localStorage.setItem(CHECKOUT_DATES_KEY, JSON.stringify(dates));

        // Navigate to checkout page
        router.push('/checkout');
        
    } catch (e) {
        console.error("Failed to save cart to LocalStorage:", e);
        alert("خطا در ذخیره اطلاعات سبد خرید. لطفاً مرورگر خود را بررسی کنید.");
    }
  };
  // --- End: Logic to save cart and navigate ---


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
            onClick={handleCheckoutClick}
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
