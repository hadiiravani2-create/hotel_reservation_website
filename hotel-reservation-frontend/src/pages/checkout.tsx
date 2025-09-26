// src/pages/checkout.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../hooks/useAuth';
import { calculateMultiPrice } from '../api/pricingService';
import { createBooking, initiatePayment } from '../api/reservationService';
import { Button } from '../components/ui/Button';
import { GuestInputForm } from '../components/GuestInputForm';
// فرض می‌کنیم داده‌های اتاق انتخاب شده از Router Query یا Context آمده است
// مثال: bookingDetails = { rooms: [{ room_type_id: 1, quantity: 2, adults: 1, children: 0, base_capacity: 2, board_type_id: 1 }] }

const CheckoutPage: React.FC = () => {
    const router = useRouter();
    const { isAuthenticated, user } = useAuth();
    
    // شبیه‌سازی داده‌های رزرو از مرحله قبل (Search Results)
    const [bookingDetails, setBookingDetails] = useState<any>({
        check_in: '1404-08-10', // مثال
        check_out: '1404-08-15', // مثال
        // این داده باید شامل total_price باشد که از API نهایی شده است
        rooms: [{ room_type_id: 1, board_type_id: 1, quantity: 1, adults: 1, children: 0, base_capacity: 2, price_quote: 5000000 }] 
    });

    const [guestData, setGuestData] = useState<any[]>([]);
    const [paymentMethod, setPaymentMethod] = useState<'online' | 'credit'>('online');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [finalPrice, setFinalPrice] = useState(bookingDetails.rooms[0].price_quote); // قیمت نهایی قبلی
    
    // محاسبه تعداد کل میهمانانی که باید فرم برای آن‌ها پر شود
    const totalGuestsCount = useMemo(() => {
        return bookingDetails.rooms.reduce((total: number, room: any) => {
            return total + (room.base_capacity * room.quantity) + room.adults + room.children;
        }, 0);
    }, [bookingDetails.rooms]);

    useEffect(() => {
        // اطمینان از اینکه آرایه میهمانان به اندازه ظرفیت است
        if (guestData.length !== totalGuestsCount) {
             setGuestData(Array(totalGuestsCount).fill(null).map(() => ({})));
        }
        
        // *نکته UX:* اگر کاربر وارد نشده، به صفحه ورود هدایت شود
        if (!isAuthenticated && !loading) { 
            router.push('/login?next=/checkout');
        }
    }, [totalGuestsCount, isAuthenticated]);

    const handleGuestChange = (index: number, data: any) => {
        const newGuestData = [...guestData];
        newGuestData[index] = data;
        setGuestData(newGuestData);
    };

    // اعتبارسنجی ساده
    const validateGuests = () => {
        return guestData.every(guest => 
            guest.first_name && guest.last_name && guest.phone_number
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        
        if (!validateGuests()) {
            setError("لطفاً اطلاعات تمام میهمانان را کامل و صحیح وارد کنید.");
            return;
        }

        setLoading(true);

        try {
            // ۱. تایید نهایی قیمت (Re-validate Price)
            // این Payload شبیه به PriceQuoteMultiRoomInputSerializer است
            const priceCheckPayload = {
                check_in: bookingDetails.check_in,
                check_out: bookingDetails.check_out,
                booking_rooms: bookingDetails.rooms.map((r:any) => ({
                    room_type_id: r.room_type_id,
                    board_type_id: r.board_type_id,
                    quantity: r.quantity,
                    extra_adults: r.adults,
                    children_count: r.children,
                })),
                // user_id: user?.id, // برای محاسبه تخفیف آژانس اگر کاربر آژانسی است
            };
            
            const { total_price: confirmedPrice } = await calculateMultiPrice(priceCheckPayload);

            // اگر قیمت تغییر کرده بود، به کاربر هشدار داده شود (UX)
            if (confirmedPrice !== finalPrice) {
                alert(`اخطار: قیمت به‌روزرسانی شد. قیمت نهایی جدید: ${confirmedPrice.toLocaleString('fa')} تومان.`);
                setFinalPrice(confirmedPrice);
                setLoading(false);
                return;
            }

            // ۲. ثبت نهایی رزرو
            const bookingPayload = {
                check_in: bookingDetails.check_in,
                check_out: bookingDetails.check_out,
                booking_rooms: priceCheckPayload.booking_rooms.map((r:any) => ({ ...r, board_type_id: r.board_type_id })),
                guests: guestData,
                payment_method: paymentMethod,
            };

            const bookingResponse = await createBooking(bookingPayload);
            
            // ۳. شروع پرداخت
            if (paymentMethod === 'online' && bookingResponse.booking_code) {
                const paymentResponse = await initiatePayment(bookingResponse.booking_code);
                // هدایت به درگاه
                window.location.href = paymentResponse.redirect_url;
            } else {
                 // اگر پرداخت اعتباری یا حضوری بود
                router.push(`/booking-success?code=${bookingResponse.booking_code}`);
            }

        } catch (err: any) {
            setError(err.response?.data?.error || 'خطا در ثبت رزرو یا ارتباط با سرور.');
        } finally {
            setLoading(false);
        }
    };
    
    // UX: نمایش خلاصه رزرو
    const CheckoutSummary = () => (
        <div className="bg-blue-50 p-6 rounded-lg border border-blue-200" dir="rtl">
            <h3 className="text-xl font-bold mb-4 text-blue-800">خلاصه رزرو</h3>
            <p><strong>تاریخ:</strong> {bookingDetails.check_in} تا {bookingDetails.check_out}</p>
            <p className="mt-4 font-bold text-2xl text-red-600">قیمت نهایی: {finalPrice.toLocaleString('fa')} تومان</p>
        </div>
    );


    return (
        <div className="container mx-auto p-8" dir="rtl">
            <h1 className="text-4xl font-extrabold mb-8 text-gray-900">نهایی‌سازی رزرو</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* ستون راست: خلاصه و پرداخت */}
                <div className="md:col-span-1 order-1 md:order-2">
                    <CheckoutSummary />
                    
                    {/* انتخاب متد پرداخت */}
                    <div className="mt-6 p-4 bg-white rounded-lg shadow">
                         <h4 className="font-semibold mb-3">روش پرداخت</h4>
                         <label className="block mb-2">
                             <input type="radio" name="payment" value="online" checked={paymentMethod === 'online'} onChange={() => setPaymentMethod('online')} className="ml-2"/>
                             پرداخت آنلاین (درگاه بانکی)
                         </label>
                         {/* نمایش سایر گزینه‌ها بر اساس نقش کاربر (مثلاً آژانس اعتباری) */}
                         <label className="block">
                             <input type="radio" name="payment" value="credit" checked={paymentMethod === 'credit'} onChange={() => setPaymentMethod('credit')} className="ml-2"/>
                             پرداخت اعتباری (مخصوص آژانس)
                         </label>
                    </div>
                </div>

                {/* ستون چپ: فرم میهمانان و دکمه نهایی */}
                <div className="md:col-span-2 order-2 md:order-1">
                    <h2 className="text-2xl font-bold mb-4">اطلاعات میهمانان ({totalGuestsCount} نفر)</h2>
                    
                    {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">{error}</div>}

                    <form onSubmit={handleSubmit}>
                        {/* تولید فرم‌های داینامیک */}
                        {Array.from({ length: totalGuestsCount }).map((_, index) => (
                            <GuestInputForm key={index} index={index} onChange={handleGuestChange} />
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