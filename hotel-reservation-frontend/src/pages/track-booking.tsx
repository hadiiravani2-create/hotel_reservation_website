// src/pages/track-booking.tsx
// version: 1.2.3
// FIX: Replaced 'detail.customer_name' with data from 'detail.guests' array to fix TypeScript error.

import React, { useState } from 'react';
import { NextPage } from 'next';
import { useMutation } from '@tanstack/react-query';
import {
    guestBookingLookup,
    GuestLookupPayload,
    BookingDetail,
    BookingStatus,
    downloadGuestBookingPDF,
} from '../api/reservationService';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { FaFilePdf, FaHotel, FaCalendarAlt, FaUser, FaBed, FaMoneyBillWave } from 'react-icons/fa';
import { toPersianDigits, formatPrice } from '@/utils/format';

const getStatusBadge = (status: BookingStatus) => {
    const styles: Record<string, string> = {
        pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        confirmed: 'bg-green-100 text-green-800 border-green-200',
        cancelled: 'bg-red-100 text-red-800 border-red-200',
        checked_in: 'bg-blue-100 text-blue-800 border-blue-200',
        checked_out: 'bg-gray-100 text-gray-800 border-gray-200',
        awaiting_confirmation: 'bg-orange-100 text-orange-800 border-orange-200',
        cancellation_requested: 'bg-rose-100 text-rose-800 border-rose-200',
    };
    
    const labels: Record<string, string> = {
        pending: 'در انتظار پرداخت',
        confirmed: 'قطعی شده',
        cancelled: 'لغو شده',
        checked_in: 'پذیرش شده',
        checked_out: 'تخلیه شده',
        awaiting_confirmation: 'در انتظار تایید',
        cancellation_requested: 'درخواست لغو',
    };

    return (
        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
            {labels[status] || status}
        </span>
    );
};

// --- Sub-Component: Booking Detail View ---

interface BookingDetailViewProps {
    detail: BookingDetail;
    guestIdCode: string;
}

