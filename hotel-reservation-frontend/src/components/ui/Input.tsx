// src/components/ui/Input.tsx
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export const Input: React.FC<InputProps> = ({ label, className = '', ...props }) => (
  <div>
    <label htmlFor={props.id || props.name} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <input
      id={props.id}
      // FIX: Increased padding, height, and added hover effect
      className={`w-full h-12 p-4 border border-gray-300 rounded-md shadow-sm 
                 focus:outline-none focus:ring-primary-brand focus:border-primary-brand
                 hover:border-blue-500 transition-all ${className}`}
      dir="rtl"
      {...props}
    />
  </div>
);
