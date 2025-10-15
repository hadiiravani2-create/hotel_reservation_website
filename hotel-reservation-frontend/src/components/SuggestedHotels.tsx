// src/components/SuggestedHotels.tsx
// version: 1.0.0
// FEATURE: Made component dynamic by fetching suggested hotels data from the API.

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getSuggestedHotels } from '@/api/coreService';
import HotelCard from './HotelCard'; // Import the new reusable component
import { SuggestedHotel } from '@/types/hotel';

const SuggestedHotels: React.FC = () => {
    const { data: hotels, isLoading, isError, error } = useQuery<SuggestedHotel[], Error>({
        queryKey: ['suggestedHotels'],
        queryFn: getSuggestedHotels,
    });

    return (
        <div className="bg-gray-50 py-12" dir="rtl">
            <div className="container mx-auto px-4">
                <h2 className="text-3xl font-extrabold text-center text-gray-800 mb-8">هتل‌های پیشنهادی</h2>

                {isLoading && (
                    <div className="text-center text-gray-600">در حال بارگذاری هتل‌ها...</div>
                )}

                {isError && (
                    <div className="text-center text-red-600">
                        خطا در دریافت اطلاعات: {error.message}
                    </div>
                )}

                {hotels && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {hotels.map((hotel) => (
                            <HotelCard key={hotel.id} hotel={hotel} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SuggestedHotels;
