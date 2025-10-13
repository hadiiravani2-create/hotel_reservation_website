// src/components/ui/Input.tsx
// version: 0.0.2
// Feature: Added 'error' and 'icon' props for use with react-hook-form and visual enhancement.
// FIX: Applied type assertion during React.cloneElement to allow setting 'size' prop on generic React.ReactElement (icons).

import React from 'react';
import { FaExclamationCircle } from 'react-icons/fa'; // Used for generic error icon

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string | null; // Prop to accept error message
  icon?: React.ReactElement; // Prop to accept an icon element
}

export const Input: React.FC<InputProps> = ({ 
  label, 
  error,
  icon,
  className = '', 
  ...props 
}) => {
  const isError = !!error;
  
  // Conditionally set input classes based on error status and icon presence
  const inputClasses = `
    w-full h-12 p-4 
    border ${isError ? 'border-red-500' : 'border-gray-300'} 
    rounded-md shadow-sm 
    focus:outline-none focus:ring-2 
    ${isError 
        ? 'focus:ring-red-500 focus:border-red-500' 
        : 'focus:ring-blue-500 focus:border-blue-500 hover:border-blue-500'
    }
    transition-all 
    ${icon ? 'pe-10' : ''} 
    ${className}
  `;

  return (
    <div className="w-full">
      <label htmlFor={props.id || props.name} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <div className="relative">
        {/* Input Field */}
        <input
          id={props.id}
          className={inputClasses}
          dir="rtl" // Default direction
          {...props}
        />
        
        {/* Icon Display */}
        {icon && (
          <div className={`absolute top-0 bottom-0 left-3 flex items-center pointer-events-none ${isError ? 'text-red-500' : 'text-gray-400'}`}>
            {/* FIX: Use type assertion { size: number } to resolve the 'size' property type error. */}
            {React.cloneElement(icon, { size: 16 } as { size: number })}
          </div>
        )}
      </div>

      {/* Error Message */}
      {isError && (
        <p className="mt-1 text-xs text-red-600 flex items-center">
            <FaExclamationCircle className="ms-1" size={12} />
            {error}
        </p>
      )}
    </div>
  );
};
