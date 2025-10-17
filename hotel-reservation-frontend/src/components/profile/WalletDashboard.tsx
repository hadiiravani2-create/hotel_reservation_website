// src/components/profile/WalletDashboard.tsx
// version: 1.0.2
// FEATURE: Display transaction status with colored badges.

import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getUserWallet } from '@/api/coreService';
import { Wallet, WalletTransaction } from '@/types/hotel';
import { Button } from '@/components/ui/Button';
import { PlusCircleIcon } from '@heroicons/react/24/outline';
import ChargeWalletModal from './ChargeWalletModal';

// Map for styling transaction statuses
const statusMap: { [key: string]: { label: string; color: string } } = {
  'انجام شده': { label: 'انجام شده', color: 'text-green-700 bg-green-100' },
  'در انتظار': { label: 'در انتظار', color: 'text-yellow-600 bg-yellow-100' },
  'ناموفق': { label: 'ناموفق', color: 'text-red-700 bg-red-100' },
};

const WalletDashboard: React.FC = () => {
  const [isModalOpen, setModalOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: wallet, isLoading, isError, error } = useQuery<Wallet, Error>({
    queryKey: ['userWallet'],
    queryFn: getUserWallet,
  });

  const handleChargeSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['userWallet'] });
  };

  if (isLoading) {
    return <div>در حال بارگذاری اطلاعات کیف پول...</div>;
  }

  if (isError) {
    return <div className="text-red-600">خطا در دریافت اطلاعات: {error.message}</div>;
  }

  return (
    <>
      <div>
        <div className="flex justify-between items-center mb-6 pb-4 border-b">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">کیف پول من</h2>
            <p className="text-gray-500">موجودی و تاریخچه تراکنش‌های خود را مدیریت کنید.</p>
          </div>
          <Button variant="primary" onClick={() => setModalOpen(true)}>
            <PlusCircleIcon className="w-5 h-5 ml-2" />
            شارژ کیف پول
          </Button>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8 text-center">
          <p className="text-lg text-blue-800">موجودی فعلی شما</p>
          <p className="text-4xl font-extrabold text-blue-900 mt-2">
            {wallet?.balance.toLocaleString('fa-IR')}
            <span className="text-xl font-normal"> تومان</span>
          </p>
        </div>

        <div>
          <h3 className="text-xl font-bold text-gray-700 mb-4">۱۰ تراکنش آخر</h3>
          <div className="space-y-3">
            {wallet?.recent_transactions && wallet.recent_transactions.length > 0 ? (
              wallet.recent_transactions.map((tx: WalletTransaction) => {
                const statusStyle = statusMap[tx.status] || { label: tx.status, color: 'text-gray-500 bg-gray-100' };
                return (
                  <div key={tx.id} className="flex justify-between items-center bg-gray-50 p-3 rounded-md border">
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="font-semibold text-gray-800">{tx.transaction_type}</p>
                        <p className="text-xs text-gray-500">{new Date(tx.created_at).toLocaleDateString('fa-IR', {
                            year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
                        })}</p>
                      </div>
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${statusStyle.color}`}>
                        {statusStyle.label}
                      </span>
                    </div>
                    <p className={`font-bold text-lg ${tx.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {tx.amount > 0 ? '+' : ''}{tx.amount.toLocaleString('fa-IR')} تومان
                    </p>
                  </div>
                )
              })
            ) : (
              <p className="text-gray-500 text-center py-4">هیچ تراکنشی یافت نشد.</p>
            )}
          </div>
        </div>
      </div>

      {isModalOpen && (
        <ChargeWalletModal 
          onClose={() => setModalOpen(false)}
          onSuccess={handleChargeSuccess}
        />
      )}
    </>
  );
};

export default WalletDashboard;
