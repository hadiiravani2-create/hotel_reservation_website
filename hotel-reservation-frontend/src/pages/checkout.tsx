// src/pages/checkout.tsx
// version: 2.2.3
// REFACTOR: Removed moment-jalaali dependency and replaced all date logic with DateObject from react-multi-date-picker.

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../hooks/useAuth';
import { calculateMultiPrice, MultiPriceData } from '../api/pricingService';
import { createBooking, BookingPayload, GuestPayload } from '../api/reservationService';
import { Button } from '../components/ui/Button';
import GuestInputForm from '../components/GuestInputForm';
import { Input } from '../components/ui/Input';
import { DateObject } from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import { CartItem } from '../types/hotel';
import Header from '../components/Header';
import Footer from '../components/Footer';

// Utility function to convert numbers to Persian digits, handles strings and numbers.
const toPersianDigits = (str: string | number | undefined) => {
    if (str === undefined || str === null) return '';
    const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    return String(str).replace(/[0-9]/g, (d) => persianDigits[parseInt(d)]);
};

// --- Interface with all required fields ---
interface RoomBookingDetail {
    room_type_id: number;
    board_type_id: number;
    quantity: number;
    adults: number;
    children: number;
    price_per_room_total: number;
    room_name: string;
    board_name: string;
    check_in: string; // Stored in Jalali format for display
    check_out: string; // Stored in Jalali format for display
    base_capacity: number;
    max_extra_adults: number;
    max_children: number;
    extra_requests: string;
}

interface BookingDetails {
    check_in_gregorian: string; // Gregorian YYYY-MM-DD for API
    check_out_gregorian: string; // Gregorian YYYY-MM-DD for API
    rooms: RoomBookingDetail[];
    cart_total_price: number;
    total_base_capacity: number;
}

const CHECKOUT_CART_KEY = 'localCart';
const CHECKOUT_DATES_KEY = 'localDates';

