// src/pages/payment/[booking_code].tsx
// version: 1.4.0
// REFACTOR: Split monolithic component into modular parts (BookingSummary, PaymentMethods, GuestInfo).

import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useQuery, useMutation } from '@tanstack/react-query';
import { fetchBookingDetails, initiatePayment, payWithWallet, BookingDetail, BookingStatus } from '@/api/reservationService';
import { getUserWallet } from '@/api/coreService';
import { Wallet as WalletData } from '@/types/hotel';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuth } from '@/hooks/useAuth';

// New Imports
import { BookingSummary } from '@/components/payment/BookingSummary';
import { PaymentMethods, PaymentMethod } from '@/components/payment/PaymentMethods';
import { DetailCard } from '@/components/ui/DetailCard';
import { UserCheck, CreditCard as CardIcon, User } from 'lucide-react';

// (GuestDetailSection can also be moved to its own file, but included here for brevity if small)
const GuestDetailSection: React.FC<{ guest: BookingDetail['guests'][0] }> = ({ guest }) => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-y-4 gap-x-6 text-sm">
        <div className="flex items-center text-gray-800">
            <UserCheck className="w-5 h-5 ml-2 text-green-500"/>
            <span className="font-semibold">سرپرست:</span> 
            <span className="mr-2">{guest.first_name || 'نا مشخص'} {guest.last_name || ''}</span>
        </div>
        <div className="flex items-center text-gray-800">
            <CardIcon className="w-5 h-5 ml-2 text-gray-500"/>
            {guest.is_foreign ? (
                <><span className="font-semibold">پاسپورت:</span><span className="mr-2">{guest.passport_number || 'نا مشخص'}</span></>
            ) : (
                <><span className="font-semibold">کد ملی:</span><span className="mr-2">{guest.national_id || 'نا مشخص'}</span></>
            )}
        </div>
        <div className="flex items-center text-gray-800">
            <span className="font-semibold">تماس:</span> 
            <span className="mr-2">{guest.phone_number || 'نا مشخص'}</span>
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
    });

    const { data: wallet } = useQuery<WalletData, Error>({
        queryKey: ['userWallet'],
        queryFn: getUserWallet,
        enabled: isAuthenticated,
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
                alert(data.message || 'پرداخت با موفقیت انجام شد.');
                router.push('/profile/bookings');
            } else if (method === 'online' && data.redirect_url) {
                window.location.href = data.redirect_url;
            }
        },
        onError: (err: any) => {
            setPaymentError(err.response?.data?.error || 'خطا در پردازش پرداخت.');
        },
        onSettled: () => {
            setLoadingPayment(false);
        }
    });

    const handlePay = async (method: PaymentMethod) => {
        if (!booking || booking.status !== 'pending') {
            setPaymentError("این رزرو قابل پرداخت نیست.");
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
            awaiting_confirmation: 'منتظر تایید',
            confirmed: 'تایید شده',
            cancelled: 'لغو شده',
            cancellation_requested: 'درخواست لغو',
            modification_requested: 'درخواست ویرایش',
            no_capacity: 'عدم ظرفیت',
        };
        return statusMap[status] || status;
    }

    if (isLoading || !code) return <><Header /><div className="container mx-auto p-8 text-center" dir="rtl">در حال بارگذاری...</div><Footer /></>;
    if (isError || !booking) return <><Header /><div className="container mx-auto p-8 text-center" dir="rtl"><h1 className="text-2xl text-red-600">{(error as Error)?.message || "رزرو یافت نشد."}</h1></div><Footer /></>;
    
    return (
        <>
            <Header />
            <main className="min-h-screen bg-gray-50 pb-16">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8" dir="rtl">
                    <h1 className="text-3xl font-extrabold mb-2 text-gray-900">
                        نهایی‌سازی پرداخت رزرو <span className="text-indigo-600 mr-1">{booking.booking_code}</span>
                    </h1>
                    <p className="text-lg text-gray-600 mb-8">لطفاً جزئیات رزرو را بررسی و روش پرداخت را انتخاب کنید.</p>
                    
                    {/* Status Alerts */}
                    {booking.status === 'awaiting_confirmation' && (
                        <div className="mb-6 p-4 bg-cyan-100 border border-cyan-300 text-cyan-800 rounded-lg">
                            <p className="font-bold">وضعیت رزرو: {getStatusLabel(booking.status)}</p>
                            <p className="text-sm pt-1">این رزرو نیازمند تایید اپراتور است.</p>
                        </div>
                    )}
                    {booking.status !== 'pending' && booking.status !== 'awaiting_confirmation' && (
                         <div className="mb-6 p-4 bg-yellow-100 border border-yellow-300 text-yellow-800 rounded-lg">
                            <p className="font-bold">وضعیت رزرو: {getStatusLabel(booking.status)}</p>
                            {booking.status !== 'confirmed' && <p className="text-sm pt-1">این رزرو در حال حاضر قابل پرداخت نیست.</p>}
                        </div>
                    )}
                    
                    <div className="space-y-6">
                        {/* 1. Summary Module */}
                        <BookingSummary booking={booking} />

                        {/* 2. Guest Module */}
                        <DetailCard title="اطلاعات سرپرست رزرو" icon={User}>
                            {booking.guests[0] && <GuestDetailSection guest={booking.guests[0]} />}
                        </DetailCard>

                        {/* 3. Payment Module */}
                        {booking.status === 'pending' && (
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
