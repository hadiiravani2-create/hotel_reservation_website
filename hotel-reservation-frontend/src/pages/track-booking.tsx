// src/pages/track-booking.tsx
// version: 2.1.2
// FEATURE: Added 'Pay Now' button for unpaid/partial bookings that are not cancelled.

import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
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
// اضافه کردن آیکون کارت اعتباری
import { FaFilePdf, FaHotel, FaCalendarAlt, FaUser, FaBed, FaMoneyBillWave, FaLock, FaCreditCard } from 'react-icons/fa';
import { toPersianDigits, formatPrice } from '@/utils/format';

// ... (getStatusBadge function remains the same) ...
const getStatusBadge = (status: BookingStatus) => {
    // ... (بدون تغییر) ...
    const styles: Record<string, string> = {
        pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        confirmed: 'bg-green-100 text-green-800 border-green-200',
        cancelled: 'bg-red-100 text-red-800 border-red-200',
        checked_in: 'bg-blue-100 text-blue-800 border-blue-200',
        checked_out: 'bg-gray-100 text-gray-800 border-gray-200',
        awaiting_confirmation: 'bg-orange-100 text-orange-800 border-orange-200',
        cancellation_requested: 'bg-rose-100 text-rose-800 border-rose-200',
        no_capacity: 'bg-red-100 text-red-800 border-red-200',
    };
    
    const labels: Record<string, string> = {
        pending: 'در انتظار پرداخت',
        confirmed: 'قطعی شده',
        cancelled: 'لغو شده',
        checked_in: 'پذیرش شده',
        checked_out: 'تخلیه شده',
        awaiting_confirmation: 'در انتظار تایید',
        cancellation_requested: 'درخواست لغو',
        no_capacity: 'عدم ظرفیت',
    };

    return (
        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
            {labels[status] || status}
        </span>
    );
};

interface BookingDetailViewProps {
    detail: BookingDetail;
    guestIdCode: string;
}

