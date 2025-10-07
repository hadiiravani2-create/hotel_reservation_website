// src/components/ui/JalaliDatePicker.tsx v1.0.6
// Final Solution: Switched to the dedicated `react-multi-date-picker` library for robust and native Jalali calendar support.
import React from 'react';
import DatePicker, { DateObject } from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";

interface JalaliDatePickerProps {
  label: string;
  name: string;
  onDateChange: (name: string, dateString: string) => void;
  required?: boolean;
}

export const JalaliDatePicker: React.FC<JalaliDatePickerProps> = ({ label, name, onDateChange, required }) => {

  const handleDateChange = (date: DateObject | null) => {
    if (date) {
      // تاریخ برای API باید با فرمت YYYY-MM-DD ارسال شود
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
        onChange={handleDateChange}
        calendar={persian}
        locale={persian_fa}
        calendarPosition="bottom-right"
        inputClass="w-full h-10 px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-center focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-brand"
        placeholder="تاریخ را انتخاب کنید"
      />
    </div>
  );
};
