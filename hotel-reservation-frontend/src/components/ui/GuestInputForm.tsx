// src/components/GuestInputForm.tsx
import React, { useState } from 'react';
import { Input } from './ui/Input'; 

interface GuestData {
  first_name: string;
  last_name: string;
  is_foreign: boolean;
  national_id: string;
  passport_number: string;
  phone_number: string;
  nationality: string;
}

interface GuestInputFormProps {
  index: number;
  onChange: (index: number, data: Partial<GuestData>) => void;
  // می‌توان اطلاعات اتاق (مثلاً: میهمان ۱ از اتاق ۳) را اینجا نمایش داد.
}

export const GuestInputForm: React.FC<GuestInputFormProps> = ({ index, onChange }) => {
  const [guestData, setGuestData] = useState<GuestData>({
    first_name: '', last_name: '', is_foreign: false,
    national_id: '', passport_number: '', phone_number: '', nationality: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    let newValue: any = type === 'checkbox' ? checked : value;

    if (name === 'is_foreign') {
        // منطق شرطی: اگر خارجی شد، ملیت و پاسپورت فعال، کد ملی پاک شود
        newValue = checked;
        setGuestData(prev => ({ 
            ...prev, 
            is_foreign: newValue,
            national_id: newValue ? '' : prev.national_id, // پاک کردن کد ملی
            passport_number: newValue ? prev.passport_number : '', // پاک کردن پاسپورت
        }));
    } else {
        setGuestData(prev => ({ ...prev, [name]: newValue }));
    }
    
    // ارسال داده‌ها به کامپوننت والد (checkout.tsx)
    onChange(index, { ...guestData, [name]: newValue });
  };

  const isForeign = guestData.is_foreign;

  return (
    <div className="p-4 border border-gray-200 rounded-lg bg-gray-50 mb-4" dir="rtl">
      <h4 className="text-lg font-bold mb-4 text-primary-brand">اطلاعات میهمان {index + 1}</h4>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input label="نام" name="first_name" required onChange={handleChange} value={guestData.first_name}/>
        <Input label="نام خانوادگی" name="last_name" required onChange={handleChange} value={guestData.last_name}/>
        <Input label="شماره تماس" name="phone_number" required onChange={handleChange} value={guestData.phone_number}/>
        
        {/* چک باکس خارجی بودن */}
        <div className="flex items-center mt-6">
            <input 
                type="checkbox" 
                name="is_foreign" 
                checked={isForeign} 
                onChange={handleChange} 
                className="w-4 h-4 text-primary-brand border-gray-300 rounded focus:ring-primary-brand ml-2" // ml-2 برای RTL
            />
            <label className="text-sm font-medium">میهمان خارجی است</label>
        </div>

        {/* فیلد کد ملی (فقط برای ایرانی) */}
        <Input 
            label="کد ملی" 
            name="national_id" 
            required={!isForeign} 
            disabled={isForeign}
            onChange={handleChange} 
            value={guestData.national_id}
        />
        
        {/* فیلد شماره پاسپورت (فقط برای خارجی) */}
        <Input 
            label="شماره پاسپورت" 
            name="passport_number" 
            required={isForeign} 
            disabled={!isForeign}
            onChange={handleChange} 
            value={guestData.passport_number}
        />
        
        {/* فیلد تابعیت (فقط برای خارجی) */}
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