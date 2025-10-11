// src/pages/search.tsx
// version: 0.0.2
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import Image from 'next/image'; 
import { searchHotels, getAmenities, SearchParams as ApiSearchParams, HotelSearchResult } from '../api/pricingService';
import { Button } from '../components/ui/Button';
import Link from 'next/link';
import Header from '../components/Header';

// --- Type Interfaces ---

interface Amenity {
    id: number;
    name: string;
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

// FIX: Corrected access to nested image URL within the main_image object
const HotelCard: React.FC<{ hotel: HotelSearchResult }> = ({ hotel }) => {
    // Attempt to access the nested image URL, common pattern for DRF Serializers
    const imageUrl = (hotel as any).main_image?.image || null; 

    return (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col md:flex-row mb-6 hover:shadow-xl transition-shadow duration-300">
            {/* Image Container - Needs relative positioning and defined height */}
            <div className="md:w-1/3 relative flex-shrink-0 h-48 md:h-auto">
                {/* Check if a valid image URL was found */}
                {imageUrl ? (
                    <Image
                        src={imageUrl} 
                        alt={hotel.hotel_name}
                        layout="fill"
                        objectFit="cover"
                        className="object-cover"
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
                        {Array.from({ length: hotel.hotel_stars }, (_, i) => <span key={i}>⭐</span>)}
                    </p>
                    <p className="text-sm text-gray-500 mt-2">آدرس هتل در اینجا...</p>
                </div>
                <div className="flex justify-between items-center mt-4">
                    <div className="text-primary-brand font-extrabold text-2xl">
                        <span className="text-sm font-normal text-gray-600">شروع قیمت از </span>
                        {hotel.min_price.toLocaleString('fa')}
                        <span className="text-sm font-normal text-gray-600"> تومان</span>
                    </div>
                    <Link href={`/hotels/${hotel.hotel_slug}?check_in=${useRouter().query.check_in}&duration=${useRouter().query.duration}`}>
                        <Button className="!w-auto px-6">مشاهده و رزرو</Button>
                    </Link>
                </div>
            </div>
        </div>
    );
};

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
                        <input type="checkbox" id={`amenity-${amenity.id}`} className="ml-2"/>
                        <label htmlFor={`amenity-${amenity.id}`}>{amenity.name}</label>
                    </div>
                ))}
            </div>
            <Button variant="secondary" className="w-full">اعمال فیلتر</Button>
        </div>
    );
};

// ------------------------------------

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
        const newFilters = { [key]: value };
        updateUrl(newFilters as Partial<SearchParams>);
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
