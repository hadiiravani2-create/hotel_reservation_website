// src/pages/checkout.tsx
// version: 2.1.14
// Feature: Implemented Guest Booking: removed mandatory login redirect and passed unauthenticated status to GuestInputForm.
// Fix: Ensured 'wants_to_register' flag from GuestInputForm is included in the final booking payload.

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../hooks/useAuth';
import { calculateMultiPrice, MultiPriceData } from '../api/pricingService';
import { createBooking, initiatePayment, BookingPayload, GuestPayload } from '../api/reservationService';
import { Button } from '../components/ui/Button';
import GuestInputForm from '../components/GuestInputForm'; 
import { Input } from '../components/ui/Input'; 
import moment from 'moment-jalaali';
import { CartItem } from '../types/hotel'; 

// Utility function to convert English digits to Persian digits
const toPersianDigits = (str: string | number) => {
    return String(str).replace(/\d/g, (d) => ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'][parseInt(d)]);
};

// --- Interface with new fields ---
interface RoomBookingDetail {
    room_type_id: number;
    board_type_id: number;
    quantity: number;
    adults: number; // extra persons
    children: number;
    price_per_room_total: number;
    
    // Display fields
    room_name: string;
    board_name: string;
    check_in: string; 
    check_out: string; 
    base_capacity: number;
    extra_adults_count: number; 
    children_count: number;

    // New field for extra requests (Frontend only for data gathering)
    extra_requests: string;
}

interface BookingDetails {
    check_in: string;
    check_out: string;
    rooms: RoomBookingDetail[];
    cart_total_price: number; 
    total_base_capacity: number; 
}

// Defining a type for Payment methods explicitly
type PaymentMethod = 'online' | 'credit' | 'in_person' | 'card_to_card';

const CHECKOUT_CART_KEY = 'localCart';
const CHECKOUT_DATES_KEY = 'localDates';

const CheckoutPage: React.FC = () => {
    const router = useRouter();
    const { isAuthenticated, isLoading: authLoading, user } = useAuth(); 
    // NEW: Determine if the user is a guest (unauthenticated)
    const isUnauthenticated = !isAuthenticated && !authLoading;
    const isAgencyUser = !!user?.agency_role;
    
    const [bookingDetails, setBookingDetails] = useState<BookingDetails | null>(null);
    const [guestData, setGuestData] = useState<Partial<GuestPayload>[]>([]);
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('online');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [finalPrice, setFinalPrice] = useState(0); 
    const [rulesAccepted, setRulesAccepted] = useState(false); 
    
    // State for per-room extra requests
    const [roomExtraRequests, setRoomExtraRequests] = useState<string[]>([]);
    
    // New state for managing visibility of secondary guests
    const [showSecondaryGuests, setShowSecondaryGuests] = useState(false);


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
                const assumedBaseCapacity = 2; 
                totalCapacity += item.quantity * assumedBaseCapacity;
                cartTotalPrice += item.total_price;

                return {
                    room_type_id: item.room.id,
                    board_type_id: item.selected_board.id,
                    quantity: item.quantity,
                    adults: 0, 
                    children: 0,
                    
                    price_per_room_total: item.total_price, 
                    room_name: item.room.name,
                    board_name: item.selected_board.name,
                    check_in: dates.check_in,
                    check_out: checkOutDate,
                    base_capacity: assumedBaseCapacity,
                    extra_adults_count: 0,
                    children_count: 0,
                    extra_requests: '', // Initialize extra requests
                };
            });
            
            setFinalPrice(cartTotalPrice); 
            setRoomExtraRequests(rooms.map(r => r.extra_requests)); // Initialize requests array
            
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
    
    // Initial data load effect and Auth logic (MODIFIED)
    useEffect(() => {
        if (router.isReady) {
            const details = loadBookingDetailsFromCart();
            if (details) {
                setBookingDetails(details);
            }
        }
        
        // REMOVED: Forced redirection to login. Unauthenticated users can proceed.
    }, [router.isReady, router]); // Dependencies simplified


    // Calculate total guests needed for forms
    const totalGuestsCount = useMemo(() => {
        if (!bookingDetails) return 0;
        // Total guests = Sum of (quantity * (base_capacity + adults + children))
        return bookingDetails.rooms.reduce((total: number, room: RoomBookingDetail) => {
            return total + room.quantity * (room.base_capacity + room.adults + room.children);
        }, 0);
    }, [bookingDetails]);


    // Guest data setup: Ensures the array has the correct size and is never undefined
    useEffect(() => {
        if (bookingDetails && guestData.length !== totalGuestsCount) {
            // Fill with empty objects for forms, preserving existing data
             setGuestData(prev => {
                // When totalGuestsCount increases/decreases, new empty slots are added or excess is trimmed.
                const newArray = Array(totalGuestsCount).fill(null).map((_, i) => {
                    const existingData = prev[i] || ({} as Partial<GuestPayload>);
                    // If the user logs out, ensure the wants_to_register field is cleared/reset if it was true
                    if (i === 0 && !isAuthenticated) {
                        return { ...existingData, wants_to_register: false };
                    }
                    return existingData;
                });
                return newArray;
             });
        }
    }, [totalGuestsCount, bookingDetails, guestData.length, isAuthenticated]);


    // Handle changes in guest forms (Stabilized with useCallback and functional update)
    const handleGuestChange = useCallback((index: number, data: Partial<GuestPayload>) => {
        setGuestData(prevGuestData => {
            const newGuestData = [...prevGuestData];
            // Merge the partial update into the specific guest object
            newGuestData[index] = { ...newGuestData[index], ...data }; 
            return newGuestData;
        });
    }, []);
    
    // Handle changes in extra requests
    const handleExtraRequestChange = (index: number, value: string) => {
        const newExtraRequests = [...roomExtraRequests];
        newExtraRequests[index] = value;
        setRoomExtraRequests(newExtraRequests);
    };

    // Validation logic for guests
    const validateGuests = () => {
        if (!rulesAccepted) {
            setError("پذیرش قوانین و شرایط رزرو الزامی است.");
            return false;
        }

        // 1. Check Principal Guest (Index 0) - Mandatory fields (Name, Last Name, Phone, ID/Passport)
        const principalGuest = guestData[0];
        if (!principalGuest?.first_name || !principalGuest?.last_name || !principalGuest?.phone_number) {
            setError("لطفاً نام، نام خانوادگی و شماره تماس رزرو کننده (نفر اول) را وارد کنید.");
            return false;
        }
        
        const isPrincipalForeign = principalGuest.is_foreign;
        if (isPrincipalForeign) {
            if (!principalGuest.passport_number || !principalGuest.nationality) {
                setError("برای رزرو کننده خارجی، شماره پاسپورت و تابعیت الزامی است.");
                return false;
            }
        } else {
            // Check for National ID for domestic principal guest
            if (!principalGuest.national_id) {
                setError("کد ملی رزرو کننده (نفر اول) الزامی است.");
                return false;
            }
        }

        // 2. Check Secondary Guests (Index 1 onwards) - Only name/last name are mandatory 
        for (let i = 1; i < totalGuestsCount; i++) {
            const secondaryGuest = guestData[i];
            if (!secondaryGuest?.first_name || !secondaryGuest?.last_name) {
                 setError(`لطفاً نام و نام خانوادگی میهمان شماره ${toPersianDigits(i + 1)} را تکمیل کنید.`);
                 // Automatically expand the secondary guest section if validation fails there
                 setShowSecondaryGuests(true); 
                 return false;
            }
        }
        
        setError(''); // Clear previous guest errors
        return true;
    };


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        
        if (!bookingDetails) {
            setError("اطلاعات رزرو بارگذاری نشده است.");
            return;
        }

        if (!validateGuests()) {
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
                    extra_adults: r.adults, 
                    children_count: r.children, 
                })),
                // IMPORTANT: Pass user.id or null to correctly calculate agency/authenticated pricing
                user_id: user?.id || null
            };
            
            // 2. Run Price Check (re-confirming price before booking)
            const { total_price: confirmedPrice } = await calculateMultiPrice(priceCheckPayload);

            if (confirmedPrice !== finalPrice) {
                alert(`اخطار: قیمت به‌روزرسانی شد. قیمت نهایی جدید: ${toPersianDigits(confirmedPrice.toLocaleString('fa'))} تومان.`);
                setFinalPrice(confirmedPrice);
                setLoading(false);
                return;
            }
            
            // 3. Prepare Payload for Booking Submission (for CreateBooking API)
            // Ensure wants_to_register is explicitly set for the principal guest if present
            const finalGuests: GuestPayload[] = guestData.map((guest, index) => {
                // Only for the principal guest, include wants_to_register if unauthenticated
                if (index === 0 && isUnauthenticated) {
                    return { ...guest, wants_to_register: guest.wants_to_register || false } as GuestPayload;
                }
                // For other guests or authenticated users, ensure wants_to_register is omitted or false
                const { wants_to_register, ...rest } = guest;
                return rest as GuestPayload;
            })

            const bookingPayload: BookingPayload = {
                check_in: bookingDetails.check_in,
                check_out: bookingDetails.check_out,
                // Map the room details along with extra requests
                booking_rooms: bookingDetails.rooms.map((r, index) => ({
                    room_type_id: r.room_type_id,
                    board_type_id: r.board_type_id,
                    quantity: r.quantity,
                    adults: r.adults, // maps to extra adults
                    children: r.children, 
                    extra_requests: roomExtraRequests[index], // Added extra_requests
                })),
                guests: finalGuests,
                payment_method: paymentMethod,
                rules_accepted: rulesAccepted, 
                // Rely on request header for token/user ID. The backend will use request.user if available.
                agency_id: null, // Omit agency_id here unless booking on behalf of an agency
            };

            // 4. Submit Booking
            const bookingResponse = await createBooking(bookingPayload);
            
            // 5. Handle Payment Redirection or Success
            if (paymentMethod === 'online' && bookingResponse.booking_code) {
                const paymentResponse = await initiatePayment(bookingResponse.booking_code);
                window.location.href = paymentResponse.redirect_url;
            } else if (paymentMethod === 'card_to_card' && bookingResponse.booking_code) {
                 // For card_to_card, redirect to a specific page that shows payment details
                 router.push(`/booking-success-transfer?code=${bookingResponse.booking_code}`);
            } else {
                router.push(`/booking-success?code=${bookingResponse.booking_code}`);
            }

        } catch (err: unknown) {
            const axiosError = err as { response?: { data?: { error?: string | { guests?: string[] } } }, message?: string };
            const errorMessage = typeof axiosError.response?.data?.error === 'string'
                ? axiosError.response.data.error
                : axiosError.response?.data?.error?.guests?.join(' ') || axiosError.message || 'خطا در ثبت رزرو یا ارتباط با سرور.';
            
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };
    
    const CheckoutSummary = () => (
        // ... (omitted for brevity)
        <div className="bg-blue-50 p-6 rounded-lg border border-blue-200" dir="rtl">
            <h3 className="text-xl font-bold mb-4 text-blue-800">خلاصه رزرو</h3>
            {bookingDetails ? (
                <>
                    <p className="mb-2"><strong>تاریخ ورود:</strong> {toPersianDigits(bookingDetails.check_in)}</p>
                    <p className="mb-4"><strong>تاریخ خروج:</strong> {toPersianDigits(bookingDetails.check_out)}</p>
                    
                    <ul className="space-y-3 border-t pt-3 mb-4">
                        {bookingDetails.rooms.map((room, index) => (
                            <li key={index} className="text-sm border-b pb-2">
                                <p className="font-semibold text-gray-800">{room.room_name}</p>
                                <p className="text-gray-600">
                                    تعداد: {toPersianDigits(room.quantity)} اتاق / سرویس: {room.board_name}
                                </p>
                                <p className="font-medium text-gray-700">
                                    قیمت کل: {toPersianDigits(room.price_per_room_total.toLocaleString('fa'))} تومان
                                </p>
                                {/* Input for extra requests per room block */}
                                <div className="mt-2">
                                    <Input
                                        label={`درخواست اضافی اتاق ${toPersianDigits(index + 1)}:`}
                                        id={`extra_requests_${index}`}
                                        type="text"
                                        placeholder="مانند: درخواست تخت نوزاد یا طبقه بالا (اختیاری)"
                                        value={roomExtraRequests[index]}
                                        onChange={(e) => handleExtraRequestChange(index, e.target.value)}
                                    />
                                </div>
                            </li>
                        ))}
                    </ul>

                    <p className="mt-4 font-bold text-2xl text-red-600 border-t pt-4">
                        قیمت نهایی: {toPersianDigits(finalPrice.toLocaleString('fa'))} تومان
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
    
    // Filter payment methods based on user status
    const availablePaymentMethods: Array<{ value: PaymentMethod, label: string }> = [
        { value: 'online', label: 'پرداخت آنلاین (درگاه بانکی)' },
        { value: 'card_to_card', label: 'کارت به کارت (وقت واریز ۲۴ ساعت)' },
        // Only show credit payment for authenticated agency users
        ...(isAgencyUser ? [{ value: 'credit' as PaymentMethod, label: 'پرداخت اعتباری (مخصوص آژانس)' }] : []),
    ];


    return (
        <div className="container mx-auto p-8" dir="rtl">
            <h1 className="text-4xl font-extrabold mb-8 text-gray-900">نهایی‌سازی رزرو</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2 order-2 md:order-1">
                    
                    {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">{error}</div>}

                    <form onSubmit={handleSubmit}>
                        
                        {/* Principal Guest Form - RENDERED DIRECTLY for stable focus and key */}
                        <div className="border p-4 mb-6 rounded-lg bg-yellow-50 border-yellow-200">
                            <h3 className="text-xl font-bold mb-4 text-yellow-800">اطلاعات رزرو کننده (سرپرست) - الزامی</h3>
                            <GuestInputForm
                                key={0} // Explicit stable key for the primary guest
                                index={0}
                                onChange={handleGuestChange}
                                isPrincipal={true}
                                value={guestData[0] || {} as Partial<GuestPayload>}
                                containerClass="bg-yellow-50" // Passed explicit background class
                                isUnauthenticated={isUnauthenticated} // NEW: Pass unauthenticated status
                            />
                        </div>

                        {/* Secondary Guests - Collapsible Section */}
                        {totalGuestsCount > 1 && (
                            <div className="mt-8">
                                <Button 
                                    type="button" 
                                    onClick={() => setShowSecondaryGuests(prev => !prev)}
                                    className="w-full bg-gray-100 text-gray-800 hover:bg-gray-200 border-gray-300 border justify-between"
                                >
                                    <span>اطلاعات سایر میهمانان ({toPersianDigits(totalGuestsCount - 1)} نفر) - اختیاری</span>
                                    <span className="text-xl">{showSecondaryGuests ? '▲' : '▼'}</span>
                                </Button>

                                {showSecondaryGuests && (
                                    <div className="mt-4 p-4 border border-gray-200 rounded-lg bg-blue-50"> 
                                        {/* Rendering secondary guests starting from index 1 */}
                                        {Array.from({ length: totalGuestsCount - 1 }).map((_, listIndex) => {
                                            const guestIndex = listIndex + 1;
                                            const guest = guestData[guestIndex] || {} as Partial<GuestPayload>;

                                            return (
                                                <GuestInputForm
                                                  key={guestIndex} // Use the actual guest index as key
                                                  index={guestIndex} 
                                                  onChange={handleGuestChange}
                                                  isPrincipal={false}
                                                  value={guest} // <-- Using 'value' prop for controlled component
                                                  containerClass="bg-blue-50" 
                                                  isUnauthenticated={isUnauthenticated} // Pass this for consistency
                                                />
                                            )
                                        })}
                                    </div>
                                )}
                            </div>
                        )}
                        
                        <div className="mt-8 pt-6 border-t">
                            <h2 className="text-2xl font-bold mb-4">تأیید نهایی و پرداخت</h2>
                            
                            {/* Rules Acceptance Checkbox */}
                            <label className="flex items-center mb-6 cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    checked={rulesAccepted} 
                                    onChange={(e) => setRulesAccepted(e.target.checked)} 
                                    className="ml-3 w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                                    required // HTML required attribute for initial quick check
                                />
                                <span className="text-sm text-gray-700">
                                    قوانین و شرایط رزرو را مطالعه کرده و می‌پذیرم.
                                    <span className="text-red-500 mr-1">توجه:</span> در صورت مغایرت اطلاعات وارد شده با قوانین هتل، وب‌سایت در قبال عدم پذیرش هتل پاسخگو نخواهد بود.
                                </span>
                            </label>
                            
                            <Button type="submit" disabled={loading || !bookingDetails || !rulesAccepted}>
                                {loading ? 'در حال ثبت و پرداخت...' : `تأیید و ${paymentMethod === 'online' ? 'پرداخت' : paymentMethod === 'card_to_card' ? 'ثبت (پرداخت دستی)' : 'ثبت اعتباری'}`}
                            </Button>
                        </div>
                    </form>
                </div>
                
                <div className="md:col-span-1 order-1 md:order-2">
                    <CheckoutSummary />
                    
                    <div className="mt-6 p-4 bg-white rounded-lg shadow">
                        <h4 className="font-semibold mb-3">روش پرداخت</h4>
                        {availablePaymentMethods.map(method => (
                            <label key={method.value} className="block mb-2 cursor-pointer">
                                <input 
                                    type="radio" 
                                    name="payment" 
                                    value={method.value} 
                                    checked={paymentMethod === method.value} 
                                    onChange={() => setPaymentMethod(method.value as PaymentMethod)} 
                                    className="ml-2"
                                />
                                {method.label}
                            </label>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CheckoutPage;