const CheckoutPage: React.FC = () => {
    const router = useRouter();
    const { isAuthenticated, isLoading: authLoading, user } = useAuth();
    const isUnauthenticated = !isAuthenticated && !authLoading;
    const isAgencyUser = !!user?.agency_role;

    const [bookingDetails, setBookingDetails] = useState<BookingDetails | null>(null);
    const [guestData, setGuestData] = useState<Partial<GuestPayload>[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [finalPrice, setFinalPrice] = useState(0);
    const [rulesAccepted, setRulesAccepted] = useState(false);
    const [roomExtraRequests, setRoomExtraRequests] = useState<string[]>([]);
    const [showSecondaryGuests, setShowSecondaryGuests] = useState(false);

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

            // Create a DateObject instance for calculations
            const checkInDate = new DateObject({ date: dates.check_in, calendar: persian, locale: persian_fa });
            const checkOutDate = new DateObject(checkInDate).add(dates.duration, "days");

            let totalCapacity = 0;
            let cartTotalPrice = 0;

            const rooms: RoomBookingDetail[] = cartItems.map(item => {
                const assumedBaseCapacity = 2;
                const assumedMaxExtraAdults = 2;
                const assumedMaxChildren = 2;

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
                    check_in: checkInDate.format("YYYY/MM/DD"), // Jalali display format
                    check_out: checkOutDate.format("YYYY/MM/DD"), // Jalali display format
                    base_capacity: assumedBaseCapacity,
                    max_extra_adults: assumedMaxExtraAdults,
                    max_children: assumedMaxChildren,
                    extra_requests: '',
                };
            });

            setFinalPrice(cartTotalPrice);
            setRoomExtraRequests(rooms.map(r => r.extra_requests));

            return {
                check_in_gregorian: checkInDate.format("YYYY-MM-DD"), // Gregorian for API
                check_out_gregorian: checkOutDate.format("YYYY-MM-DD"), // Gregorian for API
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

    useEffect(() => {
        if (router.isReady) {
            const details = loadBookingDetailsFromCart();
            if (details) {
                setBookingDetails(details);
            }
        }
    }, [router.isReady]);

    const totalGuestsCount = useMemo(() => {
        if (!bookingDetails) return 0;
        return bookingDetails.rooms.reduce((total: number, room: RoomBookingDetail) => {
            return total + (room.base_capacity * room.quantity) + (room.adults) + (room.children);
        }, 0);
    }, [bookingDetails]);

    useEffect(() => {
        if (bookingDetails && guestData.length !== totalGuestsCount) {
            setGuestData(prev => {
                const newArray = Array(totalGuestsCount).fill(null).map((_, i) => {
                    const existingData = prev[i] || ({} as Partial<GuestPayload>);
                    if (i === 0 && !isAuthenticated) {
                        return { ...existingData, wants_to_register: false };
                    }
                    return existingData;
                });
                return newArray;
            });
        }
    }, [totalGuestsCount, bookingDetails, guestData.length, isAuthenticated]);

    const handleGuestChange = useCallback((index: number, data: Partial<GuestPayload>) => {
        setGuestData(prevGuestData => {
            const newGuestData = [...prevGuestData];
            newGuestData[index] = { ...newGuestData[index], ...data };
            return newGuestData;
        });
    }, []);

    const handleExtraRequestChange = (index: number, value: string) => {
        const newExtraRequests = [...roomExtraRequests];
        newExtraRequests[index] = value;
        setRoomExtraRequests(newExtraRequests);
    };

    const handleExtraGuestChange = (roomIndex: number, field: 'adults' | 'children', value: number) => {
        if (!bookingDetails) return;
        setBookingDetails(prevDetails => {
            if (!prevDetails) return null;
            const newRooms = [...prevDetails.rooms];
            const maxCapacityPerRoom = field === 'adults'
                ? newRooms[roomIndex].max_extra_adults
                : newRooms[roomIndex].max_children;
            const maxTotalCapacity = maxCapacityPerRoom * newRooms[roomIndex].quantity;
            const newCount = Math.min(Math.max(0, value), maxTotalCapacity);
            newRooms[roomIndex] = { ...newRooms[roomIndex], [field]: newCount };
            return { ...prevDetails, rooms: newRooms };
        });
    };

    const validateGuests = () => {
        if (!rulesAccepted) {
            setError("پذیرش قوانین و شرایط رزرو الزامی است.");
            return false;
        }
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
            if (!principalGuest.national_id) {
                setError("کد ملی رزرو کننده (نفر اول) الزامی است.");
                return false;
            }
        }
        setError('');
        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!bookingDetails) {
            setError("اطلاعات رزرو بارگذاری نشده است.");
            return;
        }
        if (!validateGuests()) return;

        setLoading(true);
        try {
            const priceCheckPayload: MultiPriceData = {
                check_in: bookingDetails.check_in_gregorian,
                check_out: bookingDetails.check_out_gregorian,
                booking_rooms: bookingDetails.rooms.map((r: RoomBookingDetail) => ({
                    room_type_id: r.room_type_id,
                    board_type_id: r.board_type_id,
                    quantity: r.quantity,
                    extra_adults: r.adults,
                    children_count: r.children,
                })),
                user_id: user?.id || null
            };
            const { total_price: confirmedPrice } = await calculateMultiPrice(priceCheckPayload);

            if (confirmedPrice !== finalPrice) {
                alert(`اخطار: قیمت به‌روزرسانی شد. قیمت نهایی جدید: ${toPersianDigits(confirmedPrice.toLocaleString())} تومان.`);
                setFinalPrice(confirmedPrice);
                setLoading(false);
                return;
            }

            const finalGuests: GuestPayload[] = guestData.map((guest, index) => {
                if (index === 0 && isUnauthenticated) {
                    return { ...guest, wants_to_register: guest.wants_to_register || false } as GuestPayload;
                }
                const { wants_to_register, ...rest } = guest;
                return rest as GuestPayload;
            });

            const bookingPayload: BookingPayload = {
                check_in: bookingDetails.check_in_gregorian,
                check_out: bookingDetails.check_out_gregorian,
                booking_rooms: bookingDetails.rooms.map((r, index) => ({
                    room_type_id: r.room_type_id,
                    board_type_id: r.board_type_id,
                    quantity: r.quantity,
                    adults: r.adults,
                    children: r.children,
                    extra_requests: roomExtraRequests[index],
                })),
                guests: finalGuests,
                rules_accepted: rulesAccepted,
                agency_id: null,
            };

            const bookingResponse = await createBooking(bookingPayload);
            router.push(`/payment/${bookingResponse.booking_code}`);

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
        <div className="bg-blue-50 p-6 rounded-lg border border-blue-200" dir="rtl">
            <h3 className="text-xl font-bold mb-4 text-blue-800">خلاصه رزرو</h3>
            {bookingDetails && bookingDetails.rooms.length > 0 ? (
                <>
                    <p className="mb-2"><strong>تاریخ ورود:</strong> {toPersianDigits(bookingDetails.rooms[0].check_in)}</p>
                    <p className="mb-4"><strong>تاریخ خروج:</strong> {toPersianDigits(bookingDetails.rooms[0].check_out)}</p>
                    <ul className="space-y-3 border-t pt-3 mb-4">
                        {bookingDetails.rooms.map((room, index) => (
                            <li key={index} className="text-sm border-b pb-4">
                                <p className="font-semibold text-gray-800">{room.room_name}</p>
                                <p className="text-gray-600">تعداد: {toPersianDigits(room.quantity)} اتاق / سرویس: {room.board_name}</p>
                                <p className="font-medium text-gray-700">قیمت کل پایه: {toPersianDigits(room.price_per_room_total.toLocaleString())} تومان</p>
                                <div className="mt-2 grid grid-cols-2 gap-4">
                                    <div>
                                        <Input
                                            label={`نفر اضافه (${toPersianDigits(room.max_extra_adults)} حداکثر):`}
                                            type="number"
                                            min={0}
                                            max={room.max_extra_adults * room.quantity}
                                            value={room.adults}
                                            onChange={(e) => handleExtraGuestChange(index, 'adults', parseInt(e.target.value))}
                                            disabled={room.max_extra_adults <= 0}
                                        />
                                    </div>
                                    <div>
                                        <Input
                                            label={`کودک (${toPersianDigits(room.max_children)} حداکثر):`}
                                            type="number"
                                            min={0}
                                            max={room.max_children * room.quantity}
                                            value={room.children}
                                            onChange={(e) => handleExtraGuestChange(index, 'children', parseInt(e.target.value))}
                                            disabled={room.max_children <= 0}
                                        />
                                    </div>
                                </div>
                                <div className="mt-2">
                                    <Input
                                        label={`درخواست اضافی اتاق ${toPersianDigits(index + 1)}:`}
                                        type="text"
                                        placeholder="اختیاری"
                                        value={roomExtraRequests[index]}
                                        onChange={(e) => handleExtraRequestChange(index, e.target.value)}
                                    />
                                </div>
                            </li>
                        ))}
                    </ul>
                    <p className="mt-4 font-bold text-2xl text-red-600 border-t pt-4">
                        قیمت نهایی: {toPersianDigits(finalPrice.toLocaleString())} تومان
                    </p>
                </>
            ) : <p>در حال بارگذاری اطلاعات رزرو...</p>}
        </div>
    );

    if (!bookingDetails && !error) {
        return <><Header /><div className="container mx-auto p-8" dir="rtl">در حال بارگذاری...</div><Footer /></>;
    }
    if (error && !bookingDetails) {
        return <><Header /><div className="container mx-auto p-8" dir="rtl">
            <h1 className="text-4xl font-extrabold mb-8 text-red-600">خطا</h1>
            <p className="text-lg text-gray-700">{error}</p>
            <Button onClick={() => router.push('/')} className='mt-6'>بازگشت به صفحه اصلی</Button>
        </div><Footer /></>;
    }

    return (
        <><Header /><div className="container mx-auto p-8" dir="rtl">
            <h1 className="text-4xl font-extrabold mb-8 text-gray-900">نهایی‌سازی رزرو</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2 order-2 md:order-1">
                    {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">{error}</div>}
                    <form onSubmit={handleSubmit}>
                        <div className="border p-4 mb-6 rounded-lg bg-yellow-50 border-yellow-200">
                            <h3 className="text-xl font-bold mb-4 text-yellow-800">اطلاعات رزرو کننده (سرپرست)</h3>
                            <GuestInputForm
                                key={0} index={0} onChange={handleGuestChange} isPrincipal={true}
                                value={guestData[0] || {} as Partial<GuestPayload>}
                                containerClass="bg-yellow-50" isUnauthenticated={isUnauthenticated}
                            />
                        </div>
                        {totalGuestsCount > 1 && (
                            <div className="mt-8">
                                <Button type="button" onClick={() => setShowSecondaryGuests(prev => !prev)}
                                    className="w-full bg-gray-100 text-gray-800 hover:bg-gray-200 border-gray-300 border justify-between">
                                    <span>اطلاعات سایر میهمانان ({toPersianDigits(totalGuestsCount - 1)} نفر) - اختیاری</span>
                                    <span className="text-xl">{showSecondaryGuests ? '▲' : '▼'}</span>
                                </Button>
                                {showSecondaryGuests && <div className="mt-4 p-4 border border-gray-200 rounded-lg bg-blue-50">
                                    {Array.from({ length: totalGuestsCount - 1 }).map((_, listIndex) => {
                                        const guestIndex = listIndex + 1;
                                        return <GuestInputForm key={guestIndex} index={guestIndex} onChange={handleGuestChange}
                                            isPrincipal={false} value={guestData[guestIndex] || {} as Partial<GuestPayload>}
                                            containerClass="bg-blue-50" isUnauthenticated={isUnauthenticated} />
                                    })}
                                </div>}
                            </div>
                        )}
                        <div className="mt-8 pt-6 border-t">
                            <h2 className="text-2xl font-bold mb-4">تأیید نهایی و ثبت رزرو</h2>
                            <label className="flex items-center mb-6 cursor-pointer">
                                <input type="checkbox" checked={rulesAccepted} onChange={(e) => setRulesAccepted(e.target.checked)}
                                    className="ml-3 w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500" required />
                                <span className="text-sm text-gray-700">قوانین و شرایط رزرو را مطالعه کرده و می‌پذیرم.</span>
                            </label>
                            <Button type="submit" disabled={loading || !bookingDetails || !rulesAccepted}>
                                {loading ? 'در حال ثبت اطلاعات...' : 'ثبت نهایی و هدایت به صفحه پرداخت'}
                            </Button>
                        </div>
                    </form>
                </div>
                <div className="md:col-span-1 order-1 md:order-2">
                    <CheckoutSummary />
                </div>
            </div>
        </div><Footer /></>
    );
};

export default CheckoutPage;