const BookingDetailView: React.FC<BookingDetailViewProps> = ({ detail, guestIdCode }) => {
    const router = useRouter(); // برای هدایت به صفحه پرداخت

    // --- Logic Calculations ---
    const isConfirmed = detail.status === 'confirmed';
    const paidAmount = detail.paid_amount || 0;
    const isFullyPaid = paidAmount >= detail.total_price;
    
    // وضعیت‌هایی که رزرو در آن‌ها عملاً از دست رفته یا کنسل شده است
    const isCancelledOrInvalid = ['cancelled', 'no_capacity'].includes(detail.status);

    // شرط نمایش دکمه پرداخت:
    // 1. مبلغ کامل پرداخت نشده باشد.
    // 2. رزرو کنسل یا رد نشده باشد.
    const showPaymentButton = !isFullyPaid && !isCancelledOrInvalid;

    // شرط دانلود واچر: تایید شده + پرداخت کامل
    const canDownloadVoucher = isConfirmed && isFullyPaid;

    const handleDownloadPdf = async () => {
        if (!canDownloadVoucher) return; 

        try {
            await downloadGuestBookingPDF(detail.booking_code, guestIdCode);
        } catch (error) {
            console.error("PDF Download failed", error);
            alert("خطا در دانلود فایل PDF");
        }
    };

    const mainGuestName = detail.guests && detail.guests.length > 0
        ? `${detail.guests[0].first_name} ${detail.guests[0].last_name}`
        : 'نامشخص';

    return (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden mt-8 animate-fade-in-up">
            {/* ... (Header and Details Grid remain exactly the same) ... */}
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

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
                <div className="flex items-start gap-3">
                    <div className="mt-1 bg-blue-50 p-2 rounded-lg text-blue-600"><FaUser /></div>
                    <div>
                        <p className="text-sm text-gray-500 mb-1">نام مهمان</p>
                        <p className="font-medium text-gray-800">{mainGuestName}</p>
                    </div>
                </div>
                <div className="flex items-start gap-3">
                    <div className="mt-1 bg-blue-50 p-2 rounded-lg text-blue-600"><FaCalendarAlt /></div>
                    <div>
                        <p className="text-sm text-gray-500 mb-1">تاریخ اقامت</p>
                        <p className="font-medium text-gray-800">
                             {toPersianDigits(detail.check_in)} تا {toPersianDigits(detail.check_out)}
                        </p>
                    </div>
                </div>
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

                <div className="flex items-start gap-3">
                    <div className="mt-1 bg-blue-50 p-2 rounded-lg text-blue-600"><FaMoneyBillWave /></div>
                    <div className="w-full">
                        <p className="text-sm text-gray-500 mb-1">وضعیت مالی</p>
                        <div className="flex justify-between items-center w-full">
                            <span className="text-sm text-gray-600">مبلغ کل:</span>
                            <span className="font-bold text-gray-800">{formatPrice(detail.total_price)} تومان</span>
                        </div>
                        <div className="flex justify-between items-center w-full mt-1">
                            <span className="text-sm text-gray-600">پرداخت شده:</span>
                            <span className={`font-bold ${isFullyPaid ? 'text-green-600' : 'text-orange-500'}`}>
                                {formatPrice(paidAmount)} تومان
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Actions Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row justify-end items-center gap-3">
                
                {/* دکمه جدید پرداخت: اگر پرداخت کامل نیست و کنسل نشده */}
                {showPaymentButton && (
                    <Button 
                        onClick={() => router.push(`/payment/${detail.booking_code}`)}
                        className="flex items-center gap-2 text-sm bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-colors"
                    >
                        <FaCreditCard />
                        پرداخت / تکمیل وجه
                    </Button>
                )}

                {/* پیام راهنما برای دانلود واچر */}
                {!canDownloadVoucher && (
                    <span className="text-xs text-orange-600 bg-orange-50 px-3 py-1 rounded-md border border-orange-100">
                        <FaLock className="inline ml-1 mb-0.5"/>
                        جهت دریافت واچر، رزرو باید تایید شده و تسویه کامل گردد.
                    </span>
                )}
                
                {/* دکمه دانلود واچر */}
                <Button 
                    onClick={handleDownloadPdf} 
                    variant="outline" 
                    disabled={!canDownloadVoucher} 
                    className={`flex items-center gap-2 text-sm transition-colors ${!canDownloadVoucher ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-50 hover:text-blue-600'}`}
                >
                    <FaFilePdf className={canDownloadVoucher ? "text-red-500" : "text-gray-400"} />
                    دانلود واچر (PDF)
                </Button>
            </div>
        </div>
    );
};

// ... (Rest of the TrackBooking component remains exactly the same) ...
// (TrackBooking function and export default)

const TrackBooking: NextPage = () => {
    // ... کد قبلی TrackBooking بدون هیچ تغییری ...
    // برای جلوگیری از شلوغی، کدهای این بخش تکرار نمی‌شود زیرا تغییری نکرده‌اند.
    
    const router = useRouter(); 
    
    const [bookingCode, setBookingCode] = useState('');
    const [idNumber, setIdNumber] = useState('');
    const [hasAutoSearched, setHasAutoSearched] = useState(false);

    const { mutate, isPending, data: bookingDetail, isSuccess, error } = useMutation({
        mutationFn: (payload: GuestLookupPayload) => guestBookingLookup(payload),
    });

    useEffect(() => {
        if (!router.isReady) return;
        if (hasAutoSearched) return;

        const { code, nid } = router.query;

        if (code && nid) {
            const codeStr = code as string;
            const nidStr = nid as string;
            setBookingCode(codeStr);
            setIdNumber(nidStr);
            mutate({ 
                booking_code: codeStr, 
                national_id: nidStr, 
                passport_number: null 
            });
            setHasAutoSearched(true);
        }
    }, [router.isReady, router.query, mutate, hasAutoSearched]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!bookingCode || !idNumber) {
            alert('لطفا کد رزرو و کد ملی را وارد کنید.');
            return;
        }
        mutate({ booking_code: bookingCode, national_id: idNumber, passport_number: null });
    };

    return (
        <div className="min-h-screen flex flex-col bg-gray-50" dir="rtl">
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
