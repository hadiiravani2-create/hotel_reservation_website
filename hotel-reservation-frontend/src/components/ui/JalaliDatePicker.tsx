

// src/components/ui/JalaliDatePicker.tsx
import React from 'react';
import DatePicker, { DateObject } from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";

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
        calendar={persian}
        locale={persian_fa}
        calendarPosition="bottom-right"
        minDate={new DateObject()}
        // FIX: Updated inputClass to match the new Input style
        inputClass="w-full h-12 p-4 bg-white border border-gray-300 rounded-md shadow-sm text-center 
                    focus:outline-none focus:ring-primary-brand focus:border-primary-brand 
                    hover:border-blue-500 transition-all"
        placeholder="تاریخ را انتخاب کنید"
      />
    </div>
  );
};
