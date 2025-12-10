// src/pages/booking-success-transfer.tsx
// version: 1.5.0
// REFACTOR: Updated import path for BankCard (moved to /components/payment/) and enhanced UI.

import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useQuery, useMutation } from '@tanstack/react-query';
import { DateObject } from "react-multi-date-picker";
import { 
    fetchBookingDetails, 
    fetchOfflineBanks, 
    submitPaymentConfirmation, 
    BookingDetail, 
    GenericPaymentConfirmationPayload 
} from '@/api/reservationService';
import { OfflineBank } from '@/types/hotel';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { JalaliDatePicker } from '@/components/ui/JalaliDatePicker';
import { DetailCard } from '@/components/ui/DetailCard'; 
import { BankCard } from '@/components/payment/BankCard'; // <-- مسیر جدید
import { formatPrice } from '@/utils/format';
import { CheckCircle, CreditCard, Receipt, AlertCircle } from 'lucide-react';

const BookingSuccessTransferPage: React.FC = () => {
    const router = useRouter();
    const { booking_code } = router.query;

    const [selectedBankId, setSelectedBankId] = useState<string>('');
    const [trackingCode, setTrackingCode] = useState('');
    const [paymentDate, setPaymentDate] = useState('');
    const [paymentTime, setPaymentTime] = useState('12:00');

    const code = Array.isArray(booking_code) ? booking_code[0] : booking_code;

    const { data: booking, isLoading: isLoadingBooking } = useQuery<BookingDetail>({
        queryKey: ['bookingDetails', code],
        queryFn: () => fetchBookingDetails(code as string),
        enabled: !!code,
    });

    const { data: banks, isLoading: isLoadingBanks } = useQuery<OfflineBank[]>({
        queryKey: ['offlineBanks', booking?.hotel_id], 
        queryFn: () => fetchOfflineBanks(booking!.hotel_id), 
        enabled: !!booking && booking.status === 'pending' && !!booking.hotel_id, 
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

    const handleDateChange = (date: DateObject | null) => {
        setPaymentDate(date ? date.format("YYYY-MM-DD") : "");
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!booking || !selectedBankId || !trackingCode || !paymentDate || !paymentTime) {
            alert('لطفا تمام فیلدها را پر کنید.');
            return;
        }

        const fullPaymentDateTime = `${paymentDate} ${paymentTime}`;

        const payload: GenericPaymentConfirmationPayload = {
            content_type: 'booking',
            object_id: booking.booking_code,
            offline_bank: parseInt(selectedBankId, 10),
            tracking_code: trackingCode,
            payment_date: fullPaymentDateTime,
            payment_amount: booking.total_price,
        };
        mutation.mutate(payload);
    };

    if (isLoadingBooking || !code) return <><Header /><div className="text-center p-20">در حال بارگذاری...</div><Footer /></>;
    if (!booking) return <><Header /><div className="text-center p-20 text-red-600 font-bold">اطلاعات رزرو یافت نشد.</div><Footer /></>;

    return (
        <div className="min-h-screen flex flex-col bg-gray-50" dir="rtl">
            <Header />
            <main className="flex-grow container mx-auto max-w-5xl px-4 py-8">
                
                {/* Success Banner */}
                {booking.status !== 'awaiting_confirmation' && (
                    <div className="bg-gradient-to-r from-green-600 to-green-500 text-white rounded-2xl p-8 text-center shadow-lg mb-8">
                        <div className="bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                            <CheckCircle className="w-10 h-10 text-white" />
                        </div>
                        <h1 className="text-3xl font-extrabold mb-2">رزرو اولیه با موفقیت ثبت شد</h1>
                        <p className="text-green-50 text-lg opacity-90 mb-4">
                            برای نهایی‌سازی، لطفاً مبلغ رزرو را واریز و شناسه پرداخت را ثبت کنید.
                        </p>
                        <div className="flex flex-wrap justify-center gap-4 text-sm font-medium">
                            <span className="bg-white/10 px-4 py-1 rounded-full border border-white/20">کد رزرو: {booking.booking_code}</span>
                            <span className="bg-white text-green-700 px-4 py-1 rounded-full shadow-sm font-bold">
                                مبلغ قابل پرداخت: {formatPrice(booking.total_price)} تومان
                            </span>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* Left Column: Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        <DetailCard title="مرحله ۱: انتخاب حساب و واریز وجه" icon={CreditCard}>
                            <p className="text-gray-500 mb-6 text-sm leading-relaxed">
                                مبلغ رزرو را به یکی از شماره‌کارت‌های زیر (کارت به کارت، پایا یا ساتنا) واریز نمایید و سپس روی کارت حساب مورد نظر کلیک کنید.
                            </p>
                            
                            {isLoadingBanks ? (
                                <div className="text-center py-10 text-gray-400">در حال دریافت اطلاعات بانکی...</div>
                            ) : (
                                <div className="grid grid-cols-1 gap-4">
                                    {banks?.map(bank => (
                                        <BankCard 
                                            key={bank.id}
                                            bank={bank}
                                            isSelected={selectedBankId === bank.id.toString()}
                                            onSelect={() => setSelectedBankId(bank.id.toString())}
                                        />
                                    ))}
                                </div>
                            )}
                        </DetailCard>

                        <DetailCard title="مرحله ۲: ثبت اطلاعات فیش واریزی" icon={Receipt}>
                             <form onSubmit={handleSubmit} className="space-y-6">
                                {!selectedBankId && (
                                    <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-lg flex items-start text-sm">
                                        <AlertCircle className="w-5 h-5 ml-1 flex-shrink-0 mt-0.5"/>
                                        <span>لطفاً ابتدا از لیست بالا، حسابی که مبلغ را به آن واریز کرده‌اید انتخاب کنید.</span>
                                    </div>
                                )}
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="col-span-1 md:col-span-2">
                                        <Input 
                                            label="شماره پیگیری / ارجاع" 
                                            value={trackingCode} 
                                            onChange={(e) => setTrackingCode(e.target.value)} 
                                            placeholder="مثال: ۱۲۳۴۵۶"
                                            required 
                                        />
                                    </div>

                                    <JalaliDatePicker 
                                        label="تاریخ واریز"
                                        name="payment_date"
                                        value={paymentDate}
                                        onChange={handleDateChange}
                                        required
                                        maxDate={new DateObject()}
                                    />
                                    <Input 
                                        label="ساعت واریز"
                                        name="payment_time"
                                        type="time"
                                        value={paymentTime}
                                        onChange={(e) => setPaymentTime(e.target.value)}
                                        required
                                        dir="ltr"
                                        className="text-center"
                                    />
                                </div>
                                
                                <div className="border-t pt-6 text-left">
                                    <Button 
                                        type="submit" 
                                        className="w-full md:w-auto px-8 py-3 text-lg font-bold shadow-lg shadow-indigo-200"
                                        disabled={mutation.isPending || !selectedBankId}
                                    >
                                        {mutation.isPending ? 'در حال ثبت اطلاعات...' : 'ثبت نهایی پرداخت'}
                                    </Button>
                                </div>
                            </form>
                        </DetailCard>
                    </div>

                    {/* Right Column: Tips (Sidebar) */}
                    <div className="lg:col-span-1">
                        <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 sticky top-24">
                            <h3 className="font-bold text-blue-800 mb-4 flex items-center text-lg">
                                <AlertCircle className="w-5 h-5 ml-2"/>
                                نکات مهم پرداخت
                            </h3>
                            <ul className="text-sm text-blue-800 space-y-4 leading-7 list-disc list-inside marker:text-blue-400">
                                <li>حتماً <strong>فیش واریزی</strong> را تا زمان تایید نهایی نزد خود نگه دارید.</li>
                                <li>در صورت واریز از طریق <strong>پایا یا ساتنا</strong>، تایید پرداخت ممکن است در ساعات اداری انجام شود.</li>
                                <li>مبلغ واریزی باید <strong>دقیقاً</strong> برابر با مبلغ رزرو ({formatPrice(booking.total_price)} تومان) باشد.</li>
                                <li>پس از ثبت این فرم، وضعیت رزرو شما به <strong>"منتظر تایید"</strong> تغییر می‌کند و همکاران ما در اسرع وقت آن را بررسی می‌کنند.</li>
                            </ul>
                        </div>
                    </div>

                </div>
            </main>
            <Footer />
        </div>
    );
};

export default BookingSuccessTransferPage;
