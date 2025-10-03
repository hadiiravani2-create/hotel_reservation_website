// src/pages/checkout.tsx v1.0.2
import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../hooks/useAuth';
// Import types from pricingService
import { calculateMultiPrice, MultiPriceData } from '../api/pricingService'; 
import { createBooking, initiatePayment, BookingPayload, GuestPayload } from '../api/reservationService'; // Import types
import { Button } from '../components/ui/Button';
import { GuestInputForm } from '../components/GuestInputForm';

// Interface for a single room detail in the booking
interface RoomBookingDetail {
  room_type_id: number;
  board_type_id: number;
  quantity: number;
  adults: number; // Extra adults count
  children: number;
  base_capacity: number;
  price_quote: number;
}

// Interface for the overall booking data structure
interface BookingDetails {
  check_in: string;
  check_out: string;
  rooms: RoomBookingDetail[];
}

const CheckoutPage: React.FC = () => {
    const router = useRouter();
    // FIX: Change 'loading' to 'isLoading' to match the useAuth hook return
    const { isAuthenticated, isLoading: authLoading } = useAuth(); 
    
    // Use the defined interface (Fixes 'any' at line 34)
    const [bookingDetails] = useState<BookingDetails>({
        check_in: '1404-08-10', // Example
        check_out: '1404-08-15', // Example
        // This data should contain the final price confirmed by API
        rooms: [{ room_type_id: 1, board_type_id: 1, quantity: 1, adults: 1, children: 0, base_capacity: 2, price_quote: 5000000 }] 
    });

    // Use the defined interface for guestData
    const [guestData, setGuestData] = useState<Partial<GuestPayload>[]>([]); 
    const [paymentMethod, setPaymentMethod] = useState<'online' | 'credit'>('online');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [finalPrice, setFinalPrice] = useState(bookingDetails.rooms[0].price_quote);
    
    // Calculate total guests needed to fill the form
    const totalGuestsCount = useMemo(() => {
        return bookingDetails.rooms.reduce((total: number, room: RoomBookingDetail) => {
            return total + room.quantity * (room.base_capacity + room.adults + room.children);
        }, 0);
    }, [bookingDetails.rooms]);

    useEffect(() => {
        // Initialize guestData array with correct length if needed
        // Fixed: Added guestData.length to dependencies (Fixes exhaustive-deps at line 85)
        if (guestData.length !== totalGuestsCount) { 
             setGuestData(Array(totalGuestsCount).fill(null).map(() => ({} as Partial<GuestPayload>)));
        }
        
        // UX: Redirect if user is not authenticated
        if (!isAuthenticated && !authLoading) { 
            router.push('/login?next=/checkout');
        }
    }, [totalGuestsCount, isAuthenticated, authLoading, router, guestData.length]); 

    const handleGuestChange = (index: number, data: Partial<GuestPayload>) => { 
        const newGuestData = [...guestData];
        newGuestData[index] = data;
        setGuestData(newGuestData); 
    };

    // Simple validation logic
    const validateGuests = () => {
        return guestData.every((guest: Partial<GuestPayload>) => 
            guest?.first_name && guest?.last_name && guest?.phone_number
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
            // 1. Re-validate Price
            // Use MultiPriceData interface
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

            // Price change alert
            if (confirmedPrice !== finalPrice) {
                alert(`اخطار: قیمت به‌روزرسانی شد. قیمت نهایی جدید: ${confirmedPrice.toLocaleString('fa')} تومان.`);
                setFinalPrice(confirmedPrice);
                setLoading(false);
                return;
            }

            // 2. Final booking submission
            // Use BookingPayload interface
            const bookingPayload: BookingPayload = {
                check_in: bookingDetails.check_in,
                check_out: bookingDetails.check_out,
                booking_rooms: priceCheckPayload.booking_rooms.map((r) => ({ 
                    ...r, 
                    adults: r.extra_adults, // Map extra_adults back to adults in the final payload
                    children: r.children_count,
                })),
                guests: guestData as GuestPayload[], // Cast to required full type (assuming validation passed)
                payment_method: paymentMethod,
            };

            const bookingResponse = await createBooking(bookingPayload);
            
            // 3. Initiate payment
            if (paymentMethod === 'online' && bookingResponse.booking_code) {
                const paymentResponse = await initiatePayment(bookingResponse.booking_code);
                // Redirect to gateway
                window.location.href = paymentResponse.redirect_url;
            } else {
                 // Credit or in-person payment
                router.push(`/booking-success?code=${bookingResponse.booking_code}`);
            }

        } catch (err: unknown) { // Fixed: Using unknown instead of any for error object (Fixes 'any' at line 156)
            const axiosError = err as { response?: { data?: { error?: string } }, message?: string };
            setError(axiosError.response?.data?.error || axiosError.message || 'خطا در ثبت رزرو یا ارتباط با سرور.');
        } finally {
            setLoading(false);
        }
    };
    
    // UX: Booking summary display
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
                {/* Right Column: Summary and Payment */}
                <div className="md:col-span-1 order-1 md:order-2">
                    <CheckoutSummary />
                    
                    {/* Payment method selection */}
                    <div className="mt-6 p-4 bg-white rounded-lg shadow">
                         <h4 className="font-semibold mb-3">روش پرداخت</h4>
                         <label className="block mb-2">
                             <input type="radio" name="payment" value="online" checked={paymentMethod === 'online'} onChange={() => setPaymentMethod('online')} className="ml-2"/>
                             پرداخت آنلاین (درگاه بانکی)
                         </label>
                         {/* Display other options based on user role (e.g., Credit Agency) */}
                         <label className="block">
                             <input type="radio" name="payment" value="credit" checked={paymentMethod === 'credit'} onChange={() => setPaymentMethod('credit')} className="ml-2"/>
                             پرداخت اعتباری (مخصوص آژانس)
                         </label>
                    </div>
                </div>

                {/* Left Column: Guest Form and Final Button */}
                <div className="md:col-span-2 order-2 md:order-1">
                    <h2 className="text-2xl font-bold mb-4">اطلاعات میهمانان ({totalGuestsCount} نفر)</h2>
                    
                    {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">{error}</div>}

                    <form onSubmit={handleSubmit}>
                        {/* Dynamic form generation */}
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
