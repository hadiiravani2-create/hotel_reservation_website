import React from 'react';
import { Button } from '../ui/Button';
import { CheckCircle, Info } from 'lucide-react';

interface CheckoutActionsProps {
  rulesAccepted: boolean;
  setRulesAccepted: (val: boolean) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  error: string;
}

const CheckoutActions: React.FC<CheckoutActionsProps> = ({ 
  rulesAccepted, 
  setRulesAccepted, 
  onSubmit, 
  isLoading, 
  error 
}) => {
  return (
    <div className="mt-8 pt-6">
        <div className="flex items-start gap-3 mb-6 p-4 bg-gray-50 rounded-lg border">
            <input 
                type="checkbox" 
                id="rules"
                checked={rulesAccepted} 
                onChange={(e) => setRulesAccepted(e.target.checked)} 
                className="mt-1 w-5 h-5 text-primary-brand border-gray-300 rounded focus:ring-primary-brand cursor-pointer" 
            />
            <label htmlFor="rules" className="text-sm text-gray-700 cursor-pointer leading-6 select-none">
                <span className="font-bold text-gray-900">قوانین و مقررات</span> رزرو هتل را به دقت مطالعه کرده و می‌پذیرم.
                مسئولیت صحت اطلاعات وارد شده بر عهده کاربر می‌باشد.
            </label>
        </div>
        
        {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 border border-red-100 flex items-center gap-2">
                <Info className="w-5 h-5"/>
                {error}
            </div>
        )}

        <Button 
            onClick={onSubmit} 
            disabled={isLoading || !rulesAccepted} 
            className="w-full py-4 text-lg font-bold shadow-xl shadow-blue-500/20 flex items-center justify-center gap-2"
        >
            {isLoading ? (
                'در حال پردازش...'
            ) : (
                <>
                    <CheckCircle className="w-5 h-5" />
                    تایید نهایی و پرداخت
                </>
            )}
        </Button>
    </div>
  );
};

export default CheckoutActions;
