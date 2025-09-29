// src/pages/search.tsx v1.0.3
import React from 'react'; // Removed unused useState
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/router';
// Import SearchParams as ApiSearchParams for clarity
import { searchRooms, getAmenities, SearchParams as ApiSearchParams } from '../api/pricingService'; 
import { Button } from '../components/ui/Button'; 

// Interface definitions from pricingService.ts (re-declared for local component typing)
interface RoomSearchResult {
    room_id: number;
    room_name: string;
    hotel_id: number;
    hotel_name: string;
    board_options: Array<{
      board_type_id: number;
      board_type_name: string;
      total_price: number;
    }>;
}

interface Amenity {
    id: number;
    name: string;
}

// Interface for search URL parameters (from Next.js Router - mostly strings)
interface SearchParams {
    city_id: string; // From router query, always string
    check_in: string;
    check_out: string;
    adults: number;
    children: number;
    min_price?: number;
    max_price?: number;
    stars?: string;
    amenities?: string;
}

// Interface for FilterSidebar props
interface FilterSidebarProps {
    setFilter: (key: string, value: string | number | boolean | (string | number)[]) => void;
}

// --- Required Sub-Components ---
const RoomCard: React.FC<{ room: RoomSearchResult }> = ({ room }) => (
    <div className="bg-white p-4 shadow rounded-lg mb-4 border border-gray-100">
        <h4 className="text-lg font-bold">{room.hotel_name} - {room.room_name}</h4>
        <p className="text-sm text-gray-600">اتاق برای {room.board_options.length} نوع سرویس موجود است.</p>
        {/* Display best price */}
        <div className="mt-2 text-primary-brand font-extrabold text-xl">
            شروع قیمت از: {Math.min(...room.board_options.map(opt => opt.total_price)).toLocaleString('fa')} تومان
        </div>
        {/* Button to navigate to hotel details or booking */}
    </div>
);

const FilterSidebar: React.FC<FilterSidebarProps> = ({ setFilter }) => { 
    // Fetch amenities list with React Query
    const { data: amenities } = useQuery<Amenity[]>({ 
        queryKey: ['amenities'],
        queryFn: getAmenities,
    });
    
    // Filtering logic based on params like stars, min_price, max_price, and amenities
    return (
        <div className="bg-white p-4 rounded-lg shadow sticky top-4" dir="rtl">
            <h3 className="font-bold mb-4 border-b pb-2">فیلتر نتایج</h3>
            
            {/* Hotel Star Filter */}
            <div className="mb-4">
                <label className="block font-medium mb-2">امتیاز (ستاره)</label>
                {/* Checkboxes for 3, 4, and 5 stars */}
                {/* ... */}
            </div>

            {/* Amenities Filter */}
            <div className="mb-4">
                <label className="block font-medium mb-2">امکانات</label>
                {amenities?.map((amenity: Amenity) => ( 
                    <div key={amenity.id} className="flex items-center mb-1">
                        <input 
                            type="checkbox" 
                            id={`amenity-${amenity.id}`} 
                            // Update logic to pass amenity.id as string or number
                            onChange={(e) => setFilter('amenities', e.target.checked ? amenity.id.toString() : '')} 
                            className="ml-2"
                        />
                        <label htmlFor={`amenity-${amenity.id}`}>{amenity.name}</label>
                    </div>
                ))}
            </div>
            
            <Button variant="secondary" className="w-full" onClick={() => {/* Apply filter logic */}}>اعمال فیلتر</Button>
        </div>
    );
};
// ------------------------------------

const SearchResultsPage: React.FC = () => {
  const router = useRouter();

  // Function to update filter parameters in URL
  const updateUrl = (newFilters: Partial<SearchParams>) => { 
    router.push({
      pathname: '/search',
      query: { ...router.query, ...newFilters },
    }, undefined, { shallow: true });
  };
  
  // Read search parameters from URL (all as strings initially, or parsed numbers)
  const searchParams: SearchParams = {
    city_id: router.query.city_id as string,
    check_in: router.query.check_in as string,
    check_out: router.query.check_out as string,
    adults: parseInt(router.query.adults as string || '1', 10),
    children: parseInt(router.query.children as string || '0', 10),
    min_price: router.query.min_price ? parseInt(router.query.min_price as string, 10) : undefined,
    max_price: router.query.max_price ? parseInt(router.query.max_price as string, 10) : undefined,
    stars: router.query.stars as string,
    amenities: router.query.amenities as string,
  };

  // Convert searchParams to match ApiSearchParams required structure (city_id must be number)
  const apiSearchParams: ApiSearchParams = {
    ...searchParams,
    // Explicitly parse city_id to number as required by the API
    city_id: parseInt(searchParams.city_id, 10), 
  }
  
  // The ApiSearchParams object should now match the expected input for searchRooms.
  const { data: results, isLoading, error } = useQuery<RoomSearchResult[]>({ 
    // Fixed: Use apiSearchParams in queryKey for consistency and type safety (Fixes 'any' at line 126)
    queryKey: ['search', apiSearchParams], 
    // Pass the strictly typed API parameter object
    queryFn: () => searchRooms(apiSearchParams), 
    enabled: !!(searchParams.city_id && searchParams.check_in && searchParams.check_out),
  });

  const handleSetFilter = (key: string, value: string | number | boolean | (string | number)[]) => {
      // Complex logic for adding/removing values in fields like amenities (simplified here)
      const newFilters = { [key]: value };
      updateUrl(newFilters as Partial<SearchParams>); // Cast to partial search params
  }

  if (!router.isReady) return <div>در حال بارگذاری...</div>;

  return (
    <div className="container mx-auto p-4" dir="rtl">
      <h1 className="text-3xl font-extrabold mb-6">نتایج جستجو</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        
        {/* Filter Column (Right Side) */}
        <div className="md:col-span-1">
          <FilterSidebar setFilter={handleSetFilter}/>
        </div>
        
        {/* Results Column (Left Side) */}
        <div className="md:col-span-3">
            {isLoading && <div className="text-center p-8">در حال جستجوی اتاق‌های موجود...</div>}
            {/* Used Error type casting for error message access */}
            {error && <div className="text-red-500 p-8 border border-red-300 rounded-lg">خطا در دریافت نتایج: {(error as Error).message}</div>} 
            
            {(results && results.length > 0) ? (
                results.map((room: RoomSearchResult) => ( 
                    <RoomCard key={room.room_id} room={room} />
                ))
            ) : (
                 !isLoading && <div className="text-center p-8 bg-yellow-100 rounded-lg">متأسفانه هیچ اتاقی با این مشخصات یافت نشد.</div>
            )}
        </div>
      </div>
    </div>
  );
};

export default SearchResultsPage;
