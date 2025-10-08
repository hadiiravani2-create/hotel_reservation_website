// src/pages/checkout.tsx v1.0.3
// FIX: The component now dynamically loads booking details from URL query parameters instead of using static data.
import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../hooks/useAuth';
import { calculateMultiPrice, MultiPriceData } from '../api/pricingService';
import { createBooking, initiatePayment, BookingPayload, GuestPayload } from '../api/reservationService';
import { Button } from '../components/ui/Button';
import { GuestInputForm } from '../components/GuestInputForm';
import moment from 'moment-jalaali'; // Import moment-jalaali for date calculations

interface RoomBookingDetail {
  room_type_id: number;
  board_type_id: number;
  quantity: number;
  adults: number;
  children: number;
  base_capacity: number;
  price_quote: number;
}

interface BookingDetails {
  check_in: string;
  check_out: string;
  rooms: RoomBookingDetail[];
}

const CheckoutPage: React.FC = () => {
    const router = useRouter();
    const { isAuthenticated, isLoading: authLoading } = useAuth();
    
    // Initialize bookingDetails as null to be populated from URL
    const [bookingDetails, setBookingDetails] = useState<BookingDetails | null>(null);

    const [guestData, setGuestData] = useState<Partial<GuestPayload>[]>([]);
    const [paymentMethod, setPaymentMethod] = useState<'online' | 'credit'>('online');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [finalPrice, setFinalPrice] = useState(0);

    // Effect to parse URL and set booking details
    useEffect(() => {
        if (router.isReady) {
            const { check_in, duration, roomId, roomPrice } = router.query;

            if (typeof check_in === 'string' && typeof duration === 'string' && typeof roomId === 'string') {
                const checkOutDate = moment(check_in, 'jYYYY-jMM-jDD').add(parseInt(duration, 10), 'days').format('jYYYY-jMM-jDD');
                
                const initialDetails: BookingDetails = {
                    check_in: check_in,
                    check_out: checkOutDate,
                    rooms: [{
                        room_type_id: parseInt(roomId, 10),
                        board_type_id: 1, // Default value
                        quantity: 1,      // Default value
                        adults: 0,        // Default value
                        children: 0,      // Default value
                        base_capacity: 2, // This should ideally come from the API
                        price_quote: roomPrice ? parseFloat(roomPrice as string) : 5000000 // Placeholder price
                    }]
                };
                setBookingDetails(initialDetails);
                setFinalPrice(initialDetails.rooms[0].price_quote);
            }
        }
    }, [router.isReady, router.query]);


    const totalGuestsCount = useMemo(() => {
        if (!bookingDetails) return 0;
        return bookingDetails.rooms.reduce((total: number, room: RoomBookingDetail) => {
            return total + room.quantity * (room.base_capacity + room.adults + room.children);
        }, 0);
    }, [bookingDetails]);

    useEffect(() => {
        if (bookingDetails && guestData.length !== totalGuestsCount) {
             setGuestData(Array(totalGuestsCount).fill(null).map(() => ({} as Partial<GuestPayload>)));
        }
        
        if (!isAuthenticated && !authLoading) {
            router.push('/login?next=/checkout');
        }
    }, [totalGuestsCount, isAuthenticated, authLoading, router, guestData.length, bookingDetails]);

    const handleGuestChange = (index: number, data: Partial<GuestPayload>) => {
        const newGuestData = [...guestData];
        newGuestData[index] = data;
        setGuestData(newGuestData);
    };

    const validateGuests = () => {
        return guestData.every((guest: Partial<GuestPayload>) =>
            guest?.first_name && guest?.last_name && guest?.phone_number
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        
        if (!bookingDetails) {
            setError("اطلاعات رزرو بارگذاری نشده است.");
            return;
        }

        if (!validateGuests()) {
            setError("لطفاً اطلاعات تمام میهمانان را کامل و صحیح وارد کنید.");
            return;
        }

        setLoading(true);

        try {
            const priceCheckPayload: MultiPriceData = {
                check_in: bookingDetails.check_in,
                check_out: bookingDetails.check_out,
                booking_rooms: bookingDetails.rooms.map((r: RoomBookingDetail) => ({
                    room_type_id: r.room_type_id,
                    board_type_id: r.board_type_id,
                    quantity: r.quantity,
                    extra_adults: r.adults,
                    children_count: r.children,
                })),
            };
            
            const { total_price: confirmedPrice } = await calculateMultiPrice(priceCheckPayload);

            if (confirmedPrice !== finalPrice) {
                alert(`اخطار: قیمت به‌روزرسانی شد. قیمت نهایی جدید: ${confirmedPrice.toLocaleString('fa')} تومان.`);
                setFinalPrice(confirmedPrice);
                setLoading(false);
                return;
            }

            const bookingPayload: BookingPayload = {
                check_in: bookingDetails.check_in,
                check_out: bookingDetails.check_out,
                booking_rooms: priceCheckPayload.booking_rooms.map((r) => ({
                    ...r,
                    adults: r.extra_adults,
                    children: r.children_count,
                })),
                guests: guestData as GuestPayload[],
                payment_method: paymentMethod,
            };

            const bookingResponse = await createBooking(bookingPayload);
            
            if (paymentMethod === 'online' && bookingResponse.booking_code) {
                const paymentResponse = await initiatePayment(bookingResponse.booking_code);
                window.location.href = paymentResponse.redirect_url;
            } else {
                router.push(`/booking-success?code=${bookingResponse.booking_code}`);
            }

        } catch (err: unknown) {
            const axiosError = err as { response?: { data?: { error?: string } }, message?: string };
            setError(axiosError.response?.data?.error || axiosError.message || 'خطا در ثبت رزرو یا ارتباط با سرور.');
        } finally {
            setLoading(false);
        }
    };
    
    const CheckoutSummary = () => (
        <div className="bg-blue-50 p-6 rounded-lg border border-blue-200" dir="rtl">
            <h3 className="text-xl font-bold mb-4 text-blue-800">خلاصه رزرو</h3>
            {bookingDetails ? (
                <>
                    <p><strong>تاریخ:</strong> {bookingDetails.check_in} تا {bookingDetails.check_out}</p>
                    <p className="mt-4 font-bold text-2xl text-red-600">قیمت نهایی: {finalPrice.toLocaleString('fa')} تومان</p>
                </>
            ) : (
                <p>در حال بارگذاری اطلاعات رزرو...</p>
            )}
        </div>
    );

    if (!bookingDetails) {
        return <div className="container mx-auto p-8" dir="rtl">در حال بارگذاری اطلاعات رزرو...</div>;
    }

    return (
        <div className="container mx-auto p-8" dir="rtl">
            <h1 className="text-4xl font-extrabold mb-8 text-gray-900">نهایی‌سازی رزرو</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-1 order-1 md:order-2">
                    <CheckoutSummary />
                    
                    <div className="mt-6 p-4 bg-white rounded-lg shadow">
                         <h4 className="font-semibold mb-3">روش پرداخت</h4>
                         <label className="block mb-2">
                             <input type="radio" name="payment" value="online" checked={paymentMethod === 'online'} onChange={() => setPaymentMethod('online')} className="ml-2"/>
                             پرداخت آنلاین (درگاه بانکی)
                         </label>
                         <label className="block">
                             <input type="radio" name="payment" value="credit" checked={paymentMethod === 'credit'} onChange={() => setPaymentMethod('credit')} className="ml-2"/>
                             پرداخت اعتباری (مخصوص آژانس)
                         </label>
                    </div>
                </div>

                <div className="md:col-span-2 order-2 md:order-1">
                    <h2 className="text-2xl font-bold mb-4">اطلاعات میهمانان ({totalGuestsCount} نفر)</h2>
                    
                    {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">{error}</div>}

                    <form onSubmit={handleSubmit}>
                        {Array.from({ length: totalGuestsCount }).map((_, index) => (
                            <GuestInputForm
                              key={index}
                              index={index}
                              onChange={handleGuestChange}
                            />
                        ))}
                        
                        <div className="mt-8">
                            <Button type="submit" disabled={loading}>
                                {loading ? 'در حال ثبت و پرداخت...' : `تأیید و ${paymentMethod === 'online' ? 'پرداخت' : 'ثبت اعتباری'}`}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CheckoutPage;
