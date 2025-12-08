// src/pages/search.tsx
// version: 1.4.0
// FIX: Updated useQuery to support TanStack Query v5 (replaced 'keepPreviousData: true' with 'placeholderData: keepPreviousData').

import React, { useState } from 'react';
// FIX: Added 'keepPreviousData' to imports
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import { searchHotels, SearchParams as ApiSearchParams } from '../api/pricingService';
import Header from '../components/Header';
import HotelCard from '../components/HotelCard'; 
import SearchForm from '../components/SearchForm';
import FilterSidebar from '../components/search/FilterSidebar'; 
import { HotelSummary } from '@/types/hotel'; 
import { toPersianDigits } from '@/utils/format';
import { Squares2X2Icon, ListBulletIcon } from '@heroicons/react/24/outline';

// --- Type Interfaces ---

interface RawHotelSearchResult {
    hotel_id: number;
    hotel_name: string;
    hotel_slug: string;
    hotel_stars: number;
    min_price: number;
    address?: string;
    city?: string;
    main_image?: { image: string; alt?: string; } | string;
}

const SearchResultsPage: React.FC = () => {
    const router = useRouter();
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

    // Parse filters from URL
    const filters = {
        city_id: router.query.city_id as string,
        check_in: router.query.check_in as string,
        duration: router.query.duration as string || '1',
        min_price: router.query.min_price as string || '',
        max_price: router.query.max_price as string || '',
        stars: router.query.stars ? (router.query.stars as string).split(',').map(Number) : [],
        amenities: router.query.amenities ? (router.query.amenities as string).split(',').map(Number) : [],
    };

    // Prepare API params
    const apiSearchParams: ApiSearchParams = {
        city_id: parseInt(filters.city_id, 10),
        check_in: filters.check_in,
        duration: parseInt(filters.duration, 10),
        min_price: filters.min_price || undefined,
        max_price: filters.max_price || undefined,
        stars: filters.stars.length > 0 ? filters.stars.join(',') : undefined,
        amenities: filters.amenities.length > 0 ? filters.amenities.join(',') : undefined,
    }

    const { data: results, isLoading, error } = useQuery<RawHotelSearchResult[]>({
        queryKey: ['searchHotels', apiSearchParams],
        queryFn: () => searchHotels(apiSearchParams),
        enabled: !!(apiSearchParams.city_id && apiSearchParams.check_in && apiSearchParams.duration > 0),
        // FIX: TanStack Query v5 syntax
        placeholderData: keepPreviousData, 
    });

    // Handle Filter Apply from Sidebar
    const handleFilterApply = (newFilters: { minPrice: string; maxPrice: string; stars: number[]; amenities: number[] }) => {
        // Update URL query params without reloading page
        router.push({
            pathname: '/search',
            query: {
                ...router.query,
                min_price: newFilters.minPrice || [], 
                max_price: newFilters.maxPrice || [],
                stars: newFilters.stars.join(','),
                amenities: newFilters.amenities.join(','),
            },
        }, undefined, { shallow: true });
    };

    if (!router.isReady) return <div className="text-center p-10">در حال بارگذاری...</div>;

    return (
        <div className="bg-slate-50 min-h-screen">
            <Header />
            <div className="container mx-auto p-4 md:p-8" dir="rtl">
                
                {/* Search Form */}
                <div className="mb-8 bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h2 className="text-lg font-bold text-gray-800 mb-4 hidden md:block">تغییر جستجو</h2>
                    <SearchForm />
                </div>

                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">نتایج جستجوی هتل</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        برای اقامت {toPersianDigits(filters.duration)} شب در تاریخ {toPersianDigits(filters.check_in)}
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Sidebar with New Filter Component */}
                    <aside className="lg:col-span-1">
                        <FilterSidebar 
                            onFilterApply={handleFilterApply}
                            initialFilters={{
                                minPrice: filters.min_price,
                                maxPrice: filters.max_price,
                                stars: filters.stars,
                                amenities: filters.amenities
                            }}
                        />
                    </aside>

                    {/* Main Content */}
                    <main className="lg:col-span-3">
                        
                        {/* Toolbar */}
                        {!isLoading && !error && results && (
                            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                                <h2 className="font-bold text-gray-700 text-sm">
                                    {results.length > 0 
                                        ? `${toPersianDigits(results.length)} هتل یافت شد` 
                                        : 'نتیجه‌ای یافت نشد'}
                                </h2>
                                
                                <div className="flex items-center gap-3 mt-4 sm:mt-0">
                                    <span className="text-xs text-gray-500">حالت نمایش:</span>
                                    <div className="flex bg-gray-100 p-1 rounded-lg">
                                        <button 
                                            onClick={() => setViewMode('grid')}
                                            className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white shadow text-primary-brand' : 'text-gray-400 hover:text-gray-600'}`}
                                        >
                                            <Squares2X2Icon className="w-5 h-5" />
                                        </button>
                                        <button 
                                            onClick={() => setViewMode('list')}
                                            className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-white shadow text-primary-brand' : 'text-gray-400 hover:text-gray-600'}`}
                                        >
                                            <ListBulletIcon className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {isLoading && (
                            <div className="text-center p-12 bg-white rounded-xl shadow-sm border border-gray-100">
                                <div className="animate-spin w-10 h-10 border-4 border-primary-brand border-t-transparent rounded-full mx-auto mb-4"></div>
                                <span className="text-gray-600 font-medium">در حال به‌روزرسانی نتایج...</span>
                            </div>
                        )}
                        
                        {!isLoading && results && results.length > 0 && (
                            <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-6"}>
                                {results.map((rawHotel) => {
                                    const hotel: HotelSummary = {
                                        id: rawHotel.hotel_id,
                                        name: rawHotel.hotel_name,
                                        slug: rawHotel.hotel_slug,
                                        stars: rawHotel.hotel_stars,
                                        min_price: rawHotel.min_price,
                                        address: rawHotel.address,
                                        city_name: rawHotel.city,
                                        main_image: typeof rawHotel.main_image === 'object' && rawHotel.main_image !== null 
                                            ? rawHotel.main_image.image 
                                            : (rawHotel.main_image as string | null)
                                    };

                                    return <HotelCard key={hotel.id} hotel={hotel} variant={viewMode} />;
                                })}
                            </div>
                        )}
                        
                        {!isLoading && results && results.length === 0 && (
                            <div className="text-center p-10 bg-white rounded-xl border border-gray-200">
                                <h3 className="text-lg font-bold text-gray-700">نتیجه‌ای با این فیلترها یافت نشد.</h3>
                                <p className="text-gray-500 mt-2">لطفاً فیلترها را تغییر دهید.</p>
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
};

export default SearchResultsPage;
