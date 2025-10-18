// src/pages/booking-success-transfer.tsx
// version: 1.1.0
// FEATURE: Implemented conditional rendering based on booking status to handle both online and offline hotel flows.

import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useQuery, useMutation } from '@tanstack/react-query';
import { fetchBookingDetails, fetchOfflineBanks, submitPaymentConfirmation, BookingDetail, GenericPaymentConfirmationPayload } from '../api/reservationService';
import { OfflineBank } from '@/types/hotel';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

const BookingSuccessTransferPage: React.FC = () => {
    const router = useRouter();
    const { booking_code } = router.query;

    const [selectedBank, setSelectedBank] = useState<string>('');
    const [trackingCode, setTrackingCode] = useState('');
    const [paymentDate, setPaymentDate] = useState('');

    const { data: booking, isLoading: isLoadingBooking } = useQuery<BookingDetail>({
        queryKey: ['bookingDetails', booking_code],
        queryFn: () => fetchBookingDetails(booking_code as string),
        enabled: !!booking_code,
    });

    const { data: banks, isLoading: isLoadingBanks } = useQuery<OfflineBank[]>({
        queryKey: ['offlineBanks'],
        queryFn: fetchOfflineBanks,
        // Only fetch banks if the booking is for an online hotel (status is 'pending')
        enabled: !!booking && booking.status === 'pending',
    });

    const mutation = useMutation({
        mutationFn: (payload: GenericPaymentConfirmationPayload) => submitPaymentConfirmation(payload),
        onSuccess: () => {
            alert('اطلاعات پرداخت شما با موفقیت ثبت شد. پس از تایید توسط تیم مالی، رزرو شما نهایی خواهد شد.');
            router.push('/profile/bookings');
        },
        onError: (error: any) => {
            alert(`خطا در ثبت اطلاعات: ${error.response?.data?.error || error.message}`);
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!booking || !selectedBank || !trackingCode || !paymentDate) {
            alert('لطفا تمام فیلدها را پر کنید.');
            return;
        }

        const payload: GenericPaymentConfirmationPayload = {
            content_type: 'booking',
            object_id: booking.booking_code,
            offline_bank: parseInt(selectedBank, 10),
            tracking_code: trackingCode,
            payment_date: paymentDate,
            payment_amount: booking.total_price,
        };
        mutation.mutate(payload);
    };

    if (isLoadingBooking) {
        return <div className="text-center p-10">در حال بارگذاری...</div>;
    }

    if (!booking) {
        return <div className="text-center p-10 text-red-600">اطلاعات رزرو یافت نشد.</div>;
    }

    return (
        <div className="min-h-screen flex flex-col" dir="rtl">
            <Header />
            <main className="flex-grow container mx-auto max-w-4xl p-8">
                <div className="bg-white p-8 rounded-lg shadow-xl border">

                    {booking.status === 'awaiting_confirmation' ? (
                        // Content for Offline hotels
                        <div>
                            <h1 className="text-3xl font-extrabold text-cyan-600 mb-4 text-center">رزرو شما جهت بررسی ثبت شد!</h1>
                            <p className="text-center text-gray-600 mb-8">
                                کد رزرو شما <strong className="font-mono text-lg">{booking.booking_code}</strong> است.
                                <br />
                                این رزرو نیازمند تایید توسط اپراتور است. پس از بررسی، نتیجه از طریق پیامک به شما اطلاع داده خواهد شد.
                            </p>
                            <div className="text-center mt-6">
                                <Button onClick={() => router.push('/profile/bookings')} variant="primary">
                                    پیگیری رزرو در پنل کاربری
                                </Button>
                            </div>
                        </div>
                    ) : (
                        // Original content for Online hotels (status: 'pending')
                        <>
                            <h1 className="text-3xl font-extrabold text-green-600 mb-4 text-center">رزرو شما با موفقیت ثبت شد!</h1>
                            <p className="text-center text-gray-600 mb-8">
                                کد رزرو شما <strong className="font-mono text-lg">{booking.booking_code}</strong> است. لطفاً برای نهایی‌سازی، مبلغ رزرو را به یکی از حساب‌های زیر واریز کرده و اطلاعات پرداخت را ثبت کنید.
                            </p>

                            {isLoadingBanks ? <p>در حال بارگذاری اطلاعات بانکی...</p> : (
                                <div className="bg-gray-50 p-6 rounded-lg mb-8">
                                    <h3 className="font-bold text-xl mb-4">حساب‌های بانکی جهت واریز وجه</h3>
                                    <ul className="space-y-4">
                                        {banks?.map(bank => (
                                            <li key={bank.id} className="p-3 border rounded-md">
                                                <p><strong>بانک:</strong> {bank.bank_name}</p>
                                                <p><strong>صاحب حساب:</strong> {bank.account_holder}</p>
                                                <p><strong>شماره کارت:</strong> <span className="font-mono">{bank.card_number}</span></p>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <h3 className="font-bold text-xl mb-4 border-t pt-6">ثبت اطلاعات پرداخت</h3>
                                <div>
                                    <label className="block text-sm font-medium mb-1">حساب واریز شده</label>
                                    <select value={selectedBank} onChange={(e) => setSelectedBank(e.target.value)} required className="w-full h-12 p-3 border border-gray-300 rounded-md">
                                        <option value="" disabled>یک حساب را انتخاب کنید</option>
                                        {banks?.map(bank => (
                                            <option key={bank.id} value={bank.id}>{bank.bank_name} - {bank.card_number}</option>
                                        ))}
                                    </select>
                                </div>
                                <Input label="شماره پیگیری فیش" value={trackingCode} onChange={(e) => setTrackingCode(e.target.value)} required />
                                <Input label="تاریخ و ساعت پرداخت" value={paymentDate} onChange={(e) => setPaymentDate(e.target.value)} placeholder="مثال: ۱۴۰۴-۰۸-۲۵ ۱৪:۳۰" required />
                                
                                <div className="text-left">
                                    <Button type="submit" variant="primary" disabled={mutation.isPending}>
                                        {mutation.isPending ? 'در حال ثبت...' : 'ثبت و ارسال برای تایید'}
                                    </Button>
                                </div>
                            </form>
                        </>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default BookingSuccessTransferPage;
