// src/components/ui/JalaliDatePicker.tsx
// version: 1.0.1
// REFACTOR: Centralized date configuration by importing from src/config/date.ts.

import React from 'react';
import DatePicker, { DateObject } from "react-multi-date-picker";
import { DATE_CONFIG } from '@/config/date'; // Centralized import

interface JalaliDatePickerProps {
  label: string;
  name: string;
  onDateChange: (name: string, dateString: string) => void;
  required?: boolean;
  initialValue?: string;
}

export const JalaliDatePicker: React.FC<JalaliDatePickerProps> = ({ label, name, onDateChange, required, initialValue }) => {

  const handleDateChange = (date: DateObject | null) => {
    if (date) {
      // The format sent to the parent component is Gregorian for API compatibility.
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
        calendar={DATE_CONFIG.calendar} // Using centralized config
        locale={DATE_CONFIG.locale}     // Using centralized config
        calendarPosition="bottom-right"
        minDate={new DateObject()}
        inputClass="w-full h-12 p-4 bg-white border border-gray-300 rounded-md shadow-sm text-center 
                    focus:outline-none focus:ring-primary-brand focus:border-primary-brand 
                    hover:border-blue-500 transition-all"
        placeholder="تاریخ را انتخاب کنید"
      />
    </div>
  );
};
