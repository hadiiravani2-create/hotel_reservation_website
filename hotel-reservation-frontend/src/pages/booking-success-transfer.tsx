// src/pages/booking-success-transfer.tsx
// version: 1.0.3
// CRITICAL FIX: Replaced deprecated 'mutation.isLoading' with 'mutation.isPending' to fix Type Error in modern TanStack Query versions.

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router'; 
import { useQuery, useMutation } from '@tanstack/react-query';
import { fetchBookingDetails, fetchOfflineBanks, submitPaymentConfirmation, BookingDetail, OfflineBank, PaymentConfirmationPayload } from '../api/reservationService';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Banknote, CheckCircle, Clock, Hotel, UserCheck, CreditCard, User } from 'lucide-react'; 
import moment from 'moment-jalaali';

// Utility function to convert English digits to Persian digits
const toPersianDigits = (str: string | number) => {
    return String(str).replace(/\d/g, (d) => ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'][parseInt(d)]);
};

const BANK_QUERY_KEY = 'offlineBanks';
const BOOKING_DETAIL_QUERY_KEY = 'bookingDetail';

// --- (Omitted DetailCard and GuestDetailSection components for brevity) ---

interface DetailCardProps {
    title: string;
    children: React.ReactNode;
    icon: React.ElementType;
}

const DetailCard: React.FC<DetailCardProps> = ({ title, children, icon: Icon }) => (
    <div className="p-6 bg-white rounded-xl shadow-lg border border-gray-100 mb-6">
        <h2 className="flex items-center text-2xl font-bold mb-4 text-blue-700 border-b pb-2">
            <Icon className="w-6 h-6 ml-2 text-indigo-500" />
            {title}
        </h2>
        <div className="space-y-4">
            {children}
        </div>
    </div>
);

const GuestDetailSection: React.FC<{ guest: BookingDetail['guests'][0] }> = ({ guest }) => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-y-4 gap-x-6 text-sm">
        <div className="flex items-center text-gray-800">
            <UserCheck className="w-5 h-5 ml-2 text-green-500"/>
            <span className="font-semibold">سرپرست:</span> 
            <span className="mr-2">{guest.first_name || 'نا مشخص'} {guest.last_name || ''}</span>
        </div>
        <div className="flex items-center text-gray-800">
            <CreditCard className="w-5 h-5 ml-2 text-gray-500"/>
            {guest.is_foreign ? (
                <>
                    <span className="font-semibold">پاسپورت:</span> 
                    <span className="mr-2">{guest.passport_number || 'نا مشخص'}</span>
                </>
            ) : (
                <>
                    <span className="font-semibold">کد ملی:</span> 
                    <span className="mr-2">{guest.national_id || 'نا مشخص'}</span>
                </>
            )}
        </div>
        <div className="flex items-center text-gray-800">
            <span className="font-semibold">تماس:</span> 
            <span className="mr-2">{guest.phone_number || 'نا مشخص'}</span>
        </div>
    </div>
);


