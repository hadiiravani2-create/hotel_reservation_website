// src/pages/track-booking.tsx
// version: 1.0.5
// Feature: Added Header and Footer components.
// FIX: Modified GuestLookupPayload construction to omit null fields, resolving potential 400 errors.

import React, { useState } from 'react';
import { NextPage } from 'next';
import { useMutation } from '@tanstack/react-query';
import {
    guestBookingLookup,
    GuestLookupPayload,
    BookingDetail,
    BookingStatus,
    BookingRoomDetail,
} from '../api/reservationService';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import Header from '../components/Header'; // Added Header
import Footer from '../components/Footer'; // Added Footer

// --- Utility Functions ---

/**
 * Returns Tailwind CSS classes for the booking status.
 * @param status The booking status string.
 */
const getStatusClasses = (status: BookingStatus): string => {
    switch (status) {
        case 'confirmed':
            return 'bg-green-100 text-green-800';
        case 'pending':
            return 'bg-yellow-100 text-yellow-800';
        case 'cancelled':
            return 'bg-red-100 text-red-800';
        case 'cancellation_requested':
        case 'modification_requested':
            return 'bg-blue-100 text-blue-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
};

// --- Sub-Components ---

/**
 * Displays the detailed information of a successfully retrieved booking.
 */
const BookingDetailView: React.FC<{ detail: BookingDetail }> = ({ detail }) => {
    
    // Helper to format date strings (assuming ISO format YYYY-MM-DD from API)
    // Note: If API returns Jalali date, this conversion might be simplified.
    // We assume the API handles Jalali formatting on its side based on previous code context.
    const formatDate = (dateString: string) => {
        return dateString; // Keeping it simple for now, as full moment-jalaali integration isn't here
    };

    return (
        <div className="mt-8 p-6 bg-white border border-gray-200 rounded-xl shadow-lg" dir="rtl">
            <div className="flex justify-between items-start mb-6 border-b pb-4">
                <h3 className="text-2xl font-bold text-slate-800">جزئیات رزرو: <span className="text-primary-brand">{detail.booking_code}</span></h3>
                <span
                    className={`text-sm font-medium px-3 py-1 rounded-full ${getStatusClasses(detail.status)}`}
                >
                    {/* Simple Persian translation for status codes */}
                    {detail.status === 'confirmed' && 'تأیید شده'}
                    {detail.status === 'pending' && 'در انتظار پرداخت'}
                    {detail.status === 'cancelled' && 'لغو شده'}
                    {detail.status === 'cancellation_requested' && 'درخواست لغو'}
                    {detail.status === 'modification_requested' && 'درخواست تغییر'}
                </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 text-slate-700">
                <p><strong>نام هتل:</strong> {detail.hotel_name}</p>
                <p><strong>تاریخ ثبت:</strong> {formatDate(detail.created_at)}</p>
                <p><strong>تاریخ ورود:</strong> {formatDate(detail.check_in)}</p>
                <p><strong>تاریخ خروج:</strong> {formatDate(detail.check_out)}</p>
                <p><strong>تعداد کل مهمانان:</strong> {detail.total_guests}</p>
                <p className='text-lg font-semibold text-primary-brand'>
                    <strong>مبلغ کل:</strong> {detail.total_price.toLocaleString()} ریال
                </p>
            </div>

            <div className="mt-6">
                <h4 className="font-bold text-xl mb-3 border-b pb-2 text-slate-800">اطلاعات اتاق‌ها</h4>
                <div className="space-y-4">
                    {detail.booking_rooms.map((room, index) => (
                        <RoomDetailCard key={index} room={room} />
                    ))}
                </div>
            </div>

            <div className="mt-6">
                <h4 className="font-bold text-xl mb-3 border-b pb-2 text-slate-800">اطلاعات مهمانان</h4>
                <ul className="list-disc list-inside space-y-2 text-slate-700">
                    {detail.guests.map((guest, index) => (
                        <li key={index}>
                            {guest.first_name} {guest.last_name} ({guest.is_foreign ? 'مهمان خارجی' : 'مهمان ایرانی'})
                            {guest.national_id && ` - کدملی: ${guest.national_id}`}
                            {guest.passport_number && ` - پاسپورت: ${guest.passport_number}`}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

/**
 * Displays details for a single room booked.
 */
const RoomDetailCard: React.FC<{ room: BookingRoomDetail }> = ({ room }) => (
    <div className="p-4 border rounded-lg bg-gray-50 flex justify-between items-center text-sm">
        <div>
            <p className="font-medium text-slate-800">{room.room_type_name} ({room.hotel_name})</p>
            <p className="text-gray-600">
                {room.quantity} واحد | {room.adults} بزرگسال، {room.children} کودک | نوع بورد: {room.board_type}
            </p>
        </div>
        {room.extra_requests && (
            <span className="text-xs text-blue-600 bg-blue-50 p-1 rounded">درخواست ویژه</span>
        )}
    </div>
);


// --- Main Page Component ---

const TrackBookingPage: NextPage = () => {
    const [bookingCode, setBookingCode] = useState('');
    const [idNumber, setIdNumber] = useState('');
    const [isForeign, setIsForeign] = useState(false);

    const {
        mutate,
        data: bookingDetail,
        isPending,
        error,
        isSuccess,
        reset,
    } = useMutation<BookingDetail, Error, GuestLookupPayload>({
        mutationFn: guestBookingLookup,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Reset previous results/errors
        reset(); 

        if (!bookingCode || !idNumber) {
            alert('لطفاً شماره رزرو و کد شناسایی (ملی/پاسپورت) را وارد کنید.');
            return;
        }

        // FIX: Conditionally include national_id OR passport_number to avoid sending 'null' keys, 
        // which often resolves 400 errors for optional fields in DRF.
        const payload: GuestLookupPayload = {
            booking_code: bookingCode,
            // Uses spread operator to only include the non-null ID field
            ...(isForeign ? { passport_number: idNumber } : { national_id: idNumber }),
        } as GuestLookupPayload; // Cast to satisfy TypeScript that only one of the required keys is present

        mutate(payload);
    };

    const idLabel = isForeign ? 'شماره پاسپورت' : 'کدملی';
    const idPlaceholder = isForeign ? 'شماره پاسپورت را وارد کنید' : 'کدملی را وارد کنید';


    return (
        <div dir="rtl" className="flex flex-col min-h-screen">
            <Header /> {/* Added Header */}
            
            <main className="flex-grow bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-3xl mx-auto">
                    <h1 className="text-3xl font-extrabold text-slate-900 text-center mb-8">
                        پیگیری وضعیت رزرو
                    </h1>

                    {/* Tracking Form */}
                    <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-2xl space-y-6">
                        <Input
                            label="شماره رزرو (Booking Code)"
                            name="booking_code"
                            placeholder="مانند: R12345"
                            value={bookingCode}
                            onChange={(e) => setBookingCode(e.target.value)}
                            required
                        />
                        
                        {/* Identity Switcher */}
                        <div className="flex items-center space-x-4 space-x-reverse">
                            <label className="flex items-center cursor-pointer text-slate-700">
                                <input
                                    type="checkbox"
                                    className="h-4 w-4 text-primary-brand rounded border-gray-300 focus:ring-primary-brand ml-2"
                                    checked={isForeign}
                                    onChange={() => {
                                        setIsForeign(!isForeign);
                                        setIdNumber(''); // Clear ID field on switch
                                    }}
                                />
                                مهمان خارجی
                            </label>
                        </div>

                        <Input
                            label={idLabel}
                            name={isForeign ? 'passport_number' : 'national_id'}
                            placeholder={idPlaceholder}
                            value={idNumber}
                            onChange={(e) => setIdNumber(e.target.value)}
                            required
                            type={isForeign ? 'text' : 'number'} // National ID is often numeric
                        />

                        <Button
                            type="submit"
                            className="w-full h-12"
                            disabled={isPending}
                        >
                            {isPending ? 'در حال جستجو...' : 'پیگیری رزرو'}
                        </Button>
                    </form>

                    {/* Results/Error Display */}
                    {isSuccess && bookingDetail && <BookingDetailView detail={bookingDetail} />}

                    {error && (
                        <div className="mt-8 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg text-center">
                            <p className="font-bold">خطا در پیگیری رزرو:</p>
                            <p>شماره رزرو یا اطلاعات شناسایی وارد شده صحیح نمی‌باشد.</p>
                            <p className="text-sm italic">{(error as Error).message}</p>
                        </div>
                    )}
                    
                    {!isPending && !isSuccess && !error && (
                        <div className="mt-8 text-center text-slate-500">
                            لطفاً شماره رزرو و اطلاعات شناسایی خود را برای مشاهده جزئیات وارد کنید.
                        </div>
                    )}
                </div>
            </main>

            <Footer /> {/* Added Footer */}
        </div>
    );
};

export default TrackBookingPage;
