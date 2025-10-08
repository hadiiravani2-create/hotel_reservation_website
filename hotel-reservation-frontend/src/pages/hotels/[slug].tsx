// src/pages/hotels/[slug].tsx
// version: 1.1.0
// This component displays detailed information about a hotel, including dynamic room availability and pricing based on user-selected dates.

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getHotelDetails } from '../../api/pricingService';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { JalaliDatePicker } from '../../components/ui/JalaliDatePicker';

// --- Type Interfaces ---

interface HotelImage {
    image: string;
    caption: string | null;
}

interface BoardType {
    id: number;
    name: string;
    code: string;
}

interface AvailableRoom {
    id: number;
    name: string;
    base_capacity: number;
    board_types: BoardType[];
    calculated_price: {
        price: number;
        duration: number;
    };
    // ... other room fields
}

interface HotelDetails {
    name: string;
    stars: number;
    address: string;
    description: string;
    slug: string;
    images: HotelImage[];
    amenities: { id: number; name:string }[];
    available_rooms: AvailableRoom[];
    rules: string | null;
    check_in_time: string | null;
    check_out_time: string | null;
}

// --- Helper & Sub-Components ---

const StarRating: React.FC<{ count: number }> = ({ count }) => (
    <div className="flex text-yellow-500">
        {Array.from({ length: count }, (_, i) => <span key={i}>⭐</span>)}
    </div>
);

const formatCurrency = (amount: number) => amount.toLocaleString('fa');

// Date Picker Component
const DateSelectionCard: React.FC<{
    checkIn: string;
    duration: string;
    onDateChange: (name: string, date: string) => void;
    onDurationChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onSubmit: () => void;
}> = ({ checkIn, duration, onDateChange, onDurationChange, onSubmit }) => (
    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg my-6" dir="rtl">
        <h3 className="font-bold text-lg mb-3">بررسی قیمت و موجودی</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <JalaliDatePicker label="تاریخ ورود" name="check_in" onDateChange={onDateChange} initialValue={checkIn} required />
            <Input label="مدت اقامت (شب)" name="duration" type="number" min="1" value={duration} onChange={onDurationChange} />
            <Button onClick={onSubmit} className="w-full">بررسی</Button>
        </div>
    </div>
);

// Room Card Component
const RoomCard: React.FC<{
    room: AvailableRoom;
    hasDate: boolean;
    onSelectDateClick: () => void;
}> = ({ room, hasDate, onSelectDateClick }) => {
    const router = useRouter();
    const [selectedBoard, setSelectedBoard] = useState<string>(room.board_types[0]?.id.toString() || '');

    const handleRoomBooking = () => {
        const { slug, check_in, duration } = router.query;
        const params = new URLSearchParams({
            hotelSlug: slug as string,
            roomId: room.id.toString(),
            check_in: check_in as string,
            duration: duration as string,
            board_type: selectedBoard,
        });
        router.push(`/checkout?${params.toString()}`);
    };

    const priceInfo = room.calculated_price;

    return (
        <div className="p-4 border bg-white rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            {/* Room Info */}
            <div>
                <p className="font-semibold text-lg">{room.name}</p>
                <p className="text-sm text-gray-600">ظرفیت: {room.base_capacity} نفر</p>
                {hasDate && room.board_types.length > 0 && (
                     <div className="mt-2">
                        <label className="text-sm font-medium text-gray-700">نوع سرویس:</label>
                        <select
                            value={selectedBoard}
                            onChange={(e) => setSelectedBoard(e.target.value)}
                            className="w-full sm:w-auto mt-1 px-2 py-1 border border-gray-300 rounded-md shadow-sm text-sm"
                        >
                            {room.board_types.map(bt => (
                                <option key={bt.id} value={bt.id}>{bt.name}</option>
                            ))}
                        </select>
                    </div>
                )}
            </div>

            {/* Pricing & Action */}
            <div className="text-left w-full sm:w-auto">
                <p className="text-sm text-gray-500">
                    قیمت برای {priceInfo.duration} شب
                </p>
                <p className="text-xl font-extrabold text-green-600 mb-2">
                    {formatCurrency(priceInfo.price || 0)} تومان
                </p>
                
                {hasDate ? (
                    <Button className="w-full sm:w-auto px-4 py-1" onClick={handleRoomBooking}>
                        رزرو اتاق
                    </Button>
                ) : (
                    <Button variant="outline" className="w-full sm:w-auto px-4 py-1" onClick={onSelectDateClick}>
                        انتخاب تاریخ
                    </Button>
                )}
            </div>
        </div>
    );
};

// --- Main Page Component ---

