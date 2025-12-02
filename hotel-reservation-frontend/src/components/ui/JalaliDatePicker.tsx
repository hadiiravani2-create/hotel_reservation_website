// src/components/ui/JalaliDatePicker.tsx
// version: 1.2.1
// FIX: Added 'null' to 'value' type definition to support nullable state from parent.

import React from 'react';
import DatePicker, { DateObject } from "react-multi-date-picker";
import { DATE_CONFIG } from '@/config/date';

interface JalaliDatePickerProps {
  label: string;
  name: string;
  onChange: (date: DateObject | null) => void;
  required?: boolean;
  value?: string | DateObject | Date | null; // FIX: Added null support
  minDate?: DateObject | Date | string | number;
  maxDate?: DateObject | Date | string | number;
}

export const JalaliDatePicker: React.FC<JalaliDatePickerProps> = ({ 
  label, name, onChange, required, value, minDate, maxDate 
}) => {

  const handleDateChange = (date: DateObject | null) => {
      onChange(date);
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-medium mb-1 text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <DatePicker
        value={value || ""} // Handle potential null explicitly for the library
        onChange={handleDateChange}
        calendar={DATE_CONFIG.calendar}
        locale={DATE_CONFIG.locale}
        calendarPosition="bottom-right"
        minDate={minDate}
        maxDate={maxDate}
        containerClassName="w-full"
        inputClass="w-full h-12 p-4 bg-white border border-gray-300 rounded-md shadow-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
      />
    </div>
  );
};
