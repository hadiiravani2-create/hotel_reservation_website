// src/components/payment/PaymentMethods.tsx
// version: 1.0.0
import React, { useState, useEffect } from 'react';
import { formatPrice } from '@/utils/format';
import { DetailCard } from '@/components/ui/DetailCard';
import { Button } from '@/components/ui/Button';
import { CreditCard, Wallet as WalletIcon } from 'lucide-react';
import { Wallet as WalletData } from '@/types/hotel';

export type PaymentMethod = 'online' | 'credit' | 'card_to_card' | 'wallet';

interface Props {
    wallet: WalletData | undefined;
    totalPrice: number;
    isAuthenticated: boolean;
    isAgencyUser: boolean;
    loading: boolean;
    error: string;
    onPay: (method: PaymentMethod) => void;
}

export const PaymentMethods: React.FC<Props> = ({ 
    wallet, totalPrice, isAuthenticated, isAgencyUser, loading, error, onPay 
}) => {
    const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('card_to_card');
    const canPayWithWallet = isAuthenticated && wallet && wallet.balance >= totalPrice;

    const methods: Array<{ value: PaymentMethod, label: string, disabled?: boolean, icon?: React.ReactNode }> = [
        ...(isAuthenticated && !isAgencyUser ? [{ 
            value: 'wallet' as PaymentMethod, 
            label: `پرداخت از کیف پول (موجودی: ${formatPrice(wallet?.balance || 0)} تومان)`,
            disabled: !canPayWithWallet,
            icon: <WalletIcon size={20} className="ml-2" />
        }] : []),
        { value: 'online', label: 'پرداخت آنلاین (درگاه بانکی)', disabled: true }, // فعلا غیرفعال طبق کد قبلی
        { value: 'card_to_card', label: 'حواله بانکی / پرداخت آفلاین' },
        ...(isAgencyUser ? [{ value: 'credit' as PaymentMethod, label: 'پرداخت اعتباری (مخصوص آژانس)' }] : []),
    ];

    useEffect(() => {
        const defaultMethod = methods.find(m => !m.disabled)?.value || 'card_to_card';
        setSelectedMethod(defaultMethod);
    }, [wallet, totalPrice]); // Re-evaluate if wallet or price changes

    return (
        <DetailCard title="انتخاب روش پرداخت" icon={CreditCard}>
            {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">{error}</div>}
            
            <div className="space-y-4">
                {methods.map(method => (
                    <label key={method.value} className={`flex items-center p-4 rounded-lg cursor-pointer transition-all ${selectedMethod === method.value ? 'bg-indigo-50 ring-2 ring-indigo-500' : (method.disabled ? 'bg-gray-200 opacity-70 cursor-not-allowed' : 'bg-gray-50 hover:bg-gray-100')}`}>
                        <input 
                            type="radio" 
                            name="payment" 
                            value={method.value} 
                            checked={selectedMethod === method.value} 
                            onChange={() => setSelectedMethod(method.value)} 
                            className="ml-3 w-5 h-5 text-indigo-600 focus:ring-indigo-500" 
                            disabled={method.disabled} 
                        />
                        <span className="text-lg font-medium flex items-center">
                            {method.icon} {method.label}
                        </span>
                        {method.disabled && method.value === 'wallet' && <span className="mr-auto text-red-600 text-sm font-semibold">(موجودی ناکافی)</span>}
                    </label>
                ))}
            </div>
            
            <Button onClick={() => onPay(selectedMethod)} className="mt-6 w-full py-3 text-xl" disabled={loading}>
                {loading ? 'در حال پردازش...' : `پرداخت نهایی`}
            </Button>
        </DetailCard>
    );
};
