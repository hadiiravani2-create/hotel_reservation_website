// src/pages/payment/[booking_code].tsx
// version: 1.0.5
// CRITICAL FIX: Added useEffect to React import list to resolve "Cannot find name 'useEffect'" Type Error and enable build.

import React, { useState, useEffect } from 'react'; // CRITICAL FIX: Added useEffect
import { useRouter } from 'next/router';
import { useQuery } from '@tanstack/react-query';
import { fetchBookingDetails, initiatePayment, BookingDetail, BookingStatus } from '../../api/reservationService'; 
import { Button } from '../../components/ui/Button';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { useAuth } from '../../hooks/useAuth';
import { Hotel, UserCheck, CreditCard, User } from 'lucide-react'; 

// Utility function to convert English digits to Persian digits
const toPersianDigits = (str: string | number) => {
    return String(str).replace(/\d/g, (d) => ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'][parseInt(d)]);
};

const BOOKING_DETAIL_QUERY_KEY = 'bookingDetail';

// Defining a type for Payment methods explicitly
type PaymentMethod = 'online' | 'credit' | 'in_person' | 'card_to_card';

// --- Components for Redesigned Layout (DetailCard and GuestDetailSection omitted for brevity) ---

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


const PaymentPage: React.FC = () => {
    const router = useRouter();
    const { booking_code } = router.query;
    const { user } = useAuth();
    
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>('online');
    const [loadingPayment, setLoadingPayment] = useState(false);
    const [paymentError, setPaymentError] = useState('');

    // Fetch booking details using React Query
    const { data: booking, isLoading, isError, error } = useQuery<BookingDetail, Error>({
        queryKey: [BOOKING_DETAIL_QUERY_KEY, booking_code],
        queryFn: () => fetchBookingDetails(booking_code as string),
        enabled: !!booking_code,
    });
    
    const isAgencyUser = !!user?.agency_role;
    
    // CRITICAL UPDATE: Payment Methods array with disabled flag and renamed label
    const availablePaymentMethods: Array<{ value: PaymentMethod, label: string, disabledInUI?: boolean }> = [
        { value: 'online', label: 'پرداخت آنلاین (درگاه بانکی) - سریع و آنی', disabledInUI: true }, // Disabled per request
        { value: 'card_to_card', label: 'حواله بانکی / پرداخت آفلاین (مهلت ۲۴ ساعت)' }, // Renamed
        // Only show credit payment for authenticated agency users
        ...(isAgencyUser ? [{ value: 'credit' as PaymentMethod, label: 'پرداخت اعتباری (مخصوص آژانس) - نیاز به موجودی آژانس' }] : []),
    ];

    // Set default selected method to the first active one, if online is disabled
    useEffect(() => {
        const defaultMethod = availablePaymentMethods.find(m => !m.disabledInUI)?.value || availablePaymentMethods[0].value;
        setSelectedPaymentMethod(defaultMethod);
    }, []);

    const handleInitiatePayment = async () => {
        if (!booking || booking.status !== 'pending') {
            setPaymentError("رزرو در وضعیت درستی برای پرداخت نیست.");
            return;
        }

        // Prevent submission if the selected method is explicitly disabled
        const selectedMethodDetails = availablePaymentMethods.find(m => m.value === selectedPaymentMethod);
        if (selectedMethodDetails?.disabledInUI) {
            setPaymentError("روش پرداخت انتخاب شده در حال حاضر غیرفعال است.");
            return;
        }

        setLoadingPayment(true);
        setPaymentError('');

        try {
            if (selectedPaymentMethod === 'online') {
                const paymentResponse = await initiatePayment(booking.booking_code);
                window.location.href = paymentResponse.redirect_url; 
            } else if (selectedPaymentMethod === 'card_to_card') {
                 // The redirect path handles all offline payments
                 router.push(`/booking-success-transfer?code=${booking.booking_code}`);
            } else if (selectedPaymentMethod === 'credit') {
                 router.push(`/booking-success?code=${booking.booking_code}`); 
            }

        } catch (err: unknown) {
            const axiosError = err as { response?: { data?: { error?: string } }, message?: string };
            const errorMessage = axiosError.response?.data?.error || 'خطا در برقراری ارتباط با سرویس پرداخت.';
            setPaymentError(errorMessage);
        } finally {
            setLoadingPayment(false);
        }
    };
    
    // Convert status to Persian
    const getStatusLabel = (status: BookingStatus) => {
        switch (status) {
            case 'pending': return 'در انتظار پرداخت';
            case 'confirmed': return 'تایید شده';
            case 'cancelled': return 'لغو شده';
            default: return status;
        }
    }


    if (isLoading || !booking_code) {
        return (
            <>
                <Header />
                <div className="container mx-auto p-8" dir="rtl">در حال بارگذاری جزئیات رزرو...</div>
                <Footer />
            </>
        );
    }

    if (isError || !booking) {
        const errorMessage = (error as Error)?.message || "رزرو مورد نظر یافت نشد یا دسترسی به آن مجاز نیست.";
        return (
            <>
                <Header />
                <div className="container mx-auto p-8" dir="rtl">
                    <h1 className="text-4xl font-extrabold mb-8 text-red-600">خطا</h1>
                    <p className="text-lg text-gray-700">{errorMessage}</p>
                </div>
                <Footer />
            </>
        );
    }
    
    // Safely get the principal guest (should always exist)
    const principalGuest = booking.guests[0];

    return (
        <>
            <Header />
            <main className="min-h-screen bg-gray-50 pb-16">
                {/* Fixed width container */}
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8" dir="rtl">
                    
                    <h1 className="text-3xl font-extrabold mb-2 text-gray-900">
                        نهایی‌سازی پرداخت رزرو <span className="text-indigo-600 mr-1">{toPersianDigits(booking.booking_code)}</span>
                    </h1>
                    
                    <p className="text-lg text-gray-600 mb-8">
                        لطفاً جزئیات رزرو خود را بررسی کرده و روش پرداخت را انتخاب کنید.
                    </p>

                    {/* Status Alert */}
                    {booking.status !== 'pending' && (
                         <div className="mb-6 p-4 bg-red-100 border border-red-300 text-red-700 rounded-lg text-lg font-bold">
                            وضعیت رزرو: {getStatusLabel(booking.status)}
                            <p className="font-normal text-sm pt-1">این رزرو در وضعیت "{getStatusLabel(booking.status)}" قرار دارد و قابل پرداخت آنلاین نیست.</p>
                        </div>
                    )}
                    
                    {/* 1. Reservation Summary and Principal Guest Info (Single Column) */}
                    <div className="space-y-6">
                        
                        {/* A. Summary Card */}
                        <DetailCard title="خلاصه رزرو" icon={Hotel}>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm font-medium border-b pb-4">
                                <p><strong>کد رزرو:</strong> {toPersianDigits(booking.booking_code)}</p>
                                <p><strong>هتل:</strong> {booking.hotel_name}</p>
                                <p><strong>ورود:</strong> {toPersianDigits(booking.check_in)}</p>
                                <p><strong>خروج:</strong> {toPersianDigits(booking.check_out)}</p>
                            </div>
                            
                            <h3 className="font-semibold text-lg pt-2 border-b pb-2 text-gray-700">اتاق‌های رزرو شده:</h3>
                            <ul className="space-y-3 pt-2">
                                {booking.booking_rooms.map((room, index) => (
                                    <li key={index} className="p-3 bg-blue-50 rounded-lg shadow-sm border border-blue-200">
                                        <p className="font-bold text-gray-800">{room.room_type_name}</p>
                                        <p className="text-sm text-gray-600">
                                            {room.quantity} اتاق / سرویس {room.board_type}
                                            <span className="mr-4">|</span>
                                            {room.adults > 0 && <span>{toPersianDigits(room.adults)} نفر اضافه</span>}
                                            {room.children > 0 && <span className="mr-2">و {toPersianDigits(room.children)} کودک</span>}
                                        </p>
                                        {room.extra_requests && <p className="text-xs text-gray-500 mt-1">درخواست: {room.extra_requests}</p>}
                                    </li>
                                ))}
                            </ul>
                            
                            <div className="mt-6 border-t pt-4 flex justify-between items-center bg-green-50 p-3 rounded-lg">
                                <span className="font-bold text-2xl text-red-600">مبلغ قابل پرداخت:</span>
                                <span className="font-bold text-3xl text-red-600">
                                    {toPersianDigits(booking.total_price.toLocaleString('fa'))} تومان
                                </span>
                            </div>
                        </DetailCard>

                        {/* B. Principal Guest Card */}
                        <DetailCard title="اطلاعات سرپرست رزرو" icon={User}>
                            {principalGuest ? (
                                <GuestDetailSection guest={principalGuest} />
                            ) : (
                                <p className="text-red-500">اطلاعات سرپرست یافت نشد.</p>
                            )}
                            
                            {/* Optional: Show count of other guests but not details */}
                            {booking.total_guests > 1 && (
                                <p className="mt-4 border-t pt-3 text-sm text-gray-500">
                                    این رزرو شامل {toPersianDigits(booking.total_guests - 1)} میهمان دیگر نیز می‌باشد.
                                </p>
                            )}

                        </DetailCard>

                        {/* 2. Payment Method Selection */}
                        <DetailCard title="انتخاب روش پرداخت" icon={CreditCard}>
                             {paymentError && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">{paymentError}</div>}
                             
                             <div className="space-y-4">
                                {availablePaymentMethods.map(method => (
                                    <label 
                                        key={method.value} 
                                        className={`flex items-center p-4 rounded-lg cursor-pointer transition-all ${
                                            // Conditional styling for selected/disabled state
                                            selectedPaymentMethod === method.value 
                                                ? 'bg-indigo-50 ring-2 ring-indigo-500' 
                                                : (method.disabledInUI ? 'bg-gray-200 opacity-70 cursor-not-allowed' : 'bg-gray-50 hover:bg-gray-100')
                                        }`}
                                    >
                                        <input 
                                            type="radio" 
                                            name="payment" 
                                            value={method.value} 
                                            checked={selectedPaymentMethod === method.value} 
                                            onChange={() => setSelectedPaymentMethod(method.value)} 
                                            className="ml-3 w-5 h-5 text-indigo-600 focus:ring-indigo-500"
                                            disabled={booking.status !== 'pending' || method.disabledInUI} 
                                        />
                                        <span className="text-lg font-medium">{method.label}</span>
                                        {method.disabledInUI && <span className="mr-2 text-red-600 text-sm font-semibold">(غیرفعال)</span>}
                                    </label>
                                ))}
                             </div>
                             
                             <Button 
                                onClick={handleInitiatePayment}
                                className="mt-6 w-full py-3 text-xl"
                                disabled={loadingPayment || booking.status !== 'pending'}
                             >
                                {loadingPayment ? 'در حال اتصال...' : `پرداخت نهایی مبلغ ${toPersianDigits(booking.total_price.toLocaleString('fa'))} تومان`}
                             </Button>
                        </DetailCard>

                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
};

export default PaymentPage;
