// src/components/payment/BankCard.tsx
// version: 1.1.0
// UI FIX: Styled IBAN (Shaba) exactly like Card Number with 4-digit grouping for better readability.

import React from 'react';
import { OfflineBank } from '@/types/hotel';
import { CreditCard, Copy, Check } from 'lucide-react';

interface Props {
    bank: OfflineBank;
    isSelected: boolean;
    onSelect: () => void;
}

export const BankCard: React.FC<Props> = ({ bank, isSelected, onSelect }) => {
    
    const copyToClipboard = (text: string, label: string) => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        alert(`${label} کپی شد!`); 
    };

    // Helper to format text in 4-character chunks (works for both Card and IBAN)
    const formatNumber = (str: string) => {
        if (!str) return '';
        return str.replace(/(.{4})/g, '$1 ').trim();
    };

    return (
        <div 
            onClick={onSelect}
            className={`relative p-5 rounded-xl border-2 cursor-pointer transition-all duration-200 group
                ${isSelected 
                    ? 'border-indigo-600 bg-indigo-50 shadow-md' 
                    : 'border-gray-200 bg-white hover:border-indigo-300 hover:shadow-sm'}`}
        >
            {/* Checkmark Icon */}
            {isSelected && (
                <div className="absolute top-3 left-3 text-indigo-600 bg-white rounded-full p-1 shadow-sm">
                    <Check className="w-4 h-4" />
                </div>
            )}
            
            {/* Header */}
            <div className="flex items-center mb-5">
                <div className={`p-3 rounded-full shadow-sm ${isSelected ? 'bg-indigo-200 text-indigo-700' : 'bg-gray-100 text-gray-500'}`}>
                    <CreditCard className="w-6 h-6" />
                </div>
                <div className="mr-3 overflow-hidden">
                    <h3 className="font-bold text-lg text-gray-800 truncate">{bank.bank_name}</h3>
                    <p className="text-sm text-gray-500 truncate">{bank.account_holder}</p>
                </div>
            </div>

            {/* Account Details */}
            <div className="space-y-3">
                
                {/* 1. Card Number Box */}
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 flex flex-col justify-between group-hover:bg-white group-hover:border-gray-300 transition-all">
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-gray-500 text-xs font-medium">شماره کارت</span>
                        <button 
                            type="button"
                            onClick={(e) => { e.stopPropagation(); copyToClipboard(bank.card_number, 'شماره کارت'); }}
                            className="text-indigo-500 hover:text-indigo-700 p-1 text-xs flex items-center transition-colors"
                        >
                            <Copy className="w-3 h-3 ml-1" /> کپی
                        </button>
                    </div>
                    <div className="flex items-center justify-end" dir="ltr">
                        <span className="font-mono font-bold text-gray-800 text-lg tracking-wider">
                            {formatNumber(bank.card_number)}
                        </span>
                    </div>
                </div>

                {/* 2. IBAN (Shaba) Box - Now styled identically */}
                {bank.shaba_number && (
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 flex flex-col justify-between group-hover:bg-white group-hover:border-gray-300 transition-all">
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-gray-500 text-xs font-medium">شماره شبا</span>
                            <button 
                                type="button"
                                onClick={(e) => { e.stopPropagation(); copyToClipboard(bank.shaba_number!, 'شماره شبا'); }}
                                className="text-indigo-500 hover:text-indigo-700 p-1 text-xs flex items-center transition-colors"
                            >
                                <Copy className="w-3 h-3 ml-1" /> کپی
                            </button>
                        </div>
                        <div className="flex items-center justify-end" dir="ltr">
                            {/* Slightly smaller font for IBAN due to length (26 chars) */}
                            <span className="font-mono font-semibold text-gray-700 text-sm sm:text-base tracking-wide break-all text-right">
                                {formatNumber(bank.shaba_number)}
                            </span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
