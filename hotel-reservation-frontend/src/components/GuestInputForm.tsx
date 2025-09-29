// src/components/GuestInputForm.tsx v2.0.1
import React, { useState } from 'react';
import { Input } from './ui/Input'; 
// Import GuestPayload type from reservationService for reuse
import { GuestPayload } from '../api/reservationService';

interface GuestInputFormProps {
  index: number;
  // Use Partial<GuestPayload> directly
  onChange: (index: number, data: Partial<GuestPayload>) => void; 
  // Can display room information here (e.g., Guest 1 of Room 3).
}

export const GuestInputForm: React.FC<GuestInputFormProps> = ({ index, onChange }) => {
  // Use GuestPayload directly
  const [guestData, setGuestData] = useState<GuestPayload>({
    first_name: '', last_name: '', is_foreign: false,
    national_id: '', passport_number: '', phone_number: '', nationality: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    // Explicitly typed newValue
    const newValue: string | boolean = type === 'checkbox' ? checked : value;

    if (name === 'is_foreign' && typeof newValue === 'boolean') {
        // Conditional logic: if foreign, activate nationality/passport, clear national_id
        setGuestData(prev => ({ 
            ...prev, 
            is_foreign: newValue,
            national_id: newValue ? '' : prev.national_id, // Clear national_id
            passport_number: newValue ? prev.passport_number : '', // Clear passport
        }));
        
        // Pass the updated data structure to the parent component
        onChange(index, { 
            ...guestData, 
            is_foreign: newValue,
            national_id: newValue ? '' : guestData.national_id,
            passport_number: newValue ? guestData.passport_number : '',
        });
        
    } else {
        setGuestData(prev => ({ ...prev, [name]: newValue as string })); // Cast to string since it's typically value for text inputs
        onChange(index, { ...guestData, [name]: newValue });
    }
  };

  const isForeign = guestData.is_foreign;

  return (
    <div className="p-4 border border-gray-200 rounded-lg bg-gray-50 mb-4" dir="rtl">
      <h4 className="text-lg font-bold mb-4 text-primary-brand">اطلاعات میهمان {index + 1}</h4>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input label="نام" name="first_name" required onChange={handleChange} value={guestData.first_name}/>
        <Input label="نام خانوادگی" name="last_name" required onChange={handleChange} value={guestData.last_name}/>
        <Input label="شماره تماس" name="phone_number" required onChange={handleChange} value={guestData.phone_number}/>
        
        {/* Foreign checkbox */}
        <div className="flex items-center mt-6">
            <input 
                type="checkbox" 
                name="is_foreign" 
                checked={isForeign} 
                onChange={handleChange} 
                className="w-4 h-4 text-primary-brand border-gray-300 rounded focus:ring-primary-brand ml-2" // ml-2 for RTL
            />
            <label className="text-sm font-medium">میهمان خارجی است</label>
        </div>

        {/* National ID field (Iranians only) */}
        <Input 
            label="کد ملی" 
            name="national_id" 
            required={!isForeign} 
            disabled={isForeign}
            onChange={handleChange} 
            value={guestData.national_id}
        />
        
        {/* Passport Number field (Foreigners only) */}
        <Input 
            label="شماره پاسپورت" 
            name="passport_number" 
            required={isForeign} 
            disabled={!isForeign}
            onChange={handleChange} 
            value={guestData.passport_number}
        />
        
        {/* Nationality field (Foreigners only) */}
        {isForeign && (
            <Input 
                label="تابعیت" 
                name="nationality" 
                required={isForeign} 
                onChange={handleChange} 
                value={guestData.nationality}
            />
        )}
      </div>
    </div>
  );
};
