// src/components/ui/JalaliDatePicker.tsx

import React, { useState } from 'react';
// فرض بر این است که این کتابخانه ها نصب شده‌اند (گام ۱.۱)
// ما از یک نام مستعار ساده به جای import مستقیم استفاده می‌کنیم
const DatePicker: any = require('react-day-picker-jalali').default; 
const jmoment: any = require('jmoment'); // برای مدیریت و فرمت‌دهی تاریخ‌های شمسی
import { Input } from './Input'; // استفاده از کامپوننت ورودی پایه

interface JalaliDatePickerProps {
  label: string;
  name: string;
  onDateChange: (name: string, dateString: string) => void;
  required?: boolean;
}

// فرمت تاریخ خروجی مورد نیاز بک‌اند جنگو (مثلاً 1404-07-05)
const API_DATE_FORMAT = 'jYYYY-jMM-jDD'; 
// فرمت نمایش برای کاربر (مثلاً 1404/07/05)
const DISPLAY_DATE_FORMAT = 'jYYYY/jMM/jDD';

export const JalaliDatePicker: React.FC<JalaliDatePickerProps> = ({ 
  label, 
  name, 
  onDateChange, 
  required 
}) => {
  // تاریخ به صورت Date object ذخیره می‌شود
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  const handleDayClick = (day: Date, modifiers: any) => {
    // اگر روز انتخاب شده غیرفعال بود، کاری انجام نده
    if (modifiers.disabled) {
        return;
    }
    setSelectedDate(day);
    setIsPickerOpen(false);

    // تبدیل تاریخ میلادی (Date Object) به شمسی و فرمت استاندارد API
    const jMomentDate = jmoment(day).format(API_DATE_FORMAT);
    onDateChange(name, jMomentDate);
  };
  
  // متن نمایش در ورودی
  const displayValue = selectedDate 
    ? jmoment(selectedDate).format(DISPLAY_DATE_FORMAT) 
    : '';

  return (
    <div className="relative mb-4" dir="rtl">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      
      {/* فیلد ورودی که به عنوان دکمه باز شدن تقویم عمل می‌کند */}
      <input
        type="text"
        name={name}
        value={displayValue}
        readOnly
        required={required}
        onClick={() => setIsPickerOpen(!isPickerOpen)}
        // استفاده از استایل های Input پایه برای حفظ ظاهر یکپارچه
        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white cursor-pointer focus:outline-none focus:ring-primary-brand focus:border-primary-brand"
        placeholder={label}
      />
      
      {/* پاپ‌آپ تقویم */}
      {isPickerOpen && (
        <div className="absolute z-50 top-full mt-2 left-0 right-0 max-w-xs mx-auto shadow-2xl rounded-lg bg-white p-4">
          <DatePicker 
            selectedDays={selectedDate}
            onDayClick={handleDayClick}
            // اعمال کلاس برای استایل دهی RTL/ظاهری پاپ‌آپ
            className="jalali-datepicker-custom" 
            dir="rtl"
            // می‌توان روزهای قبل از امروز را غیرفعال کرد
            // disabledDays={{ before: new Date() }}
          />
        </div>
      )}
    </div>
  );
};