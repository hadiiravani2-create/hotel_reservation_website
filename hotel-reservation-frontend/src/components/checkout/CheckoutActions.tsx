// FILE: src/components/checkout/CheckoutActions.tsx
// version: 6.2.2
// FIX: Removed 'isLoading' prop from Button component to resolve TypeScript error.
//      Loading state is handled via 'disabled' prop and button children text.

import React from 'react';
import { Button } from '../ui/Button'; 
import { AlertCircle, FileText, Lock } from 'lucide-react';

interface CheckoutActionsProps {
  rulesAccepted: boolean;
  setRulesAccepted: (val: boolean) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  error?: string;
}

const CheckoutActions: React.FC<CheckoutActionsProps> = ({
  rulesAccepted,
  setRulesAccepted,
  onSubmit,
  isLoading,
  error
}) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 mt-6">
      
      {/* بخش قوانین و مقررات */}
      <div className="mb-6">
        <label className="flex items-start gap-3 cursor-pointer group">
          <div className="relative flex items-center">
            <input
              type="checkbox"
              checked={rulesAccepted}
              onChange={(e) => setRulesAccepted(e.target.checked)}
              className="w-5 h-5 border-2 border-gray-300 rounded text-primary-brand focus:ring-primary-brand/30 transition-colors"
            />
          </div>
          <div className="text-sm text-gray-600 leading-6 select-none">
            اینجانب ضمن مطالعه دقیق، کلیه{' '}
            <a href="/booking-rules" target="_blank" className="text-blue-600 hover:underline font-bold inline-flex items-center gap-1">
              <FileText className="w-3 h-3" />
              قوانین و مقررات رزرو
            </a>{' '}
            و شرایط کنسلی هتل را پذیرفته و تایید می‌نمایم.
          </div>
        </label>
      </div>

      {/* نمایش خطای عمومی (اگر وجود داشته باشد) */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3 animate-shake">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700 font-medium">{error}</p>
        </div>
      )}

      {/* دکمه پرداخت */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-t pt-6">
        <div className="flex items-center gap-2 text-gray-500 text-xs">
          <Lock className="w-4 h-4" />
          <span>پرداخت امن از طریق درگاه‌های بانکی عضو شتاب</span>
        </div>
        
        <div className="w-full md:w-auto">
          <Button
            type="submit"
            onClick={onSubmit}
            // isLoading={isLoading} <--- REMOVED: Caused TypeError
            disabled={!rulesAccepted || isLoading}
            className={`w-full md:w-64 h-12 text-lg shadow-lg shadow-blue-500/30 ${!rulesAccepted ? 'opacity-50 cursor-not-allowed' : ''}`}
            variant="primary"
          >
            {isLoading ? 'در حال پردازش...' : 'تایید نهایی و پرداخت'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutActions;
