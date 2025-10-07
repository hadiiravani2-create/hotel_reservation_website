// src/pages/search.tsx v1.0.4
// Update: Logic adapted to search for hotels based on duration and display hotel results.
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import { searchHotels, getAmenities, SearchParams as ApiSearchParams, HotelSearchResult } from '../api/pricingService'; 
import { Button } from '../components/ui/Button'; 
import Link from 'next/link';

interface Amenity {
    id: number;
    name: string;
}

// Interface for search URL parameters (from Next.js Router)
interface SearchParams {
    city_id: string;
    check_in: string;
    duration: string; // duration is now a string from URL
    min_price?: string;
    max_price?: string;
    stars?: string;
    amenities?: string;
}

interface FilterSidebarProps {
    setFilter: (key: string, value: string | number | boolean | (string | number)[]) => void;
}

// --- Sub-Components ---
const HotelCard: React.FC<{ hotel: HotelSearchResult }> = ({ hotel }) => (
    <div className="bg-white p-4 shadow rounded-lg mb-4 border border-gray-100 flex justify-between items-center">
        <div>
            <h4 className="text-lg font-bold">{hotel.hotel_name}</h4>
            <p className="text-sm text-gray-600">{hotel.hotel_stars} ستاره</p>
            <div className="mt-2 text-primary-brand font-extrabold text-xl">
                شروع قیمت از: {hotel.min_price.toLocaleString('fa')} تومان
            </div>
        </div>
        <Link href={`/hotels/${hotel.hotel_slug}?check_in=${useRouter().query.check_in}&duration=${useRouter().query.duration}`}>
            <Button>مشاهده اتاق‌ها</Button>
        </Link>
    </div>
);

const FilterSidebar: React.FC<FilterSidebarProps> = ({ setFilter }) => { 
    const { data: amenities } = useQuery<Amenity[]>({ 
        queryKey: ['amenities'],
        queryFn: getAmenities,
    });
    
    return (
        <div className="bg-white p-4 rounded-lg shadow sticky top-4" dir="rtl">
            <h3 className="font-bold mb-4 border-b pb-2">فیلتر نتایج</h3>
            {/* Filtering UI elements would go here */}
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
    // ... other filters
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
    <div className="container mx-auto p-4" dir="rtl">
      <h1 className="text-3xl font-extrabold mb-6">نتایج جستجو</h1>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1">
          <FilterSidebar setFilter={handleSetFilter}/>
        </div>
        <div className="md:col-span-3">
            {isLoading && <div className="text-center p-8">در حال جستجوی هتل‌های موجود...</div>}
            {error && <div className="text-red-500 p-8 border border-red-300 rounded-lg">خطا در دریافت نتایج: {(error as Error).message}</div>} 
            
            {(results && results.length > 0) ? (
                results.map((hotel: HotelSearchResult) => ( 
                    <HotelCard key={hotel.hotel_id} hotel={hotel} />
                ))
            ) : (
                 !isLoading && <div className="text-center p-8 bg-yellow-100 rounded-lg">متأسفانه هیچ هتلی با این مشخصات یافت نشد.</div>
            )}
        </div>
      </div>
    </div>
  );
};

export default SearchResultsPage;
