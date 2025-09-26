// src/components/ui/JalaliDatePicker.tsx - (Final Stable Version)

import React, { useState } from 'react';
// تکیه به کتابخانه پایدار moment-jalaali برای تمام منطق تاریخ
const momentJalaali: any = require('moment-jalaali'); 
import { Input } from './Input'; 

interface JalaliDatePickerProps {
  label: string;
  name: string;
  onDateChange: (name: string, dateString: string) => void;
  required?: boolean;
}

const API_DATE_FORMAT = 'jYYYY-jMM-jDD'; 
const DISPLAY_DATE_FORMAT = 'jYYYY/jMM/jDD';

export const JalaliDatePicker: React.FC<JalaliDatePickerProps> = ({ 
  label, 
  name, 
  onDateChange, 
  required 
}) => {
  const [inputValue, setInputValue] = useState('');
  const [isValid, setIsValid] = useState(true);

  // شبیه‌سازی منطق برای اعتبارسنجی فرمت ورودی کاربر
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);

    // بررسی اینکه آیا رشته ورودی طول مناسب برای فرمت دارد
    if (value.length === DISPLAY_DATE_FORMAT.length) {
      const jMomentDate = momentJalaali(value, DISPLAY_DATE_FORMAT);
      
      if (jMomentDate.isValid()) {
          setIsValid(true);
          // تبدیل به فرمت API برای ارسال به والد (SearchForm/Checkout)
          onDateChange(name, jMomentDate.format(API_DATE_FORMAT));
      } else {
          setIsValid(false);
          onDateChange(name, ''); // تاریخ نامعتبر است
      }
    } else {
         setIsValid(true); // اگر هنوز کامل نیست، خطا نده
         onDateChange(name, '');
    }
  };

  return (
    <div className="relative mb-4" dir="rtl">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      
      {/* استفاده از Input معمولی به عنوان جایگزین Picker برای پایداری */}
      <input
        type="text"
        name={name}
        value={inputValue}
        required={required}
        onChange={handleInputChange}
        className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-brand focus:border-primary-brand ${
             !isValid && 'border-red-500 focus:border-red-500 focus:ring-red-500' // استایل خطا
        }`}
        placeholder={DISPLAY_DATE_FORMAT}
      />
      
      {!isValid && (
        <p className="text-xs text-red-500 mt-1">
            تاریخ وارد شده نامعتبر است. لطفاً از قالب {DISPLAY_DATE_FORMAT} استفاده کنید.
        </p>
      )}
    </div>
  );
};