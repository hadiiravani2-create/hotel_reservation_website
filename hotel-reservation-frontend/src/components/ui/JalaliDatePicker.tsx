// src/components/ui/JalaliDatePicker.tsx
// version: 1.1.0
// REFACTOR: Made the component more flexible by accepting optional minDate and maxDate props.

import React from 'react';
import DatePicker, { DateObject } from "react-multi-date-picker";
import { DATE_CONFIG } from '@/config/date';

interface JalaliDatePickerProps {
  label: string;
  name: string;
  onDateChange: (name: string, dateString: string) => void;
  required?: boolean;
  initialValue?: string;
  minDate?: DateObject | Date | string | number; // Accept flexible date types
  maxDate?: DateObject | Date | string | number; // Accept flexible date types
}

export const JalaliDatePicker: React.FC<JalaliDatePickerProps> = ({ 
  label, name, onDateChange, required, initialValue, minDate, maxDate 
}) => {

  const handleDateChange = (date: DateObject | null) => {
    if (date) {
      const formattedDateForApi = date.format("YYYY-MM-DD");
      onDateChange(name, formattedDateForApi);
    } else {
      onDateChange(name, "");
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label} {required && <span className="text-red-500">*</span>}</label>
      <DatePicker
        value={initialValue}
        onChange={handleDateChange}
        calendar={DATE_CONFIG.calendar}
        locale={DATE_CONFIG.locale}
        calendarPosition="bottom-right"
        minDate={minDate} // Use the passed prop
        maxDate={maxDate} // Use the passed prop
        inputClass="w-full h-12 p-4 bg-white border border-gray-300 rounded-md shadow-sm text-center 
                    focus:outline-none focus:ring-primary-brand focus:border-primary-brand 
                    hover:border-blue-500 transition-all"
        placeholder="تاریخ را انتخاب کنید"
      />
    </div>
  );
};
