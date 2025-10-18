// src/pages/payment/[booking_code].tsx
// version: 1.3.0
// FINAL FIX: Restored all missing component logic and JSX, resolving all previous build errors.

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useQuery, useMutation } from '@tanstack/react-query';
import { fetchBookingDetails, initiatePayment, payWithWallet, BookingDetail, BookingStatus } from '../../api/reservationService';
import { getUserWallet } from '../../api/coreService';
import { Wallet as WalletData, BookedServiceDetail } from '@/types/hotel';
import { Button } from '../../components/ui/Button';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { useAuth } from '../../hooks/useAuth';
import { Hotel, UserCheck, CreditCard, User, Wallet as WalletIcon, CheckCircle } from 'lucide-react';
import { DateObject } from 'react-multi-date-picker';
import { DATE_CONFIG } from '@/config/date';

// --- Helper Components ---
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
        <div className="space-y-4">{children}</div>
    </div>
);

// --- FIX: Restored component body ---
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
// --- END FIX ---

// --- Helper Functions ---
const toPersianDigits = (str: string | number | undefined) => {
    if (str === null || str === undefined) return '';
    return String(str).replace(/\d/g, (d) => ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'][parseInt(d)]);
};

const formatJalaliDate = (dateStr: string) => {
    if (!dateStr) return '';
    return new DateObject({ date: dateStr, calendar: DATE_CONFIG.calendar, locale: DATE_CONFIG.locale }).format('D MMMM YYYY');
};

type PaymentMethod = 'online' | 'credit' | 'card_to_card' | 'wallet';

const PaymentPage: React.FC = () => {
    const router = useRouter();
    const { booking_code } = router.query;
    const { user, isAuthenticated } = useAuth();
    
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>('card_to_card');
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
    
    const isAgencyUser = !!user?.agency_role;
    const canPayWithWallet = isAuthenticated && wallet && booking && wallet.balance >= booking.total_price;

    const availablePaymentMethods: Array<{ value: PaymentMethod, label: string, disabled?: boolean }> = [
        ...(isAuthenticated && !isAgencyUser ? [{ 
            value: 'wallet' as PaymentMethod, 
            label: `پرداخت از کیف پول (موجودی: ${toPersianDigits(wallet?.balance?.toLocaleString('fa-IR'))} تومان)`,
            disabled: !canPayWithWallet
        }] : []),
        { value: 'online', label: 'پرداخت آنلاین (درگاه بانکی)', disabled: true },
        { value: 'card_to_card', label: 'حواله بانکی / پرداخت آفلاین' },
        ...(isAgencyUser ? [{ value: 'credit' as PaymentMethod, label: 'پرداخت اعتباری (مخصوص آژانس)' }] : []),
    ];

    useEffect(() => {
        const defaultMethod = availablePaymentMethods.find(m => !m.disabled)?.value || 'card_to_card';
        setSelectedPaymentMethod(defaultMethod);
    }, [wallet, booking]);

    const paymentMutation = useMutation({
        mutationFn: (method: PaymentMethod) => {
            if (!code) throw new Error("کد رزرو یافت نشد.");
            if (method === 'wallet') return payWithWallet(code);
            if (method === 'online') return initiatePayment(code);
            return Promise.resolve(); // For card_to_card, we just redirect
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

    const handleInitiatePayment = async () => {
        if (!booking || booking.status !== 'pending') {
            setPaymentError("این رزرو قابل پرداخت نیست.");
            return;
        }
        setLoadingPayment(true);
        setPaymentError('');

        if (selectedPaymentMethod === 'card_to_card') {
            router.push(`/booking-success-transfer?booking_code=${code}`);
        } else {
            paymentMutation.mutate(selectedPaymentMethod);
        }
    };
    
    const getStatusLabel = (status: BookingStatus) => {
        const statusMap = {
            pending: 'در انتظار پرداخت',
            awaiting_confirmation: 'منتظر تایید',
            confirmed: 'تایید شده',
            cancelled: 'لغو شده',
            cancellation_requested: 'درخواست لغو',
            modification_requested: 'درخواست ویرایش',
            no_capacity: 'عدم ظرفیت',
        };
        return statusMap[status as keyof typeof statusMap] || status;
    }

    if (isLoading || !code) {
        return <><Header /><div className="container mx-auto p-8 text-center" dir="rtl">در حال بارگذاری...</div><Footer /></>;
    }

    if (isError || !booking) {
        const errorMessage = (error as Error)?.message || "رزرو یافت نشد.";
        return <><Header /><div className="container mx-auto p-8 text-center" dir="rtl"><h1 className="text-2xl text-red-600">{errorMessage}</h1></div><Footer /></>;
    }
    
    const principalGuest = booking.guests[0];

    return (
        <>
            <Header />
            <main className="min-h-screen bg-gray-50 pb-16">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8" dir="rtl">
                    <h1 className="text-3xl font-extrabold mb-2 text-gray-900">
                        نهایی‌سازی پرداخت رزرو <span className="text-indigo-600 mr-1">{toPersianDigits(booking.booking_code)}</span>
                    </h1>
                    <p className="text-lg text-gray-600 mb-8">لطفاً جزئیات رزرو را بررسی و روش پرداخت را انتخاب کنید.</p>
                    
                    {booking.status === 'awaiting_confirmation' && (
                        <div className="mb-6 p-4 bg-cyan-100 border border-cyan-300 text-cyan-800 rounded-lg">
                            <p className="font-bold">وضعیت رزرو: {getStatusLabel(booking.status)}</p>
                            <p className="text-sm pt-1">این رزرو نیازمند تایید اپراتور است. پس از بررسی، نتیجه به شما اطلاع داده خواهد شد.</p>
                        </div>
                    )}
                    {booking.status !== 'pending' && booking.status !== 'awaiting_confirmation' && (
                         <div className="mb-6 p-4 bg-yellow-100 border border-yellow-300 text-yellow-800 rounded-lg">
                            <p className="font-bold">وضعیت رزرو: {getStatusLabel(booking.status)}</p>
                            {booking.status !== 'confirmed' && <p className="text-sm pt-1">این رزرو در حال حاضر قابل پرداخت نیست.</p>}
                        </div>
                    )}
                    
                    <div className="space-y-6">
                        <DetailCard title="خلاصه رزرو" icon={Hotel}>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm font-medium border-b pb-4">
                                <p><strong>کد رزرو:</strong> {toPersianDigits(booking.booking_code)}</p>
                                <p><strong>هتل:</strong> {booking.hotel_name}</p>
                                <p><strong>ورود:</strong> {toPersianDigits(formatJalaliDate(booking.check_in))}</p>
                                <p><strong>خروج:</strong> {toPersianDigits(formatJalaliDate(booking.check_out))}</p>
                            </div>
                            
                            <h3 className="font-semibold text-lg pt-2 border-b pb-2 text-gray-700">اتاق‌های رزرو شده:</h3>
                            <ul className="space-y-3 pt-2">
                                {booking.booking_rooms.map((room, index) => (
                                    <li key={index} className="p-3 bg-blue-50 rounded-lg">
                                        <p className="font-bold text-gray-800">{room.room_type_name}</p>
                                        <p className="text-sm text-gray-600">{toPersianDigits(room.quantity)} اتاق / سرویس {room.board_type}</p>
                                    </li>
                                ))}
                            </ul>

                            {booking.booked_services && booking.booked_services.length > 0 && (
                                <>
                                    <h3 className="font-semibold text-lg pt-4 border-b pb-2 text-gray-700">خدمات اضافی</h3>
                                    <ul className="space-y-3 pt-2">
                                        {booking.booked_services.map((service) => (
                                            <li key={service.id} className="p-3 bg-gray-50 rounded-lg flex justify-between items-center">
                                                <div className="flex items-center">
                                                    <CheckCircle className="w-5 h-5 ml-2 text-green-500"/>
                                                    <p className="font-bold text-gray-800">{service.hotel_service.name}</p>
                                                </div>
                                                <p className="text-sm font-semibold">
                                                    {service.total_price > 0 ? `${toPersianDigits(service.total_price.toLocaleString())} تومان` : 'رایگان'}
                                                </p>
                                            </li>
                                        ))}
                                    </ul>
                                </>
                            )}
                            <div className="mt-6 border-t pt-4 flex justify-between items-center bg-green-50 p-3 rounded-lg">
                                <span className="font-bold text-2xl text-red-600">مبلغ نهایی:</span>
                                <span className="font-bold text-3xl text-red-600">{toPersianDigits(booking.total_price.toLocaleString('fa-IR'))} تومان</span>
                            </div>
                        </DetailCard>

                        <DetailCard title="اطلاعات سرپرست رزرو" icon={User}>
                            {principalGuest && <GuestDetailSection guest={principalGuest} />}
                        </DetailCard>

                        {booking.status === 'pending' && (
                            <DetailCard title="انتخاب روش پرداخت" icon={CreditCard}>
                                 {paymentError && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">{paymentError}</div>}
                                 <div className="space-y-4">
                                    {availablePaymentMethods.map(method => (
                                        <label key={method.value} className={`flex items-center p-4 rounded-lg cursor-pointer transition-all ${selectedPaymentMethod === method.value ? 'bg-indigo-50 ring-2 ring-indigo-500' : (method.disabled ? 'bg-gray-200 opacity-70 cursor-not-allowed' : 'bg-gray-50 hover:bg-gray-100')}`}>
                                            <input type="radio" name="payment" value={method.value} checked={selectedPaymentMethod === method.value} onChange={() => setSelectedPaymentMethod(method.value)} className="ml-3 w-5 h-5 text-indigo-600 focus:ring-indigo-500" disabled={method.disabled} />
                                            <span className="text-lg font-medium flex items-center">{method.value === 'wallet' && <WalletIcon size={20} className="ml-2" />} {method.label}</span>
                                            {method.disabled && <span className="mr-auto text-red-600 text-sm font-semibold">(موجودی ناکافی)</span>}
                                        </label>
                                    ))}
                                 </div>
                                 <Button onClick={handleInitiatePayment} className="mt-6 w-full py-3 text-xl" disabled={loadingPayment}>
                                    {loadingPayment ? 'در حال پردازش...' : `پرداخت نهایی`}
                                 </Button>
                            </DetailCard>
                        )}
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
};

export default PaymentPage;