const HotelDetailsPage: React.FC = () => {
    const router = useRouter();
    const queryClient = useQueryClient();
    const { slug, check_in, duration: queryDuration } = router.query;

    const [checkInDate, setCheckInDate] = useState<string>('');
    const [duration, setDuration] = useState<string>('1');
    const [showDatePicker, setShowDatePicker] = useState(false);

    // Effect to sync state with URL query params on initial load
    useEffect(() => {
        if (router.isReady) {
            setCheckInDate(check_in as string || '');
            setDuration((queryDuration as string) || '1');
            // If dates are provided in URL, no need to force date picker
            setShowDatePicker(!check_in);
        }
    }, [router.isReady, check_in, queryDuration]);

    // Fetch hotel data. Re-fetches when slug, checkInDate, or duration changes.
    const { data: hotel, isLoading, isError, error } = useQuery<HotelDetails, Error>({
        queryKey: ['hotelDetails', slug, checkInDate, duration],
        queryFn: () => getHotelDetails(slug as string, checkInDate, duration),
        enabled: !!slug,
    });
    
    const handleDateCheck = () => {
        router.push({
            pathname: `/hotels/${slug}`,
            query: { ...router.query, check_in: checkInDate, duration },
        }, undefined, { shallow: true }); // Update URL without full reload
        setShowDatePicker(false);
        // Invalidate to force re-fetch if needed, though queryKey change does this
        queryClient.invalidateQueries({ queryKey: ['hotelDetails', slug] });
    };

    if (!router.isReady || isLoading) {
        return <div className="container mx-auto p-8 text-center" dir="rtl">در حال بارگذاری جزئیات هتل...</div>;
    }

    if (isError) {
        return <div className="container mx-auto p-8 text-center text-red-600" dir="rtl">
            خطا در دریافت اطلاعات: {error.message}
        </div>;
    }
    
    if (!hotel) {
         return <div className="container mx-auto p-8 text-center" dir="rtl">متأسفانه، هتل مورد نظر یافت نشد.</div>;
    }
    
    const hasDateInQuery = !!check_in;
    const rooms = hotel.available_rooms || [];

    return (
        <div className="container mx-auto p-6 md:p-10" dir="rtl">
            
            <header className="mb-8">
                <h1 className="text-4xl font-extrabold text-gray-900 mb-2">{hotel.name}</h1>
                <div className="flex items-center space-x-4 space-x-reverse text-gray-600">
                    <StarRating count={hotel.stars} />
                    <span>{hotel.address}</span>
                </div>
            </header>

            <div className="mb-10 grid grid-cols-1 md:grid-cols-2 gap-4">
                {hotel.images && hotel.images.length > 0 ? (
                    <div className="relative w-full h-96 rounded-lg shadow-xl overflow-hidden">
                        <Image src={hotel.images[0].image} alt={hotel.name} layout="fill" objectFit="cover" priority />
                    </div>
                ) : <div className="w-full h-96 bg-gray-200 flex items-center justify-center rounded-lg">تصویری موجود نیست</div>}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <main className="lg:col-span-2">
                    <section className="mb-8">
                        <h2 className="text-2xl font-bold mb-4 border-b pb-2 text-primary-brand">توضیحات هتل</h2>
                        <p className="text-gray-700 leading-relaxed">{hotel.description || 'توضیحات جامعی ثبت نشده است.'}</p>
                    </section>
                    
                    <section className="mb-8">
                        <h2 className="text-2xl font-bold mb-4 border-b pb-2 text-primary-brand">مقررات و اطلاعات</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                            <p><strong>ساعت ورود:</strong> {hotel.check_in_time || 'اعلام نشده'}</p>
                            <p><strong>ساعت خروج:</strong> {hotel.check_out_time || 'اعلام نشده'}</p>
                        </div>
                         {hotel.rules && <p className="mt-4 text-gray-700 leading-relaxed text-sm whitespace-pre-line">{hotel.rules}</p>}
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4 border-b pb-2 text-primary-brand">امکانات هتل</h2>
                        <ul className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-gray-700">
                            {hotel.amenities.map(amenity => (
                                <li key={amenity.id} className="flex items-center text-sm">✅ {amenity.name}</li>
                            ))}
                        </ul>
                    </section>
                </main>

                <aside className="lg:col-span-1">
                    <div className="sticky top-10 p-6 bg-gray-50 rounded-xl shadow-lg">
                        <div className="flex justify-between items-center">
                             <h2 className="text-xl font-bold text-gray-900">اتاق‌های موجود</h2>
                             {hasDateInQuery && (
                                <Button variant="link" onClick={() => setShowDatePicker(!showDatePicker)}>تغییر تاریخ</Button>
                             )}
                        </div>
                        
                        {showDatePicker && (
                             <DateSelectionCard 
                                checkIn={checkInDate}
                                duration={duration}
                                onDateChange={(name, date) => setCheckInDate(date)}
                                onDurationChange={(e) => setDuration(e.target.value)}
                                onSubmit={handleDateCheck}
                            />
                        )}

                        <div className="mt-4 space-y-4">
                            {rooms.length > 0 ? (
                                rooms.map(room => (
                                    <RoomCard key={room.id} room={room} hasDate={hasDateInQuery} onSelectDateClick={() => setShowDatePicker(true)} />
                                ))
                            ) : (
                                <div className="text-center text-red-500 p-4 border border-red-200 bg-red-50 rounded-lg">
                                    {hasDateInQuery 
                                        ? "در تاریخ انتخابی، اتاق خالی وجود ندارد."
                                        : "برای مشاهده اتاق‌های موجود، لطفا تاریخ را انتخاب کنید."
                                    }
                                </div>
                            )}
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
};

export default HotelDetailsPage;
