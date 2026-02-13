// FILE: src/pages/payment/[booking_code].tsx
// version: 1.6.0
// FIX: Resolved TypeScript error regarding unintentional comparison.
// FEAT: Enabled payment for 'pending', 'awaiting_confirmation', and 'awaiting_completion'.

import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useQuery, useMutation } from '@tanstack/react-query';
import { fetchBookingDetails, initiatePayment, payWithWallet, BookingDetail, BookingStatus } from '@/api/reservationService';
import { getUserWallet } from '@/api/coreService';
import { Wallet as WalletData } from '@/types/hotel';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuth } from '@/hooks/useAuth';
import { toPersianDigits } from '@/utils/format';

// Modular Imports
import { BookingSummary } from '@/components/payment/BookingSummary';
import { PaymentMethods, PaymentMethod } from '@/components/payment/PaymentMethods';
import { DetailCard } from '@/components/ui/DetailCard';
import { UserCheck, Globe, Phone, User } from 'lucide-react';

const GuestDetailSection: React.FC<{ guest: BookingDetail['guests'][0] }> = ({ guest }) => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-y-4 gap-x-6 text-sm">
        <div className="flex items-center text-gray-700 bg-gray-50 p-2 rounded">
            <UserCheck className="w-4 h-4 ml-2 text-green-500"/>
            <span className="font-bold ml-1">نام:</span> 
            <span>{guest.first_name || '---'} {guest.last_name || ''}</span>
        </div>
        <div className="flex items-center text-gray-700 bg-gray-50 p-2 rounded">
            <Globe className="w-4 h-4 ml-2 text-blue-500"/>
            {guest.is_foreign ? (
                <>
                    <span className="font-bold ml-1">پاسپورت:</span>
                    <span className="font-mono">{guest.passport_number || '---'}</span>
                </>
            ) : (
                <>
                    <span className="font-bold ml-1">کد ملی:</span>
                    <span className="tracking-wider">{toPersianDigits(guest.national_id || '---')}</span>
                </>
            )}
        </div>
        <div className="flex items-center text-gray-700 bg-gray-50 p-2 rounded">
            <Phone className="w-4 h-4 ml-2 text-orange-500"/>
            <span className="font-bold ml-1">تماس:</span> 
            <span dir="ltr">{toPersianDigits(guest.phone_number || '---')}</span>
        </div>
    </div>
);

