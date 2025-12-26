// src/components/checkout/CheckoutGuestSection.tsx
// version: 6.2.1
// FIX: Ensure file is properly closed with braces to resolve export error.

import React, { useState } from 'react';
import { GuestPayload } from '@/api/reservationService';
import GuestInputForm from '../GuestInputForm';
import { Info, ChevronDown } from 'lucide-react';
import { toPersianDigits } from '@/utils/format';

interface CheckoutGuestSectionProps {
  guests: Partial<GuestPayload>[];
  onGuestChange: (index: number, data: Partial<GuestPayload>) => void;
  isAuthenticated: boolean;
  validationErrors?: any; 
}

const CheckoutGuestSection: React.FC<CheckoutGuestSectionProps> = ({ 
    guests, 
    onGuestChange, 
    isAuthenticated, 
    validationErrors = {} 
}) => {
  const [isGuestDetailsOpen, setGuestDetailsOpen] = useState(false);

  // Helper to extract errors specific to a guest index
  const getGuestErrors = (index: number) => {
    if (validationErrors?.guests && Array.isArray(validationErrors.guests)) {
        return validationErrors.guests[index] || {};
    }
    return {};
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-lg border border-gray-100 mt-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-800">
            <span className="w-1 h-6 bg-primary-brand rounded-full"></span>
            ۲. اطلاعات میهمانان
        </h2>
        
        <div className="mb-6 p-4 bg-blue-50 border border-blue-100 rounded-lg flex items-start gap-3 text-sm text-blue-800">
            <Info className="w-5 h-5 flex-shrink-0 mt-0.5"/>
            <p>
                وارد کردن اطلاعات <strong>سرپرست رزرو (نفر اول)</strong> الزامی است. 
                <br/>
                اطلاعات سایر میهمانان ({toPersianDigits(Math.max(0, guests.length - 1))} نفر دیگر) اختیاری است، اما جهت تسریع در پذیرش هتل پیشنهاد می‌شود تکمیل گردد.
            </p>
        </div>
        
        {guests.length > 0 && (
            <GuestInputForm 
            index={0} 
            value={guests[0]} 
            onChange={onGuestChange} 
            isPrincipal={true} 
            containerClass="bg-white border-2 border-primary-brand/20 shadow-sm"
            isUnauthenticated={!isAuthenticated}
            errors={getGuestErrors(0)}
            />
        )}
        
        {guests.length > 1 && (
            <div className="mt-6 border-t pt-4">
            <button 
                type="button" 
                onClick={() => setGuestDetailsOpen(!isGuestDetailsOpen)} 
                className="flex items-center justify-between w-full font-bold text-gray-700 hover:text-primary-brand transition-colors p-2 rounded hover:bg-gray-50"
            >
                <span>تکمیل اطلاعات سایر میهمانان (اختیاری)</span>
                <ChevronDown className={`w-5 h-5 transition-transform ${isGuestDetailsOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {isGuestDetailsOpen && (
                <div className="mt-4 space-y-4 animate-fadeIn">
                {guests.slice(1).map((guest, index) => (
                    <GuestInputForm 
                    key={index + 1} 
                    index={index + 1} 
                    value={guest} 
                    onChange={onGuestChange} 
                    isPrincipal={false} 
                    containerClass="bg-gray-50 border border-gray-200"
                    isUnauthenticated={!isAuthenticated}
                    errors={getGuestErrors(index + 1)}
                    />
                ))}
                </div>
            )}
            </div>
        )}
    </div>
  );
};

export default CheckoutGuestSection;
