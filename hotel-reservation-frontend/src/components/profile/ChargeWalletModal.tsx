// src/components/profile/ChargeWalletModal.tsx
// version: 1.0.2
// FIX: Resolved 400 error by adding a time input and sending a full datetime string.
// FEATURE: Disabled future dates in the date picker.

import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { DateObject } from "react-multi-date-picker"; // Import DateObject
import { initiateWalletDeposit } from '@/api/coreService';
import { fetchOfflineBanks, submitPaymentConfirmation, GenericPaymentConfirmationPayload } from '@/api/reservationService';
import { OfflineBank } from '@/types/hotel';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { JalaliDatePicker } from '@/components/ui/JalaliDatePicker';

interface ChargeWalletModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const ChargeWalletModal: React.FC<ChargeWalletModalProps> = ({ onClose, onSuccess }) => {
  const [step, setStep] = useState(1);
  const [amount, setAmount] = useState('');
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [confirmationData, setConfirmationData] = useState({
    offline_bank: '',
    tracking_code: '',
    payment_date: '',
    payment_time: '12:00', // Add state for time
  });

  const initiateMutation = useMutation({
    mutationFn: (depositAmount: number) => initiateWalletDeposit(depositAmount),
    onSuccess: (data) => {
      setTransactionId(data.transaction_id);
      setStep(2);
    },
    onError: (error) => {
      alert(`خطا در ثبت درخواست شارژ: ${error.message}`);
    },
  });

  const { data: offlineBanks, isLoading: isLoadingBanks } = useQuery<OfflineBank[]>({
    // Use a specific key for general banks (wallet)
    queryKey: ['offlineBanks', 'general'], 
    // Calling fetchOfflineBanks() without args is CORRECT for general accounts
    // FIX: Wrap the function call in an arrow function
    queryFn: () => fetchOfflineBanks(),
    enabled: step === 2,
  });

  const confirmMutation = useMutation({
    mutationFn: (payload: GenericPaymentConfirmationPayload) => submitPaymentConfirmation(payload),
    onSuccess: () => {
      alert('اطلاعات پرداخت شما با موفقیت ثبت شد و پس از تایید توسط مدیر، به حساب شما اضافه خواهد شد.');
      onSuccess();
      onClose();
    },
    onError: (error) => {
      alert(`خطا در ثبت اطلاعات: ${error.message}`);
    },
  });

  const handleInitiate = (e: React.FormEvent) => {
    e.preventDefault();
    const numericAmount = parseInt(amount, 10);
    if (isNaN(numericAmount) || numericAmount < 1000) {
      alert('مبلغ شارژ باید حداقل ۱,۰۰۰ تومان باشد.');
      return;
    }
    initiateMutation.mutate(numericAmount);
  };

  const handleConfirmChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setConfirmationData({ ...confirmationData, [e.target.name]: e.target.value });
  };

  const handleDateChange = (name: string, dateString: string) => {
    setConfirmationData(prev => ({ ...prev, [name]: dateString }));
  };
  
  const handleConfirmSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!transactionId || !confirmationData.offline_bank || !confirmationData.tracking_code || !confirmationData.payment_date || !confirmationData.payment_time) {
      alert('لطفا تمام فیلدها را پر کنید.');
      return;
    }
    
    // Combine date and time into a single string for the backend
    const fullPaymentDateTime = `${confirmationData.payment_date} ${confirmationData.payment_time}:00`;

    const payload: GenericPaymentConfirmationPayload = {
        content_type: 'wallet_transaction',
        object_id: transactionId,
        offline_bank: parseInt(confirmationData.offline_bank, 10),
        tracking_code: confirmationData.tracking_code,
        payment_date: fullPaymentDateTime,
        payment_amount: parseInt(amount, 10),
    };
    confirmMutation.mutate(payload);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50" dir="rtl">
      <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-lg">
        <h2 className="text-2xl font-bold mb-6 text-center">شارژ کیف پول</h2>

        {step === 1 && (
          <form onSubmit={handleInitiate}>
            <Input
              label="مبلغ شارژ (تومان)"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="حداقل ۱,۰۰۰ تومان"
              required
              min="1000"
            />
            <div className="flex justify-end gap-4 mt-8">
              <Button type="button" variant="secondary" onClick={onClose}>انصراف</Button>
              <Button type="submit" variant="primary" disabled={initiateMutation.isPending}>
                {initiateMutation.isPending ? 'در حال ثبت...' : 'ادامه'}
              </Button>
            </div>
          </form>
        )}
        
        {step === 2 && (
          <form onSubmit={handleConfirmSubmit} className="space-y-4">
            <div className="mb-4 p-4 bg-yellow-50 border-r-4 border-yellow-400">
              <p className="text-sm text-yellow-700 mt-1">
                  لطفا مبلغ <strong>{parseInt(amount).toLocaleString('fa-IR')} تومان</strong> را به یکی از حساب‌های زیر واریز کرده و سپس اطلاعات فیش را در فرم زیر ثبت کنید.
              </p>
            </div>

            {isLoadingBanks ? <p>در حال بارگذاری...</p> : (
                <div>
                    <label className="block text-sm font-medium mb-1">انتخاب حساب مقصد</label>
                    <select name="offline_bank" value={confirmationData.offline_bank} onChange={handleConfirmChange} required className="w-full h-12 p-3 border border-gray-300 rounded-md">
                        <option value="" disabled>یک حساب را انتخاب کنید</option>
                        {offlineBanks?.map(bank => (
                            <option key={bank.id} value={bank.id}>
                                {bank.bank_name} - {bank.account_holder} ({bank.card_number})
                            </option>
                        ))}
                    </select>
                </div>
            )}

            <Input label="شماره پیگیری فیش" name="tracking_code" value={confirmationData.tracking_code} onChange={handleConfirmChange} required />
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <JalaliDatePicker 
                label="تاریخ پرداخت"
                name="payment_date"
                onDateChange={handleDateChange}
                required
                maxDate={new DateObject()} // FEATURE: Disable future dates
              />
              <Input 
                label="ساعت پرداخت"
                name="payment_time"
                type="time"
                value={confirmationData.payment_time}
                onChange={handleConfirmChange}
                required
              />
            </div>
            
            <div className="flex justify-end gap-4 pt-4">
              <Button type="button" variant="secondary" onClick={() => setStep(1)}>بازگشت</Button>
              <Button type="submit" variant="primary" disabled={confirmMutation.isPending}>
                {confirmMutation.isPending ? 'در حال ثبت...' : 'ثبت و ارسال برای تایید'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ChargeWalletModal;
