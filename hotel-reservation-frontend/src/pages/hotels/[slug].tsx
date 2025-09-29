// src/pages/hotels/[slug].tsx v1.0.0

import React from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image'; // Import Next.js Image component
import { useQuery } from '@tanstack/react-query';
import { getHotelDetails } from '../../api/pricingService';
import { Button } from '../../components/ui/Button'; 

// Interface for a single hotel image
interface HotelImage {
    id: number;
    url: string;
    // ... other image fields
}

// Interface for a single available room
interface AvailableRoom {
    id: number;
    room_type: string;
    capacity: number;
    current_price: number;
    // ... other room details
}

// Interface for the fetched hotel details data
interface HotelDetails {
    name: string;
    stars: number;
    address: string;
    description: string;
    slug: string;
    images: HotelImage[];
    amenities: { id: number; name: string; }[];
    rooms: AvailableRoom[];
}

// Simple component to display stars
const StarRating: React.FC<{ count: number }> = ({ count }) => (
    <div className="flex text-yellow-500">
        {Array.from({ length: count }, (_, i) => <span key={i}>⭐</span>)}
    </div>
);

// Main component
const HotelDetailsPage: React.FC = () => {
    const router = useRouter();
    // Retrieve slug from the address: /hotels/hotel-e-ziareh
    const { slug } = router.query; 

    // Fetch hotel data, explicitly typing the expected data
    const { data: hotel, isLoading, isError } = useQuery<HotelDetails | undefined>({
        queryKey: ['hotelDetails', slug],
        queryFn: () => getHotelDetails(slug as string),
        enabled: !!slug, // Only fetch when slug exists
    });

    if (isLoading) {
        return <div className="container mx-auto p-8" dir="rtl">در حال بارگذاری جزئیات هتل...</div>;
    }

    if (isError || !hotel) {
        return <div className="container mx-auto p-8" dir="rtl" >متأسفانه، هتل مورد نظر یافت نشد یا خطایی رخ داده است.</div>;
    }

    // --- Helper Functions ---
    const formatCurrency = (amount: number) => amount.toLocaleString('fa') + ' تومان';
    const handleRoomSelection = (roomId: number) => { // Removed unused 'price' parameter
        // Redirect to Checkout page with room parameters and necessary info
        // Here we assume dates and number of people come from the previous search Query Params
        const searchParams = new URLSearchParams(window.location.search);
        searchParams.set('roomId', roomId.toString());
        searchParams.set('hotelSlug', hotel.slug);

        router.push(`/checkout?${searchParams.toString()}`);
    };
    // --- End Helper Functions ---


    return (
        <div className="container mx-auto p-6 md:p-10" dir="rtl">
            
            {/* --- Main Hotel Header --- */}
            <div className="mb-8">
                <h1 className="text-4xl font-extrabold text-gray-900 mb-2">{hotel.name}</h1>
                <div className="flex items-center space-x-4 space-x-reverse text-gray-600">
                    <StarRating count={hotel.stars} />
                    <span>{hotel.address}</span>
                </div>
            </div>

            {/* --- Image Gallery --- */}
            <div className="mb-10 grid grid-cols-1 md:grid-cols-2 gap-4">
                {hotel.images && hotel.images.length > 0 ? (
                    <div className="relative w-full h-96 rounded-lg shadow-xl overflow-hidden">
                        <Image 
                            src={hotel.images[0].url} 
                            alt={hotel.name} 
                            fill={true} // Use fill for responsive image
                            style={{ objectFit: 'cover' }}
                            priority // Load the main image as a priority
                        />
                    </div>
                ) : (
                    <div className="w-full h-96 bg-gray-200 flex items-center justify-center rounded-lg">
                        تصویری موجود نیست
                    </div>
                )}
                {/* Other images can be displayed here in smaller form */}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                
                {/* --- Information Column (Description and Amenities) --- */}
                <div className="lg:col-span-2">
                    <h2 className="text-2xl font-bold mb-4 border-b pb-2 text-primary-brand">توضیحات</h2>
                    <p className="text-gray-700 leading-relaxed mb-8">{hotel.description || 'توضیحات جامعی برای این هتل ثبت نشده است.'}</p>

                    <h2 className="text-2xl font-bold mb-4 border-b pb-2 text-primary-brand">امکانات هتل</h2>
                    <ul className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-gray-700">
                        {hotel.amenities.map((amenity: { id: number; name: string }) => ( // Explicitly typed amenity
                            <li key={amenity.id} className="flex items-center text-sm">
                                {/* Use a suitable icon here */}
                                <span>✅ {amenity.name}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* --- Room Selection Column --- */}
                <div className="lg:col-span-1">
                    <div className="sticky top-10 p-6 bg-gray-50 rounded-xl shadow-lg">
                        <h2 className="text-xl font-bold mb-4 text-gray-900 border-b pb-2">اتاق‌های موجود و قیمت‌ها</h2>
                        
                        {/* Assuming the details API returns available rooms with initial prices */}
                        {hotel.rooms && hotel.rooms.length > 0 ? (
                            <div className="space-y-4">
                                {hotel.rooms.map((room: AvailableRoom) => ( // Explicitly typed room
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
                                                onClick={() => handleRoomSelection(room.id)}
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
