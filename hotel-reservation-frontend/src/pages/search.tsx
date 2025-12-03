// src/pages/search.tsx
// version: 0.0.4
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import Image from 'next/image'; 
import { searchHotels, getAmenities, SearchParams as ApiSearchParams } from '../api/pricingService';
import { Button } from '../components/ui/Button';
import Link from 'next/link';
import Header from '../components/Header';
import { formatPrice } from '@/utils/format';

// --- Type Interfaces ---

interface Amenity {
    id: number;
    name: string;
}

// Update Interface based on real API response
export interface HotelSearchResult {
    hotel_id: number;
    hotel_name: string;
    hotel_slug: string;
    hotel_stars: number;
    min_price: number;
    address?: string; // فیلد آدرس اضافه شد
    city?: string;
    main_image?: {
        image: string;
        alt?: string;
    };
}

interface SearchParams {
    city_id: string;
    check_in: string;
    duration: string;
    min_price?: string;
    max_price?: string;
    stars?: string;
    amenities?: string;
}

interface FilterSidebarProps {
    setFilter: (key: string, value: string | number | boolean | (string | number)[]) => void;
}

// --- Sub-Components ---

const HotelCard: React.FC<{ hotel: HotelSearchResult }> = ({ hotel }) => {
    // 1. Fix Image URL logic
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    let imageUrl = hotel.main_image?.image || null;
    
    // If image path is relative (starts with /), prepend backend URL
    if (imageUrl && imageUrl.startsWith('/')) {
        imageUrl = `${backendUrl}${imageUrl}`;
    }

    // 2. Determine Address
    const displayAddress = hotel.address || hotel.city || 'آدرس ثبت نشده';

    return (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col md:flex-row mb-6 hover:shadow-xl transition-shadow duration-300">
            <div className="md:w-1/3 relative flex-shrink-0 h-48 md:h-auto">
                {imageUrl ? (
                    <Image
                        src={imageUrl} 
                        alt={hotel.hotel_name}
                        layout="fill"
                        objectFit="cover"
                        className="object-cover"
                        // Add unoptimized if needed for external/local dev images without next.config setup
                        unoptimized={true} 
                    />
                ) : (
                    <div className="bg-gray-200 h-full w-full flex items-center justify-center">
                        <span className="text-gray-500">تصویر هتل</span>
                    </div>
                )}
            </div>
            <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                    <h4 className="text-xl font-bold text-gray-900">{hotel.hotel_name}</h4>
                    <p className="text-yellow-500 mt-1">
                        {Array.from({ length: hotel.hotel_stars || 0 }, (_, i) => <span key={i}>⭐</span>)}
                    </p>
                    {/* 3. Fix Hardcoded Address */}
                    <p className="text-sm text-gray-500 mt-2 flex items-center">
                        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                        {displayAddress}
                    </p>
                </div>
                <div className="flex justify-between items-center mt-4">
                    <div className="text-primary-brand font-extrabold text-2xl">
                        <span className="text-sm font-normal text-gray-600">شروع قیمت از </span>
                        {/* Price Rule Applied */}
                        {formatPrice(hotel.min_price)}
                    </div>
                    <Link href={`/hotels/${hotel.hotel_slug}?check_in=${useRouter().query.check_in}&duration=${useRouter().query.duration}`}>
                        <Button className="!w-auto px-6">مشاهده و رزرو</Button>
                    </Link>
                </div>
            </div>
        </div>
    );
};

// ... (Rest of the file: FilterSidebar and SearchResultsPage remain mostly unchanged)
const FilterSidebar: React.FC<FilterSidebarProps> = ({ setFilter }) => {
    const { data: amenities } = useQuery<Amenity[]>({
        queryKey: ['amenities'],
        queryFn: getAmenities,
    });
    
    return (
        <div className="bg-white p-4 rounded-lg shadow sticky top-4" dir="rtl">
            <h3 className="font-bold mb-4 border-b pb-2">فیلتر نتایج</h3>
            <div className="mb-4">
                <label className="block font-medium mb-2">امکانات</label>
                {amenities?.map((amenity: Amenity) => (
                    <div key={amenity.id} className="flex items-center mb-1">
                        <input 
                            type="checkbox" 
                            id={`amenity-${amenity.id}`} 
                            className="ml-2"
                            onChange={(e) => setFilter('amenities', e.target.checked ? amenity.id : '')} 
                        />
                        <label htmlFor={`amenity-${amenity.id}`}>{amenity.name}</label>
                    </div>
                ))}
            </div>
            <Button variant="secondary" className="w-full">اعمال فیلتر</Button>
        </div>
    );
};

const SearchResultsPage: React.FC = () => {
    const router = useRouter();

    const updateUrl = (newFilters: Partial<SearchParams>) => {
        router.push({
            pathname: '/search',
            query: { ...router.query, ...newFilters },
        }, undefined, { shallow: true });
    };

    const searchParams: SearchParams = {
        city_id: router.query.city_id as string,
        check_in: router.query.check_in as string,
        duration: router.query.duration as string || '1',
    };

    const apiSearchParams: ApiSearchParams = {
        city_id: parseInt(searchParams.city_id, 10),
        check_in: searchParams.check_in,
        duration: parseInt(searchParams.duration, 10),
    }

    const { data: results, isLoading, error } = useQuery<HotelSearchResult[]>({
        queryKey: ['searchHotels', apiSearchParams],
        queryFn: () => searchHotels(apiSearchParams),
        enabled: !!(apiSearchParams.city_id && apiSearchParams.check_in && apiSearchParams.duration > 0),
    });

    const handleSetFilter = (key: string, value: any) => {
        // Simple implementation for demo
        console.log('Filter set:', key, value);
    }

    if (!router.isReady) return <div>در حال بارگذاری...</div>;

    return (
        <div className="bg-slate-50 min-h-screen">
            <Header />
            <div className="container mx-auto p-4" dir="rtl">
                <h1 className="text-3xl font-extrabold my-8">نتایج جستجو</h1>
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    <aside className="lg:col-span-1">
                        <FilterSidebar setFilter={handleSetFilter}/>
                    </aside>
                    <main className="lg:col-span-3">
                        {isLoading && <div className="text-center p-8">در حال جستجوی هتل‌های موجود...</div>}
                        {error && <div className="text-red-500 p-8 border border-red-300 rounded-lg">خطا در دریافت نتایج: {(error as Error).message}</div>}

                        {(results && results.length > 0) ? (
                            results.map((hotel: HotelSearchResult) => (
                                <HotelCard key={hotel.hotel_id} hotel={hotel} />
                            ))
                        ) : (
                             !isLoading && <div className="text-center p-8 bg-yellow-100 rounded-lg">متأسفانه هیچ هتلی با این مشخصات یافت نشد.</div>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
};

export default SearchResultsPage;
