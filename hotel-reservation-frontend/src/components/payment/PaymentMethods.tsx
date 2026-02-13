// FILE: src/components/payment/PaymentMethods.tsx
// version: 1.1.0
// FIX: Corrected prop types and wallet logic validation.

import React, { useState, useEffect } from 'react';
import { formatPrice } from '@/utils/format';
import { DetailCard } from '@/components/ui/DetailCard';
import { Button } from '@/components/ui/Button';
import { CreditCard, Wallet as WalletIcon, Smartphone } from 'lucide-react';
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
    
    // Check wallet balance
    const canPayWithWallet = isAuthenticated && wallet && (wallet.balance >= totalPrice);

    const methods = [
        // 1. Wallet Option (Only for authenticated users, explicitly shown)
        ...(isAuthenticated && !isAgencyUser ? [{ 
            value: 'wallet' as PaymentMethod, 
            label: `پرداخت از کیف پول`,
            subLabel: `موجودی: ${formatPrice(wallet?.balance || 0)} ریال`,
            disabled: !canPayWithWallet,
            icon: <WalletIcon className="w-5 h-5 ml-2 text-purple-600" />
        }] : []),
        
        // 2. Online Payment
        { 
            value: 'online' as PaymentMethod, 
            label: 'پرداخت آنلاین (درگاه بانکی)', 
            subLabel: 'اتصال به شاپرک',
            disabled: true, // As per instruction
            icon: <CreditCard className="w-5 h-5 ml-2 text-green-600" /> 
        },
        
        // 3. Offline / Card to Card
        { 
            value: 'card_to_card' as PaymentMethod, 
            label: 'کارت به کارت / حواله بانکی',
            subLabel: 'آپلود فیش واریزی',
            disabled: false,
            icon: <Smartphone className="w-5 h-5 ml-2 text-blue-600" /> 
        },

        // 4. Agency Credit (Only for agency users)
        ...(isAgencyUser ? [{ 
            value: 'credit' as PaymentMethod, 
            label: 'پرداخت اعتباری (مخصوص آژانس)',
            subLabel: 'کسر از اعتبار حساب همکاری',
            disabled: false,
            icon: <WalletIcon className="w-5 h-5 ml-2 text-orange-600" />
        }] : []),
    ];

    // Select default method on load
    useEffect(() => {
        if (canPayWithWallet) {
             setSelectedMethod('wallet');
        } else {
             setSelectedMethod('card_to_card');
        }
    }, [canPayWithWallet]);

    return (
        <DetailCard title="انتخاب روش پرداخت" icon={CreditCard}>
            {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg border border-red-100 text-sm animate-pulse">
                    {error}
                </div>
            )}
            
            <div className="space-y-3">
                {methods.map(method => (
                    <label 
                        key={method.value} 
                        className={`
                            relative flex items-center justify-between p-4 rounded-xl cursor-pointer border transition-all duration-200
                            ${selectedMethod === method.value 
                                ? 'bg-indigo-50 border-indigo-500 shadow-md ring-1 ring-indigo-500' 
                                : (method.disabled ? 'bg-gray-50 border-gray-200 opacity-60 cursor-not-allowed' : 'bg-white border-gray-200 hover:border-indigo-200 hover:shadow-sm')}
                        `}
                    >
                        <div className="flex items-center">
                            <input 
                                type="radio" 
                                name="payment" 
                                value={method.value} 
                                checked={selectedMethod === method.value} 
                                onChange={() => !method.disabled && setSelectedMethod(method.value)} 
                                className="ml-3 w-5 h-5 text-indigo-600 focus:ring-indigo-500 accent-indigo-600" 
                                disabled={method.disabled} 
                            />
                            <div>
                                <span className="font-bold text-gray-800 flex items-center text-sm md:text-base">
                                    {method.icon} {method.label}
                                </span>
                                {method.subLabel && <span className="text-xs text-gray-500 mr-9 block mt-1">{method.subLabel}</span>}
                            </div>
                        </div>

                        {/* Error Message for Disabled Wallet */}
                        {method.disabled && method.value === 'wallet' && (
                            <span className="text-red-600 text-xs font-bold bg-red-50 px-2 py-1 rounded border border-red-100">
                                موجودی کافی نیست
                            </span>
                        )}
                        {/* Badge for Offline */}
                        {method.disabled && method.value === 'online' && (
                            <span className="text-gray-500 text-xs bg-gray-200 px-2 py-1 rounded">
                                غیرفعال
                            </span>
                        )}
                    </label>
                ))}
            </div>
            
            <Button 
                onClick={() => onPay(selectedMethod)} 
                className="mt-8 w-full h-12 text-lg shadow-lg shadow-blue-500/20" 
                variant="primary"
                disabled={loading}
            >
                {loading ? 'در حال پردازش...' : 'تایید نهایی و پرداخت'}
            </Button>
        </DetailCard>
    );
};
