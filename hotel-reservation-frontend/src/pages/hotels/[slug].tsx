// src/pages/hotels/[slug].tsx

import React from 'react';
import { useRouter } from 'next/router';
import { useQuery } from '@tanstack/react-query';
import { getHotelDetails } from '../../api/pricingService';
import { Button } from '../../components/ui/Button'; 

// کامپوننت ساده برای نمایش ستاره‌ها
const StarRating: React.FC<{ count: number }> = ({ count }) => (
    <div className="flex text-yellow-500">
        {Array.from({ length: count }, (_, i) => <span key={i}>⭐</span>)}
    </div>
);

// کامپوننت اصلی
const HotelDetailsPage: React.FC = () => {
    const router = useRouter();
    // دریافت اسلاگ از آدرس: /hotels/hotel-e-ziareh
    const { slug } = router.query; 

    // واکشی داده‌های هتل
    const { data: hotel, isLoading, isError } = useQuery({
        queryKey: ['hotelDetails', slug],
        queryFn: () => getHotelDetails(slug as string),
        enabled: !!slug, // تنها زمانی که slug وجود دارد، واکشی کند
    });

    if (isLoading) {
        return <div className="container mx-auto p-8" dir="rtl">در حال بارگذاری جزئیات هتل...</div>;
    }

    if (isError || !hotel) {
        return <div className="container mx-auto p-8" dir="rtl" >متأسفانه، هتل مورد نظر یافت نشد یا خطایی رخ داده است.</div>;
    }

    // --- توابع کمکی ---
    const formatCurrency = (amount: number) => amount.toLocaleString('fa') + ' تومان';
    const handleRoomSelection = (roomId: number, price: number) => {
        // هدایت به صفحه Checkout با پارامترهای اتاق و اطلاعات لازم
        // در اینجا ما تاریخ ها و تعداد نفرات را از Query Params صفحه جستجوی قبلی فرض می‌کنیم
        const searchParams = new URLSearchParams(window.location.search);
        searchParams.set('roomId', roomId.toString());
        searchParams.set('hotelSlug', hotel.slug);

        router.push(`/checkout?${searchParams.toString()}`);
    };
    // --- پایان توابع کمکی ---


    return (
        <div className="container mx-auto p-6 md:p-10" dir="rtl">
            
            {/* --- هدر اصلی هتل --- */}
            <div className="mb-8">
                <h1 className="text-4xl font-extrabold text-gray-900 mb-2">{hotel.name}</h1>
                <div className="flex items-center space-x-4 space-x-reverse text-gray-600">
                    <StarRating count={hotel.stars} />
                    <span>{hotel.address}</span>
                </div>
            </div>

            {/* --- گالری تصاویر (در صورت وجود) --- */}
            <div className="mb-10 grid grid-cols-1 md:grid-cols-2 gap-4">
                {hotel.images && hotel.images.length > 0 ? (
                    <img 
                        src={hotel.images[0].url} 
                        alt={hotel.name} 
                        className="w-full h-96 object-cover rounded-lg shadow-xl"
                    />
                ) : (
                    <div className="w-full h-96 bg-gray-200 flex items-center justify-center rounded-lg">
                        تصویری موجود نیست
                    </div>
                )}
                {/* سایر تصاویر در اینجا می‌توانند به صورت کوچک نمایش داده شوند */}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                
                {/* --- ستون اطلاعات (توضیحات و امکانات) --- */}
                <div className="lg:col-span-2">
                    <h2 className="text-2xl font-bold mb-4 border-b pb-2 text-primary-brand">توضیحات</h2>
                    <p className="text-gray-700 leading-relaxed mb-8">{hotel.description || 'توضیحات جامعی برای این هتل ثبت نشده است.'}</p>

                    <h2 className="text-2xl font-bold mb-4 border-b pb-2 text-primary-brand">امکانات هتل</h2>
                    <ul className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-gray-700">
                        {hotel.amenities && hotel.amenities.map((amenity: any) => (
                            <li key={amenity.id} className="flex items-center text-sm">
                                {/* می‌توان از یک آیکون مناسب در اینجا استفاده کرد */}
                                <span>✅ {amenity.name}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* --- ستون انتخاب اتاق --- */}
                <div className="lg:col-span-1">
                    <div className="sticky top-10 p-6 bg-gray-50 rounded-xl shadow-lg">
                        <h2 className="text-xl font-bold mb-4 text-gray-900 border-b pb-2">اتاق‌های موجود و قیمت‌ها</h2>
                        
                        {/* اینجا فرض می‌کنیم که API جزئیات، اتاق‌های موجود با قیمت‌های اولیه را برمی‌گرداند */}
                        {hotel.rooms && hotel.rooms.length > 0 ? (
                            <div className="space-y-4">
                                {hotel.rooms.map((room: any) => (
                                    <div key={room.id} className="p-4 border bg-white rounded-lg flex justify-between items-center">
                                        <div>
                                            <p className="font-semibold text-lg">{room.room_type}</p>
                                            <p className="text-sm text-gray-600">ظرفیت: {room.capacity} نفر</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm text-gray-500">قیمت نهایی</p>
                                            <p className="text-xl font-extrabold text-green-600 mb-2">
                                                {formatCurrency(room.current_price || 0)} 
                                            </p>
                                            <Button 
                                                className="w-auto px-4 py-1" 
                                                onClick={() => handleRoomSelection(room.id, room.current_price)}
                                            >
                                                رزرو این اتاق
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-red-500 p-4 border border-red-200 bg-red-50 rounded-lg">
                                در تاریخ‌های انتخابی، اتاق خالی برای این هتل وجود ندارد.
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default HotelDetailsPage;