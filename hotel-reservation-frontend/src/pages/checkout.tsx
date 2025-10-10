// src/pages/checkout.tsx
// version: 2.0.0
// Feature: Switched from URL query params to LocalStorage ('localCart') for multi-room/multi-board booking.
// Feature: Enhanced CheckoutSummary to display detailed list of rooms in the cart.

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../hooks/useAuth';
import { calculateMultiPrice, MultiPriceData } from '../api/pricingService';
import { createBooking, initiatePayment, BookingPayload, GuestPayload } from '../api/reservationService';
import { Button } from '../components/ui/Button';
import { GuestInputForm } from '../components/GuestInputForm';
import moment from 'moment-jalaali';
import { CartItem } from '../types/hotel'; // Import CartItem for cart logic

// --- New Interface based on CartItem and API needs ---
interface RoomBookingDetail {
    room_type_id: number;
    board_type_id: number;
    quantity: number;
    adults: number; // extra persons (maps to 'extra_adults' in price check, but 'adults' in BookingPayload)
    children: number;
    price_per_room_total: number; // Total price for this room/board combination for the entire duration
    
    // Display fields (not sent to API directly, but needed for Summary)
    room_name: string;
    board_name: string;
    check_in: string; // Keep check_in/out/duration in the room details for context
    check_out: string; 
    base_capacity: number;
    extra_adults_count: number; // Placeholder for actual extra adults/children data from CartItem
    children_count: number;
}

interface BookingDetails {
    check_in: string;
    check_out: string;
    rooms: RoomBookingDetail[];
    // Include initial total price from cart for quick display
    cart_total_price: number; 
    total_base_capacity: number; // Total capacity across all rooms
}

const CHECKOUT_CART_KEY = 'localCart';
const CHECKOUT_DATES_KEY = 'localDates';