const BookingSuccessTransferPage: React.FC = () => {
    const router = useRouter();
    const { code: booking_code } = router.query;
    
    // Form state
    const [formData, setFormData] = useState<Partial<PaymentConfirmationPayload>>({
        offline_bank: undefined,
        tracking_code: '',
        payment_date: moment().format('jYYYY-jMM-jDD HH:mm:ss'), // Default to current date/time
        payment_amount: 0,
    });
    
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [isSubmitted, setIsSubmitted] = useState(false);

    // 1. Fetch Booking Details
    const { data: booking, isLoading: isLoadingBooking, isError } = useQuery<BookingDetail, Error>({
        queryKey: [BOOKING_DETAIL_QUERY_KEY, booking_code],
        queryFn: () => fetchBookingDetails(booking_code as string),
        enabled: !!booking_code && !isSubmitted,
    });
    
    // Use useEffect to handle redirect on fetch error (Modern TanStack Query practice)
    useEffect(() => {
        if (isError) {
            router.push('/404');
        }
    }, [isError, router]);


    // 2. Fetch Active Banks
    const { data: banks, isLoading: isLoadingBanks } = useQuery<OfflineBank[]>({
        queryKey: [BANK_QUERY_KEY],
        queryFn: fetchOfflineBanks,
    });
    
    // CRITICAL FIX: Set default payment amount and default bank atomically
    useEffect(() => {
        if (booking && booking.total_price > 0) { 
             setFormData(prev => {
                let updates: Partial<PaymentConfirmationPayload> = {};

                // 1. Set payment amount only if it's currently 0 or unset
                if (prev.payment_amount === 0) {
                    updates.payment_amount = booking.total_price;
                }

                // 2. Set default bank ID only if banks are loaded and bank ID is not yet set
                if (banks && banks.length > 0 && !prev.offline_bank) {
                    updates.offline_bank = banks[0].id;
                }

                // Return the merged state
                return { ...prev, ...updates };
            });
        }
    }, [booking, banks]);


    // 3. Mutation for Payment Confirmation Submission
    const mutation = useMutation({
        mutationFn: submitPaymentConfirmation,
        onSuccess: (data) => {
            setSuccessMessage(data.message);
            setIsSubmitted(true);
        },
        onError: (error) => {
            const axiosError = error as any;
            const msg = axiosError.response?.data?.message || axiosError.response?.data?.detail || 'خطا در ثبت تاییدیه پرداخت. لطفا دوباره تلاش کنید.';
            setSuccessMessage(msg);
        },
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        // Ensure values are correctly parsed to numbers if they are for ID/Amount fields
        setFormData(prev => ({ 
            ...prev, 
            [name]: name === 'offline_bank' || name === 'payment_amount' ? parseInt(value) : value 
        }));
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!booking_code || !formData.offline_bank || !formData.tracking_code || !formData.payment_date || !formData.payment_amount) {
            alert("لطفاً تمامی فیلدهای الزامی را تکمیل کنید.");
            return;
        }

        mutation.mutate({
            ...formData,
            booking_code: booking_code as string,
            payment_amount: formData.payment_amount! 
        } as PaymentConfirmationPayload);
    };

    if (isLoadingBooking || isLoadingBanks) {
        return (
            <>
                <Header />
                <div className="max-w-4xl mx-auto p-8" dir="rtl">در حال بارگذاری اطلاعات رزرو و بانک‌ها...</div>
                <Footer />
            </>
        );
    }
    
    // Check if there are any active banks for offline transfer
    if (banks && banks.length === 0) {
         return (
            <>
                <Header />
                <div className="max-w-4xl mx-auto p-8" dir="rtl">
                    <div className="p-6 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700">
                        <p className="font-bold">هشدار: روش پرداخت آفلاین در حال حاضر فعال نیست.</p>
                        <p className="text-sm pt-1">هیچ حساب بانکی فعالی برای واریز یافت نشد. لطفا با پشتیبانی تماس بگیرید.</p>
                    </div>
                </div>
                <Footer />
            </>
        );
    }

    if (!booking) return <></>; // Should be handled by useEffect/isError


    return (
        <>
            <Header />
            <main className="min-h-screen bg-gray-50 pb-16">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8" dir="rtl">
                    
                    {/* Header Message */}
                    <h1 className="text-3xl font-extrabold mb-2 text-green-700">
                        <CheckCircle className="w-8 h-8 ml-2 inline text-green-600" />
                        رزرو شما ثبت شد. ({toPersianDigits(booking.booking_code)})
                    </h1>
                    <p className="text-xl text-gray-700 mb-8">
                        لطفاً جهت نهایی‌سازی، مبلغ <span className="text-red-600 font-bold">{toPersianDigits(booking.total_price.toLocaleString('fa'))}</span> تومان را واریز و اطلاعات آن را ثبت کنید.
                    </p>

                    {successMessage && isSubmitted ? (
                        // Payment Confirmation Success State
                        <div className="p-6 bg-green-100 border-l-4 border-green-500 text-green-700 rounded-lg">
                            <h2 className="text-2xl font-bold mb-2">تاییدیه پرداخت شما ثبت شد!</h2>
                            <p className="text-lg">{successMessage}</p>
                            <p className="mt-4 text-sm">نتیجه بررسی پرداخت شما ظرف ۲۴ ساعت از طریق ایمیل یا پیامک اطلاع‌رسانی خواهد شد.</p>
                            <Button onClick={() => router.push('/my-bookings')} className="mt-4 bg-green-600 hover:bg-green-700">
                                مشاهده رزروهای من
                            </Button>
                        </div>
                    ) : (
                        // Form Submission State
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            
                            {/* Left Column: Bank Details & Instructions (2/3 width) */}
                            <div className="md:col-span-2 space-y-6">
                                
                                {/* Bank Instructions */}
                                <div className="p-6 bg-indigo-50 border border-indigo-200 rounded-xl shadow-md">
                                    <h2 className="text-xl font-bold mb-4 text-indigo-700 flex items-center">
                                        <Banknote className="w-5 h-5 ml-2" />
                                        ۱. واریز مبلغ به حساب‌های مقصد
                                    </h2>
                                    <p className="text-gray-700 mb-4 text-sm">
                                        لطفاً در مهلت مقرر (۲۴ ساعت) مبلغ دقیق رزرو را به یکی از حساب‌های زیر واریز نمایید.
                                    </p>
                                    
                                    {/* Bank Accounts List */}
                                    {banks?.map(bank => (
                                        <div key={bank.id} className="p-4 mb-2 bg-white rounded-lg shadow-sm">
                                            <h3 className="font-bold text-lg text-gray-900">{bank.bank_name}</h3>
                                            <p className="text-sm text-gray-600">
                                                صاحب حساب: <span className="font-medium mr-2">{bank.account_holder}</span>
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                شماره کارت: <span className="font-mono text-blue-600 mr-2">{toPersianDigits(bank.card_number)}</span>
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                شماره حساب: <span className="font-mono text-blue-600">{toPersianDigits(bank.account_number)}</span>
                                            </p>
                                        </div>
                                    ))}
                                </div>
                                
                                {/* Payment Confirmation Form */}
                                <form onSubmit={handleSubmit} className="p-6 bg-white border border-gray-200 rounded-xl shadow-md">
                                    <h2 className="text-xl font-bold mb-4 text-indigo-700 flex items-center">
                                        <Clock className="w-5 h-5 ml-2" />
                                        ۲. ثبت اطلاعات واریز
                                    </h2>
                                    
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {/* Bank Selection */}
                                            <div className="relative">
                                                <label className="block text-sm font-medium text-gray-700 mb-1">بانک مقصد واریز *</label>
                                                <select
                                                    name="offline_bank"
                                                    onChange={handleChange}
                                                    required
                                                    value={formData.offline_bank || ''}
                                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                                >
                                                    {banks?.map(bank => (
                                                        <option key={bank.id} value={bank.id}>
                                                            {bank.bank_name} ({bank.account_holder})
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            
                                            {/* Tracking Code */}
                                            <Input
                                                label="شماره پیگیری/ارجاع * (از رسید پرداخت)"
                                                name="tracking_code"
                                                type="text"
                                                onChange={handleChange}
                                                value={formData.tracking_code || ''}
                                                required
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {/* Payment Date/Time */}
                                            <Input
                                                label="تاریخ و ساعت پرداخت (مثال: ۱۴۰۴-۰۳-۰۱ ۱۱:۳۰:۰۰) *"
                                                name="payment_date"
                                                type="text" // Using text for manual input compatibility
                                                placeholder="YYYY-MM-DD HH:MM:SS"
                                                onChange={handleChange}
                                                value={formData.payment_date || ''}
                                                required
                                            />

                                            {/* Payment Amount */}
                                            <Input
                                                label={`مبلغ واریزی (حداقل ${toPersianDigits(booking.total_price.toLocaleString('fa'))} تومان) *`}
                                                name="payment_amount"
                                                type="number"
                                                onChange={handleChange}
                                                value={formData.payment_amount || 0}
                                                required
                                            />
                                        </div>
                                    </div>
                                    
                                    <Button type="submit" className="mt-6 w-full py-3" disabled={mutation.isPending}>
                                        {mutation.isPending ? 'در حال ثبت اطلاعات...' : 'ثبت نهایی تاییدیه پرداخت'}
                                    </Button>
                                    {mutation.error && <p className="text-red-500 text-sm mt-3">خطا: {(mutation.error as any).response?.data?.booking_code || (mutation.error as any).message}</p>}
                                </form>
                                
                            </div>
                            
                            {/* Right Column: Booking Summary (1/3 width) */}
                            <div className="md:col-span-1">
                                <div className="sticky top-4 space-y-6">
                                    <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
                                        <h3 className="text-xl font-bold mb-4 text-blue-800">خلاصه رزرو</h3>
                                        <p className="mb-2"><strong>کد رزرو:</strong> {toPersianDigits(booking.booking_code)}</p>
                                        <p className="mb-2"><strong>هتل:</strong> {booking.hotel_name}</p>
                                        <p className="mb-4"><strong>تاریخ ورود:</strong> {toPersianDigits(booking.check_in)}</p>
                                        
                                        <div className="mt-4 border-t pt-4 flex justify-between items-center">
                                            <span className="font-bold text-xl text-red-600">مبلغ کل:</span>
                                            <span className="font-bold text-2xl text-red-600">
                                                {toPersianDigits(booking.total_price.toLocaleString('fa'))}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="p-4 bg-yellow-100 border border-yellow-300 rounded-xl">
                                         <p className="font-bold text-yellow-800">مهلت پرداخت:</p>
                                         <p className="text-sm text-yellow-800">شما ۲۴ ساعت از زمان ثبت رزرو برای پرداخت فرصت دارید.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </>
    );
};

export default BookingSuccessTransferPage;