const PaymentPage: React.FC = () => {
    const router = useRouter();
    const { booking_code } = router.query;
    const { user, isAuthenticated } = useAuth();
    
    const [loadingPayment, setLoadingPayment] = useState(false);
    const [paymentError, setPaymentError] = useState('');

    const code = Array.isArray(booking_code) ? booking_code[0] : booking_code;

    const { data: booking, isLoading, isError, error } = useQuery<BookingDetail, Error>({
        queryKey: ['bookingDetail', code],
        queryFn: () => fetchBookingDetails(code as string),
        enabled: !!code,
        retry: 1
    });

    const { data: wallet } = useQuery<WalletData, Error>({
        queryKey: ['userWallet'],
        queryFn: getUserWallet,
        enabled: !!isAuthenticated && !!user,
    });
    
    const paymentMutation = useMutation({
        mutationFn: (method: PaymentMethod) => {
            if (!code) throw new Error("کد رزرو یافت نشد.");
            if (method === 'wallet') return payWithWallet(code);
            if (method === 'online') return initiatePayment(code);
            return Promise.resolve();
        },
        onSuccess: (data: any, method: PaymentMethod) => {
            if (method === 'wallet') {
                router.push('/profile/bookings');
            } else if (method === 'online' && data.redirect_url) {
                window.location.href = data.redirect_url;
            }
        },
        onError: (err: any) => {
            setPaymentError(err.response?.data?.error || 'خطا در پردازش پرداخت. لطفا مجدد تلاش کنید.');
        },
        onSettled: () => {
            setLoadingPayment(false);
        }
    });

    // --- LOGIC UPDATE: Determine if payment is allowed ---
    // چک می‌کنیم آیا وضعیت فعلی جزو وضعیت‌های مجاز برای پرداخت هست یا خیر
    const isPayableStatus = (status: BookingStatus) => {
        return ['pending', 'awaiting_confirmation', 'awaiting_completion'].includes(status);
    };

    const handlePay = async (method: PaymentMethod) => {
        // Updated check using the helper function
        if (!booking || !isPayableStatus(booking.status)) {
            setPaymentError("این رزرو در وضعیت قابل پرداخت نیست.");
            return;
        }
        setLoadingPayment(true);
        setPaymentError('');

        if (method === 'card_to_card') {
            router.push(`/booking-success-transfer?booking_code=${code}`);
        } else {
            paymentMutation.mutate(method);
        }
    };
    
    const getStatusLabel = (status: BookingStatus) => {
        const statusMap: Record<string, string> = {
            pending: 'در انتظار پرداخت',
            awaiting_confirmation: 'در انتظار تایید اپراتور',
            awaiting_completion: 'در انتظار تکمیل وجه', // Added Label
            confirmed: 'تایید شده',
            cancelled: 'لغو شده',
            cancellation_requested: 'درخواست لغو',
            modification_requested: 'درخواست ویرایش',
            no_capacity: 'تکمیل ظرفیت',
        };
        return statusMap[status] || status;
    }

    if (isLoading || !code) return (
        <>
            <Header />
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-brand"></div>
            </div>
            <Footer />
        </>
    );

    if (isError || !booking) return (
        <>
            <Header />
            <div className="container mx-auto p-10 text-center min-h-[60vh] flex flex-col justify-center items-center">
                <div className="bg-red-50 text-red-600 p-6 rounded-xl border border-red-200 max-w-lg">
                    <h1 className="text-xl font-bold mb-2">خطا در دریافت اطلاعات</h1>
                    <p>{(error as Error)?.message || "رزرو مورد نظر یافت نشد."}</p>
                    <button onClick={() => router.push('/')} className="mt-4 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded transition-colors">
                        بازگشت به صفحه اصلی
                    </button>
                </div>
            </div>
            <Footer />
        </>
    );
    
    // متغیر کمکی برای خوانایی کد در JSX
    const canPay = isPayableStatus(booking.status);

    return (
        <>
            <Header />
            <main className="min-h-screen bg-gray-50 pb-16">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8" dir="rtl">
                    <h1 className="text-2xl md:text-3xl font-extrabold mb-2 text-gray-900 flex items-center gap-2">
                        <span className="w-2 h-8 bg-primary-brand rounded-full"></span>
                        نهایی‌سازی رزرو
                    </h1>
                    <p className="text-gray-600 mb-8 mr-4">لطفاً اطلاعات رزرو را بررسی و جهت قطعی شدن آن، پرداخت را انجام دهید.</p>
                    
                    {/* Status Alerts */}
                    {/* FIX: Removed the redundant 'pending' check logic that caused TS error */}
                    {booking.status !== 'confirmed' && (
                         <div className={`mb-6 p-4 border rounded-lg flex items-center gap-3 ${
                             canPay ? 'bg-cyan-50 border-cyan-200 text-cyan-800' : // If payable (pending/awaiting...), show Blue/Cyan
                             'bg-yellow-50 border-yellow-200 text-yellow-800'      // If canceled/no_capacity, show Yellow/Orange
                         }`}>
                            <div className="font-bold">وضعیت فعلی: {getStatusLabel(booking.status)}</div>
                            
                            {/* Only show "Not payable" message if it is truly NOT payable and NOT confirmed */}
                            {!canPay && (
                                <span className="text-sm border-r border-gray-300 pr-3 mr-auto">
                                    امکان پرداخت آنلاین برای این وضعیت وجود ندارد.
                                </span>
                            )}
                        </div>
                    )}
                    
                    <div className="space-y-6">
                        {/* 1. Summary Module */}
                        <BookingSummary booking={booking} />

                        {/* 2. Guest Module */}
                        <DetailCard title="مشخصات رزرو گیرنده" icon={User}>
                            {booking.guests && booking.guests.length > 0 ? (
                                <GuestDetailSection guest={booking.guests[0]} />
                            ) : (
                                <p className="text-gray-500 text-sm">اطلاعاتی موجود نیست</p>
                            )}
                        </DetailCard>

                        {/* 3. Payment Module */}
                        {/* UPDATE: Show payment methods for all payable statuses */}
                        {canPay && (
                            <PaymentMethods 
                                wallet={wallet}
                                totalPrice={booking.total_price}
                                isAuthenticated={isAuthenticated}
                                isAgencyUser={!!user?.agency_role}
                                loading={loadingPayment}
                                error={paymentError}
                                onPay={handlePay}
                            />
                        )}
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
};

export default PaymentPage;