const CheckoutPage: React.FC = () => {
    const router = useRouter();
    const { isAuthenticated, isLoading: authLoading } = useAuth();
    
    const [bookingDetails, setBookingDetails] = useState<BookingDetails | null>(null);
    const [guestData, setGuestData] = useState<Partial<GuestPayload>[]>([]);
    const [paymentMethod, setPaymentMethod] = useState<'online' | 'credit'>('online');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [finalPrice, setFinalPrice] = useState(0); // Price confirmed by API

    // Utility function to load data from LocalStorage
    const loadBookingDetailsFromCart = () => {
        try {
            const cartItemsJson = localStorage.getItem(CHECKOUT_CART_KEY);
            const datesJson = localStorage.getItem(CHECKOUT_DATES_KEY);
            
            if (!cartItemsJson || !datesJson) {
                setError("اطلاعات سبد خرید یا تاریخ اقامت پیدا نشد. لطفاً از صفحه هتل مجدداً اقدام کنید.");
                return null;
            }

            const cartItems: CartItem[] = JSON.parse(cartItemsJson);
            const dates: { check_in: string, duration: number } = JSON.parse(datesJson);

            if (cartItems.length === 0) {
                 setError("سبد خرید خالی است.");
                 return null;
            }

            const checkOutDate = moment(dates.check_in, 'jYYYY-jMM-jDD').add(dates.duration, 'days').format('jYYYY-jMM-jDD');

            let totalCapacity = 0;
            let cartTotalPrice = 0;
            
            const rooms: RoomBookingDetail[] = cartItems.map(item => {
                // NOTE: Since the cart items from the hotel page don't include base_capacity,
                // adults (extra), or children counts, we use placeholder logic.
                // In a real scenario, this data needs to be passed from the RoomCard to the cart.
                // We assume room_type base_capacity is 2 for safety, and 0 for extras/children for now.
                // This is a MAJOR ASSUMPTION that will fail if the backend strictly validates capacity!
                const assumedBaseCapacity = 2; 
                totalCapacity += item.quantity * assumedBaseCapacity;
                cartTotalPrice += item.total_price;

                return {
                    room_type_id: item.room.id,
                    board_type_id: item.selected_board.id,
                    quantity: item.quantity,
                    // !!! IMPORTANT: These fields should come from the cart, not hardcoded 0.
                    // Assuming for now they were not part of the CartItem payload from the previous step.
                    adults: 0, 
                    children: 0,
                    
                    price_per_room_total: item.total_price, // Total price for all nights/this room combination
                    room_name: item.room.name,
                    board_name: item.selected_board.name,
                    check_in: dates.check_in,
                    check_out: checkOutDate,
                    base_capacity: assumedBaseCapacity,
                    extra_adults_count: 0,
                    children_count: 0,
                };
            });
            
            setFinalPrice(cartTotalPrice); // Set initial price from cart
            return {
                check_in: dates.check_in,
                check_out: checkOutDate,
                rooms: rooms,
                cart_total_price: cartTotalPrice,
                total_base_capacity: totalCapacity,
            };

        } catch (e) {
            console.error("Error parsing cart data:", e);
            setError("خطا در خواندن اطلاعات رزرو.");
            return null;
        }
    };
    
    // Initial data load effect
    useEffect(() => {
        if (router.isReady) {
            const details = loadBookingDetailsFromCart();
            if (details) {
                setBookingDetails(details);
            }
        }
    }, [router.isReady]);


    // Calculate total guests needed for forms
    const totalGuestsCount = useMemo(() => {
        if (!bookingDetails) return 0;
        // Total guests = Sum of (quantity * (base_capacity + adults + children))
        return bookingDetails.rooms.reduce((total: number, room: RoomBookingDetail) => {
            return total + room.quantity * (room.base_capacity + room.adults + room.children);
        }, 0);
    }, [bookingDetails]);

    // Guest data setup and Auth redirection
    useEffect(() => {
        if (bookingDetails && guestData.length !== totalGuestsCount) {
             setGuestData(Array(totalGuestsCount).fill(null).map(() => ({} as Partial<GuestPayload>)));
        }
        
        if (!isAuthenticated && !authLoading) {
             router.push('/login?next=/checkout');
        }
    }, [totalGuestsCount, isAuthenticated, authLoading, router, guestData.length, bookingDetails]);

    // ... (handleGuestChange, validateGuests remain mostly the same) ...
    const handleGuestChange = (index: number, data: Partial<GuestPayload>) => {
        const newGuestData = [...guestData];
        newGuestData[index] = data;
        setGuestData(newGuestData);
    };

    const validateGuests = () => {
        // Validation logic needs to be more robust for foreigners vs Iranians
        return guestData.every((guest: Partial<GuestPayload>) => {
            if (!guest?.first_name || !guest?.last_name || !guest?.phone_number) {
                return false;
            }
            // Check for National ID (if not foreign) OR Passport/Nationality (if foreign)
            if (guest.is_foreign) {
                return guest.passport_number && guest.nationality;
            } else {
                return guest.national_id;
            }
        });
    };
    // ... (handleSubmit remains mostly the same, only minor adjustments for the new data structure) ...
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
            // 1. Prepare Payload for Final Price Check (for MultiPriceData API)
            const priceCheckPayload: MultiPriceData = {
                check_in: bookingDetails.check_in,
                check_out: bookingDetails.check_out,
                booking_rooms: bookingDetails.rooms.map((r: RoomBookingDetail) => ({
                    room_type_id: r.room_type_id,
                    board_type_id: r.board_type_id,
                    quantity: r.quantity,
                    extra_adults: r.adults, // Maps to adults in RoomBookingDetail
                    children_count: r.children, // Maps to children in RoomBookingDetail
                })),
            };
            
            // 2. Run Price Check
            const { total_price: confirmedPrice } = await calculateMultiPrice(priceCheckPayload);

            if (confirmedPrice !== finalPrice) {
                alert(`اخطار: قیمت به‌روزرسانی شد. قیمت نهایی جدید: ${confirmedPrice.toLocaleString('fa')} تومان.`);
                setFinalPrice(confirmedPrice);
                setLoading(false);
                return;
            }

            // 3. Prepare Payload for Booking Submission (for CreateBooking API)
            const bookingPayload: BookingPayload = {
                check_in: bookingDetails.check_in,
                check_out: bookingDetails.check_out,
                booking_rooms: priceCheckPayload.booking_rooms.map((r) => ({
                    ...r,
                    // API expects 'adults' and 'children', not 'extra_adults'/'children_count'
                    adults: r.extra_adults, 
                    children: r.children_count,
                })),
                guests: guestData as GuestPayload[],
                payment_method: paymentMethod,
                // NOTE: agency_id is omitted, relying on the view to check user's agency affiliation
            };

            // 4. Submit Booking
            const bookingResponse = await createBooking(bookingPayload);
            
            // 5. Handle Payment Redirection
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
                    <p className="mb-2"><strong>تاریخ ورود:</strong> {bookingDetails.check_in}</p>
                    <p className="mb-4"><strong>تاریخ خروج:</strong> {bookingDetails.check_out}</p>
                    
                    <ul className="space-y-3 border-t pt-3 mb-4">
                        {bookingDetails.rooms.map((room, index) => (
                            <li key={index} className="text-sm border-b pb-2">
                                <p className="font-semibold text-gray-800">{room.room_name}</p>
                                <p className="text-gray-600">
                                    تعداد: {room.quantity} اتاق / سرویس: {room.board_name}
                                </p>
                                <p className="font-medium text-gray-700">
                                    قیمت کل: {room.price_per_room_total.toLocaleString('fa')} تومان
                                </p>
                            </li>
                        ))}
                    </ul>

                    <p className="mt-4 font-bold text-2xl text-red-600 border-t pt-4">
                        قیمت نهایی: {finalPrice.toLocaleString('fa')} تومان
                    </p>
                </>
            ) : (
                <p>در حال بارگذاری اطلاعات رزرو...</p>
            )}
        </div>
    );

    if (!bookingDetails && !error) {
        return <div className="container mx-auto p-8" dir="rtl">در حال بارگذاری اطلاعات رزرو...</div>;
    }
    
    // If error is set due to missing cart data
    if (error && !bookingDetails) {
        return <div className="container mx-auto p-8" dir="rtl">
            <h1 className="text-4xl font-extrabold mb-8 text-red-600">خطا در فرآیند رزرو</h1>
            <p className="text-lg text-gray-700">{error}</p>
            <Button onClick={() => router.push('/')} className='mt-6'>بازگشت به صفحه اصلی</Button>
        </div>
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
                            <Button type="submit" disabled={loading || !bookingDetails}>
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
