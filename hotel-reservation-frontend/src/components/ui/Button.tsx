// src/components/ui/Button.tsx
import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'link' | 'outline';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  loading?: boolean;
  children: React.ReactNode;
}

const getBaseStyles = (variant: ButtonVariant) => {
  let baseClasses = "w-full py-2 px-4 rounded-lg shadow-md text-sm font-semibold transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 transform hover:-translate-y-0.5 active:translate-y-0";

  switch (variant) {
    case 'primary':
      // FIX: Ensured the button is blue by default and slightly darker on hover
      baseClasses += " text-white bg-blue-500 hover:bg-blue-600 focus:ring-blue-500";
      break;
    case 'secondary':
      baseClasses += " text-slate-700 bg-slate-200 hover:bg-slate-300 focus:ring-slate-500";
      break;
    case 'danger':
      baseClasses += " text-white bg-red-600 hover:bg-red-700 focus:ring-red-500";
      break;
    case 'link':
      baseClasses += " text-primary-brand bg-transparent hover:underline shadow-none focus:ring-transparent focus:ring-offset-0";
      break;
    case 'outline':
      baseClasses += " text-primary-brand bg-transparent border-2 border-primary-brand hover:bg-primary-brand hover:text-white focus:ring-primary-brand";
      break;
    default:
      // FIX: Default also set to blue
      baseClasses += " text-white bg-blue-500 hover:bg-blue-600 focus:ring-blue-500";
  }
  return baseClasses;
};

export const Button: React.FC<ButtonProps> = ({ 
  variant = 'primary', 
  loading = false, 
  children, 
  disabled, 
  className = '',
  ...props 
}) => {
  const finalClassName = `${getBaseStyles(variant)} ${
    (disabled || loading) ? 'opacity-50 cursor-not-allowed' : ''
  } ${className}`;

  return (
    <button
      className={finalClassName}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 me-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            در حال بارگذاری...
        </span>
      ) : (
        children
      )}
    </button>
  );
};
