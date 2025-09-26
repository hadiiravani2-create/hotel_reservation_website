// src/pages/search.tsx
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import { searchRooms, getAmenities } from '../api/pricingService'; 
import { Button } from '../components/ui/Button'; 

// --- کامپوننت های فرضی مورد نیاز ---
const RoomCard: React.FC<any> = ({ room }) => (
    <div className="bg-white p-4 shadow rounded-lg mb-4 border border-gray-100">
        <h4 className="text-lg font-bold">{room.hotel_name} - {room.room_name}</h4>
        <p className="text-sm text-gray-600">اتاق برای {room.board_options.length} نوع سرویس موجود است.</p>
        {/* نمایش بهترین قیمت */}
        <div className="mt-2 text-primary-brand font-extrabold text-xl">
            شروع قیمت از: {Math.min(...room.board_options.map(opt => opt.total_price)).toLocaleString('fa')} تومان
        </div>
        {/* دکمه انتخاب برای رفتن به صفحه جزئیات/رزرو */}
    </div>
);

const FilterSidebar: React.FC<any> = ({ currentParams, setFilter }) => {
    // واکشی لیست امکانات با React Query
    const { data: amenities } = useQuery<any[]>({
        queryKey: ['amenities'],
        queryFn: getAmenities,
    });
    
    // منطق فیلترها بر اساس پارامترهای stars، min_price، max_price و amenities
    // به دلیل حجم کد، فقط ساختار آن را نشان می‌دهیم.
    return (
        <div className="bg-white p-4 rounded-lg shadow sticky top-4" dir="rtl">
            <h3 className="font-bold mb-4 border-b pb-2">فیلتر نتایج</h3>
            
            {/* فیلتر ستاره هتل */}
            <div className="mb-4">
                <label className="block font-medium mb-2">امتیاز (ستاره)</label>
                {/* چک باکس برای 3، 4 و 5 ستاره */}
                {/* ... */}
            </div>

            {/* فیلتر امکانات رفاهی */}
            <div className="mb-4">
                <label className="block font-medium mb-2">امکانات</label>
                {amenities?.map((amenity: any) => (
                    <div key={amenity.id} className="flex items-center mb-1">
                        <input type="checkbox" id={`amenity-${amenity.id}`} onChange={() => setFilter('amenities', amenity.id)} className="ml-2"/>
                        <label htmlFor={`amenity-${amenity.id}`}>{amenity.name}</label>
                    </div>
                ))}
            </div>
            
            <Button variant="secondary" onClick={() => {/* اعمال فیلتر */}}>اعمال فیلتر</Button>
        </div>
    );
};
// ------------------------------------

const SearchResultsPage: React.FC = () => {
  const router = useRouter();
  const [filters, setFilters] = useState({});

  // تابع برای به‌روزرسانی پارامترهای فیلتر در URL
  const updateUrl = (newFilters: any) => {
    router.push({
      pathname: '/search',
      query: { ...router.query, ...newFilters },
    }, undefined, { shallow: true }); // shallow: true برای به‌روزرسانی URL بدون فراخوانی مجدد getInitialProps
  };
  
  // خواندن پارامترهای جستجو از URL
  const searchParams = {
    city_id: router.query.city_id as string,
    check_in: router.query.check_in as string,
    check_out: router.query.check_out as string,
    adults: parseInt(router.query.adults as string || '1'),
    children: parseInt(router.query.children as string || '0'),
    // اضافه شدن فیلترهای اختیاری
    min_price: router.query.min_price ? parseInt(router.query.min_price as string) : undefined,
    max_price: router.query.max_price ? parseInt(router.query.max_price as string) : undefined,
    stars: router.query.stars as string,
    amenities: router.query.amenities as string,
  };

  // واکشی نتایج جستجو با React Query
  const { data: results, isLoading, error } = useQuery<any[]>({
    queryKey: ['search', searchParams],
    queryFn: () => searchRooms(searchParams),
    enabled: !!(searchParams.city_id && searchParams.check_in && searchParams.check_out),
  });

  const handleSetFilter = (key: string, value: any) => {
      // منطق پیچیده تر برای افزودن/حذف مقادیر در فیلدهایی مثل amenities
      setFilters(prev => {
          const newFilters = { ...prev, [key]: value };
          updateUrl(newFilters);
          return newFilters;
      });
  }

  if (!router.isReady) return <div>در حال بارگذاری...</div>;

  return (
    <div className="container mx-auto p-4" dir="rtl">
      <h1 className="text-3xl font-extrabold mb-6">نتایج جستجو</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        
        {/* ستون فیلترها (سمت راست) */}
        <div className="md:col-span-1">
          <FilterSidebar currentParams={searchParams} setFilter={handleSetFilter}/>
        </div>
        
        {/* ستون نتایج (سمت چپ) */}
        <div className="md:col-span-3">
            {isLoading && <div className="text-center p-8">در حال جستجوی اتاق‌های موجود...</div>}
            {error && <div className="text-red-500 p-8 border border-red-300 rounded-lg">خطا در دریافت نتایج: {error.message}</div>}
            
            {(results && results.length > 0) ? (
                results.map((room) => (
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