const BookingDetailView: React.FC<BookingDetailViewProps> = ({ detail, guestIdCode }) => {
    const handleDownloadPdf = async () => {
        try {
            await downloadGuestBookingPDF(detail.booking_code, guestIdCode);
        } catch (error) {
            console.error("PDF Download failed", error);
            alert("خطا در دانلود فایل PDF");
        }
    };

    // FIX: Extract main guest name from the guests array
    const mainGuestName = detail.guests && detail.guests.length > 0
        ? `${detail.guests[0].first_name} ${detail.guests[0].last_name}`
        : 'نامشخص';

    return (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden mt-8 animate-fade-in-up">
            {/* Card Header */}
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <FaHotel className="text-blue-500" />
                        {detail.hotel_name}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">کد رزرو: <span className="font-mono font-bold text-gray-700">{detail.booking_code}</span></p>
                </div>
                {getStatusBadge(detail.status)}
            </div>

            {/* Card Body - Grid Layout */}
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
                {/* Guest Name */}
                <div className="flex items-start gap-3">
                    <div className="mt-1 bg-blue-50 p-2 rounded-lg text-blue-600"><FaUser /></div>
                    <div>
                        <p className="text-sm text-gray-500 mb-1">نام مهمان</p>
                        {/* FIX: Use the calculated name variable */}
                        <p className="font-medium text-gray-800">{mainGuestName}</p>
                    </div>
                </div>

                {/* Dates */}
                <div className="flex items-start gap-3">
                    <div className="mt-1 bg-blue-50 p-2 rounded-lg text-blue-600"><FaCalendarAlt /></div>
                    <div>
                        <p className="text-sm text-gray-500 mb-1">تاریخ اقامت</p>
                        <p className="font-medium text-gray-800">
                             {toPersianDigits(detail.check_in)} تا {toPersianDigits(detail.check_out)}
                        </p>
                    </div>
                </div>

                {/* Rooms */}
                <div className="flex items-start gap-3">
                    <div className="mt-1 bg-blue-50 p-2 rounded-lg text-blue-600"><FaBed /></div>
                    <div>
                        <p className="text-sm text-gray-500 mb-1">اتاق‌ها</p>
                         <ul className="list-disc list-inside text-sm text-gray-800">
                            {detail.booking_rooms.map((room, idx) => (
                                <li key={idx}>
                                    {room.room_type_name} ({room.board_type})
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Price */}
                <div className="flex items-start gap-3">
                    <div className="mt-1 bg-blue-50 p-2 rounded-lg text-blue-600"><FaMoneyBillWave /></div>
                    <div>
                        <p className="text-sm text-gray-500 mb-1">مبلغ کل</p>
                        <p className="font-bold text-gray-800 text-lg">
                            {formatPrice(detail.total_price)} <span className="text-xs font-normal text-gray-500">تومان</span>
                        </p>
                    </div>
                </div>
            </div>

            {/* Card Footer - Actions */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
                <Button 
                    onClick={handleDownloadPdf} 
                    variant="outline" 
                    className="flex items-center gap-2 text-sm hover:bg-blue-50 hover:text-blue-600 transition-colors"
                >
                    <FaFilePdf className="text-red-500" />
                    دانلود واچر (PDF)
                </Button>
            </div>
        </div>
    );
};

// --- Main Page Component ---

const TrackBooking: NextPage = () => {
    const [bookingCode, setBookingCode] = useState('');
    const [idNumber, setIdNumber] = useState('');

    const { mutate, isPending, data: bookingDetail, isSuccess, error } = useMutation({
        mutationFn: (payload: GuestLookupPayload) => guestBookingLookup(payload),
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!bookingCode || !idNumber) {
            alert('لطفا کد رزرو و کد ملی را وارد کنید.');
            return;
        }
        mutate({ booking_code: bookingCode, national_id: idNumber, passport_number: null });
    };

    return (
        <div className="min-h-screen flex flex-col bg-gray-50 font-sans" dir="rtl">
            <Header />
            
            <main className="flex-grow container mx-auto px-4 py-12">
                <div className="max-w-2xl mx-auto">
                    
                    <div className="text-center mb-10">
                        <h1 className="text-3xl font-extrabold text-gray-900 mb-4">پیگیری وضعیت رزرو</h1>
                        <p className="text-gray-600">
                            برای مشاهده وضعیت رزرو و دریافت واچر، کد رزرو و کد ملی یا شماره پاسپورت خود را وارد کنید.
                        </p>
                    </div>

                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Input
                                    label="کد رزرو"
                                    value={bookingCode}
                                    onChange={(e) => setBookingCode(e.target.value)}
                                    placeholder="مثال: RES-123456"
                                    required
                                    className="text-left font-mono"
                                    dir="ltr"
                                />
                                <Input
                                    label="کد ملی / شماره پاسپورت"
                                    value={idNumber}
                                    onChange={(e) => setIdNumber(e.target.value)}
                                    placeholder="کد ملی مهمان اصلی"
                                    required
                                    className="text-left font-mono"
                                    dir="ltr"
                                />
                            </div>

                            <Button
                                type="submit"
                                className="w-full h-12 text-lg font-medium shadow-md hover:shadow-lg transition-all"
                                disabled={isPending}
                            >
                                {isPending ? 'در حال جستجو...' : 'پیگیری رزرو'}
                            </Button>
                        </form>
                    </div>

                    {/* Result Section */}
                    <div className="transition-all duration-300 ease-in-out">
                        {error && (
                            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-center animate-fade-in">
                                <p className="font-bold">رزروی با این مشخصات یافت نشد.</p>
                                <p className="text-sm mt-1">لطفا صحت اطلاعات وارد شده را بررسی کنید.</p>
                            </div>
                        )}

                        {isSuccess && bookingDetail && (
                            <BookingDetailView 
                                detail={bookingDetail} 
                                guestIdCode={idNumber} 
                            />
                        )}
                    </div>

                </div>
            </main>

            <Footer />
        </div>
    );
};

export default TrackBooking;
