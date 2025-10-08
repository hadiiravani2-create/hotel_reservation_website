// src/components/ui/JalaliDatePicker.tsx
// version: 1.0.7
// This component provides a Jalali (Persian) date picker with support for an initial value.
import React from 'react';
import DatePicker, { DateObject } from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";

interface JalaliDatePickerProps {
  label: string;
  name: string;
  onDateChange: (name: string, dateString: string) => void;
  required?: boolean;
  initialValue?: string; // Add optional initialValue prop
}

export const JalaliDatePicker: React.FC<JalaliDatePickerProps> = ({ label, name, onDateChange, required, initialValue }) => {

  const handleDateChange = (date: DateObject | null) => {
    if (date) {
      // Format date as YYYY-MM-DD for API consistency
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
        value={initialValue} // Use the initialValue to set the component's value
        onChange={handleDateChange}
        calendar={persian}
        locale={persian_fa}
        calendarPosition="bottom-right"
        inputClass="w-full h-10 px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-center focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-brand"
        placeholder="تاریخ را انتخاب کنید"
      />
    </div>
  );
};;
