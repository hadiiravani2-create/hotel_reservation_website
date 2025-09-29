// src/components/ui/Input.tsx v1.0.0
import React from 'react';

// Define the interface for Input component props
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string; // The label is required
}

/**
 * A reusable input component with a label and Tailwind styles.
 * It uses logical properties (ms-*, me-*) for RTL compatibility.
 * * @param {InputProps} props - The component properties.
 * @returns {JSX.Element} The Input component.
 */
export const Input: React.FC<InputProps> = ({ label, className = '', ...props }) => (
  <div className="mb-4">
    {/* Use props.id or props.name to link the label/input correctly */}
    <label htmlFor={props.id || props.name} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <input
      id={props.id}
      className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-brand focus:border-primary-brand ${className}`}
      dir="rtl" // Set direction for input box itself
      {...props}
    />
  </div>
);
