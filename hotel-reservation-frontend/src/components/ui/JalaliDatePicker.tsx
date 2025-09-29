// src/components/ui/JalaliDatePicker.tsx v2.0.3
import React, { useState } from 'react';
// Fixed: Reverted to require() to satisfy TypeScript compiler (TS2307) and disabled ESLint rules on this line (Fixes 4:22 and 4:28).
// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-require-imports
const momentJalaali: any = require('moment-jalaali'); 

interface JalaliDatePickerProps {
  label: string;
  name: string;
  onDateChange: (name: string, dateString: string) => void;
  required?: boolean;
}

const API_DATE_FORMAT = 'jYYYY-jMM-jDD'; 
const DISPLAY_DATE_FORMAT = 'jYYYY/jMM/jDD';

/**
 * A date picker component using moment-jalaali for Persian calendar support.
 * It uses a simple input field for user entry validation.
 * @param {JalaliDatePickerProps} props - The component properties.
 * @returns {JSX.Element} The date picker component.
 */
export const JalaliDatePicker: React.FC<JalaliDatePickerProps> = ({ 
  label, 
  name, 
  onDateChange, 
  required 
}) => {
  const [inputValue, setInputValue] = useState('');
  const [isValid, setIsValid] = useState(true);

  // Logic to handle user input and format validation
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);

    // Check if the input string has the appropriate length for the format
    if (value.length === DISPLAY_DATE_FORMAT.length) {
      const jMomentDate = momentJalaali(value, DISPLAY_DATE_FORMAT);
      
      if (jMomentDate.isValid()) {
          setIsValid(true);
          // Convert to API format to send to the parent (SearchForm/Checkout)
          onDateChange(name, jMomentDate.format(API_DATE_FORMAT));
      } else {
          setIsValid(false);
          onDateChange(name, ''); // Invalid date
      }
    } else {
         setIsValid(true); // Don't show an error if not complete yet
         onDateChange(name, '');
    }
  };

  return (
    <div className="relative mb-4" dir="rtl">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      
      {/* Use regular Input as a stable Picker alternative */}
      <input
        type="text"
        name={name}
        value={inputValue}
        required={required}
        onChange={handleInputChange}
        className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-primary-brand focus:border-primary-brand ${
             !isValid && 'border-red-500 focus:border-red-500 focus:ring-red-500' // Error style
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
