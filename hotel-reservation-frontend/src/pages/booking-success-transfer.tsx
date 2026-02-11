// FILE: hotel_reservation_website/src/pages/booking-success-transfer.tsx
// version: 2.1.2
// FEATURE: Implemented Financial Reconciliation UI (Total/Paid/Remaining).
// FEATURE: Allow users to input custom payment amount for partial payments.
// FIX: Redirects guest users to /track-booking with query params for auto-lookup.
// STYLE: Preserved original design structure while adding new dashboard.

import React, { useState, useEffect } from 'react';
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
import { BankCard } from '@/components/payment/BankCard';
import { formatPrice } from '@/utils/format';
import { CheckCircle, CreditCard, Receipt, AlertCircle, Wallet } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const BookingSuccessTransferPage: React.FC = () => {
    const router = useRouter();
    const { booking_code } = router.query;
    const { isAuthenticated } = useAuth();

    // --- State Management ---
    const [selectedBankId, setSelectedBankId] = useState<string>('');
    const [trackingCode, setTrackingCode] = useState('');
    // تغییر: ذخیره تاریخ به صورت آبجکت برای تبدیل دقیق‌تر به ISO
    const [paymentDate, setPaymentDate] = useState<DateObject | null>(new DateObject());
    const [paymentTime, setPaymentTime] = useState('12:00');
    // جدید: استیت مبلغ پرداخت
    const [paymentAmount, setPaymentAmount] = useState<string>('');

    const code = Array.isArray(booking_code) ? booking_code[0] : booking_code;

    // --- Data Fetching ---
    const { data: booking, isLoading: isLoadingBooking } = useQuery<BookingDetail>({
        queryKey: ['bookingDetails', code],
        queryFn: () => fetchBookingDetails(code as string),
        enabled: !!code,
    });

    const { data: banks, isLoading: isLoadingBanks } = useQuery<OfflineBank[]>({
        queryKey: ['offlineBanks', booking?.hotel_id], 
        queryFn: () => fetchOfflineBanks(booking!.hotel_id), 
        enabled: !!booking && !!booking.hotel_id, // شرط status='pending' حذف شد تا در حالت‌های دیگر هم بانک‌ها لود شوند
    });

    // --- Financial Calculations ---
    const paidAmount = booking?.paid_amount || 0;
    const remainingAmount = booking ? (booking.total_price - paidAmount) : 0;
    const isFullyPaid = remainingAmount <= 0;

    // مقداردهی اولیه مبلغ واریزی برابر با مانده بدهی
    useEffect(() => {
        if (remainingAmount > 0) {
            setPaymentAmount(remainingAmount.toString());
        }
    }, [remainingAmount]);

    // --- Mutation ---
    const mutation = useMutation({
        mutationFn: (payload: GenericPaymentConfirmationPayload) => submitPaymentConfirmation(payload),
        onSuccess: (data) => {
            alert(data.message || 'اطلاعات پرداخت شما با موفقیت ثبت شد. پس از تایید توسط تیم مالی، رزرو شما نهایی خواهد شد.');
            
            if (isAuthenticated) {
                // کاربر لاگین کرده -> رزروهای من
                router.push('/profile/bookings');
            } else {
                // کاربر مهمان -> پیگیری رزرو (با ارسال پارامترها)
                const guestNid = booking?.guests && booking.guests.length > 0 ? booking.guests[0].national_id : '';
                
                if (guestNid) {
                    router.push(`/track-booking?code=${booking?.booking_code}&nid=${guestNid}`);
                } else {
                    router.push('/track-booking');
                }
            }
        },
        onError: (error: any) => {
            alert(`خطا در ثبت اطلاعات: ${error.response?.data?.error || error.message}`);
        }
    });

    const handleDateChange = (date: DateObject | null) => {
        setPaymentDate(date);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!booking || !selectedBankId || !trackingCode || !paymentDate || !paymentTime) {
            alert('لطفا تمام فیلدها را پر کنید.');
            return;
        }

        if (!paymentAmount || parseInt(paymentAmount) <= 0) {
            alert('مبلغ واریزی نامعتبر است.');
            return;
        }

        // ترکیب تاریخ و ساعت برای ساخت ISO String استاندارد
        const datePart = paymentDate.toDate(); // تبدیل به JS Date
        const [hours, minutes] = paymentTime.split(':').map(Number);
        datePart.setHours(hours, minutes, 0, 0);
        const isoDateTime = datePart.toISOString();

        const payload: GenericPaymentConfirmationPayload = {
            content_type: 'booking',
            object_id: booking.booking_code,
            offline_bank: parseInt(selectedBankId, 10),
            tracking_code: trackingCode,
            payment_date: isoDateTime,
            payment_amount: parseInt(paymentAmount, 10), // ارسال مبلغ وارد شده توسط کاربر
        };
        mutation.mutate(payload);
    };

    if (isLoadingBooking || !code) return <><Header /><div className="text-center p-20">در حال بارگذاری...</div><Footer /></>;
    if (!booking) return <><Header /><div className="text-center p-20 text-red-600 font-bold">اطلاعات رزرو یافت نشد.</div><Footer /></>;

    return (
        <div className="min-h-screen flex flex-col bg-gray-50" dir="rtl">
            <Header />
            <main className="flex-grow container mx-auto max-w-5xl px-4 py-8">
                
                {/* --- Financial Dashboard (داشبورد وضعیت مالی) --- */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
                    <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center border-b pb-3">
                        <Wallet className="w-6 h-6 ml-2 text-primary-600"/>
                        وضعیت مالی رزرو: <span className="mr-2 font-mono text-xl">{booking.booking_code}</span>
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* 1. مبلغ کل */}
                        <div className="bg-gray-50 p-5 rounded-xl text-center border border-gray-100">
                            <span className="block text-sm text-gray-500 mb-2">مبلغ کل قرارداد</span>
                            <div className="flex justify-center items-center text-gray-800">
                                <span className="text-2xl font-bold ml-1">{formatPrice(booking.total_price)}</span>
                                <span className="text-xs text-gray-400">تومان</span>
                            </div>
                        </div>

                        {/* 2. پرداخت شده */}
                        <div className="bg-green-50 p-5 rounded-xl text-center border border-green-100 relative overflow-hidden">
                            <div className="absolute top-0 right-0 bg-green-200 text-green-800 text-[10px] px-2 py-1 rounded-bl-lg">تایید شده</div>
                            <span className="block text-sm text-green-700 mb-2">مجموع پرداختی شما</span>
                            <div className="flex justify-center items-center text-green-700">
                                <span className="text-2xl font-bold ml-1">{formatPrice(paidAmount)}</span>
                                <span className="text-xs text-green-500">تومان</span>
                            </div>
                        </div>

                        {/* 3. مانده بدهی */}
                        <div className={`p-5 rounded-xl text-center border relative overflow-hidden ${isFullyPaid ? 'bg-blue-50 border-blue-100' : 'bg-red-50 border-red-100'}`}>
                            <span className={`block text-sm mb-2 ${isFullyPaid ? 'text-blue-600' : 'text-red-600'}`}>
                                {isFullyPaid ? 'وضعیت نهایی' : 'مانده قابل پرداخت'}
                            </span>
                            <div className={`flex justify-center items-center ${isFullyPaid ? 'text-blue-700' : 'text-red-700'}`}>
                                <span className="text-2xl font-bold ml-1">
                                    {isFullyPaid ? 'تسویه شده' : formatPrice(remainingAmount)}
                                </span>
                                {!isFullyPaid && <span className="text-xs text-red-400">تومان</span>}
                            </div>
                            {isFullyPaid && <CheckCircle className="absolute -bottom-2 -left-2 w-12 h-12 text-blue-200 opacity-50"/>}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        
                        {!isFullyPaid ? (
                            <>
                                {/* انتخاب بانک */}
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

                                {/* فرم ثبت اطلاعات */}
                                <DetailCard title="مرحله ۲: ثبت اطلاعات فیش واریزی" icon={Receipt}>
                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        {!selectedBankId && (
                                            <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-lg flex items-start text-sm">
                                                <AlertCircle className="w-5 h-5 ml-1 flex-shrink-0 mt-0.5"/>
                                                <span>لطفاً ابتدا از لیست بالا، حسابی که مبلغ را به آن واریز کرده‌اید انتخاب کنید.</span>
                                            </div>
                                        )}
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            
                                            {/* مبلغ واریزی (جدید) */}
                                            <div className="col-span-1 md:col-span-2">
                                                <Input
                                                    label="مبلغ واریزی (تومان)"
                                                    type="number"
                                                    value={paymentAmount}
                                                    onChange={(e) => setPaymentAmount(e.target.value)}
                                                    placeholder="مبلغ دقیق واریز شده را وارد کنید"
                                                    required
                                                    helperText={remainingAmount > 0 ? `کل بدهی باقی‌مانده: ${formatPrice(remainingAmount)} تومان` : ''}
                                                    className="font-bold text-lg"
                                                />
                                            </div>

                                            <Input 
                                                label="شماره پیگیری / ارجاع" 
                                                value={trackingCode} 
                                                onChange={(e) => setTrackingCode(e.target.value)} 
                                                placeholder="مثال: ۱۲۳۴۵۶"
                                                required 
                                            />

                                            <div className="flex flex-col gap-1">
                                                <JalaliDatePicker 
                                                    label="تاریخ واریز"
                                                    name="payment_date"
                                                    value={paymentDate}
                                                    onChange={handleDateChange}
                                                    required
                                                    maxDate={new DateObject()}
                                                />
                                            </div>
                                            
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
                            </>
                        ) : (
                            // حالت تسویه شده
                            <div className="bg-green-50 border border-green-200 rounded-2xl p-10 text-center shadow-sm">
                                <div className="bg-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                                    <CheckCircle className="w-10 h-10 text-green-500"/>
                                </div>
                                <h3 className="text-2xl font-extrabold text-green-800 mb-3">پرداخت تکمیل شده است</h3>
                                <p className="text-green-700 max-w-md mx-auto leading-relaxed mb-8">
                                    هزینه رزرو شما به طور کامل پرداخت و ثبت شده است. نیازی به ثبت فیش جدید نیست.
                                </p>
                                <Button 
                                    variant="outline"
                                    onClick={() => isAuthenticated ? router.push('/profile/bookings') : router.push('/track-booking')}
                                    className="px-8 border-green-600 text-green-700 hover:bg-green-100"
                                >
                                    پیگیری وضعیت رزرو
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* ستون کناری: نکات */}
                    <div className="lg:col-span-1">
                        <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 sticky top-24">
                            <h3 className="font-bold text-blue-800 mb-4 flex items-center text-lg">
                                <AlertCircle className="w-5 h-5 ml-2"/>
                                نکات مهم پرداخت
                            </h3>
                            <ul className="text-sm text-blue-800 space-y-4 leading-7 list-disc list-inside marker:text-blue-400">
                                <li>
                                    <strong>پرداخت مرحله‌ای:</strong> اگر به دلیل سقف انتقال وجه کارت بانکی، نمی‌توانید کل مبلغ را یکجا واریز کنید، می‌توانید در 
                                    <strong> چند مرحله </strong> واریز کرده و برای هر واریز، یک فیش جداگانه ثبت کنید.
                                </li>
                                <li>مجموع مبالغ واریزی باید نهایتاً برابر با مبلغ کل رزرو ({formatPrice(booking.total_price)} تومان) شود.</li>
                                <li>حتماً <strong>فیش واریزی</strong> را تا زمان تایید نهایی نزد خود نگه دارید.</li>
                                <li>پس از ثبت فیش، وضعیت رزرو به <strong>"منتظر تایید"</strong> تغییر می‌کند.</li>
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
