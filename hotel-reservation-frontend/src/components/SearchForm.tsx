// src/components/SearchForm.tsx
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import { getCities } from '../api/pricingService'; 
import { Input } from './ui/Input'; // فرض می‌کنیم Input برای dropdown و عدد استفاده می‌شود
import { Button } from './ui/Button'; 
// فرض می‌کنیم JalaliDatePicker قبلا پیاده‌سازی شده
import { JalaliDatePicker } from './ui/JalaliDatePicker'; // گام ۲.۲

interface City {
  id: number;
  name: string;
}

const SearchForm: React.FC = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    city_id: '',
    check_in: '',
    check_out: '',
    adults: '1',
    children: '0',
  });

  // واکشی لیست شهرها با React Query
  const { data: cities, isLoading: isCitiesLoading, error: citiesError } = useQuery<City[]>({
    queryKey: ['cities'],
    queryFn: getCities,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  // تابع برای دریافت تاریخ از JalaliDatePicker
  const handleDateChange = (name: string, dateString: string) => {
    setFormData(prev => ({ ...prev, [name]: dateString }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.city_id || !formData.check_in || !formData.check_out) {
      alert("لطفا تمام فیلدهای اصلی جستجو را پر کنید.");
      return;
    }
    
    // هدایت به صفحه نتایج جستجو با Query Params
    router.push({
      pathname: '/search',
      query: formData,
    });
  };

  return (
    <div className="bg-white p-6 shadow-xl rounded-xl border border-gray-100" dir="rtl">
      <h3 className="text-xl font-bold mb-4 text-primary-brand">جستجوی هتل</h3>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
        
        {/* فیلد انتخاب شهر */}
        <div className="col-span-full md:col-span-1">
          <label className="block text-sm font-medium mb-1">مقصد (شهر)</label>
          <select
            name="city_id"
            value={formData.city_id}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
          >
            <option value="">شهر را انتخاب کنید</option>
            {isCitiesLoading && <option disabled>در حال بارگذاری...</option>}
            {cities?.map(city => (
              <option key={city.id} value={city.id}>{city.name}</option>
            ))}
          </select>
          {citiesError && <p className="text-red-500 text-xs mt-1">خطا در بارگذاری شهرها</p>}
        </div>

        {/* فیلد تاریخ ورود */}
        <div className="col-span-full md:col-span-1">
          <JalaliDatePicker 
            label="تاریخ ورود" 
            name="check_in" 
            onDateChange={handleDateChange} 
            required
          />
        </div>
        
        {/* فیلد تاریخ خروج */}
        <div className="col-span-full md:col-span-1">
          <JalaliDatePicker 
            label="تاریخ خروج" 
            name="check_out" 
            onDateChange={handleDateChange} 
            required
          />
        </div>

        {/* فیلد بزرگسالان */}
        <div className="col-span-6 md:col-span-1 grid grid-cols-2 gap-4">
          <Input 
            label="بزرگسالان"
            name="adults"
            type="number"
            min="1"
            value={formData.adults}
            onChange={handleChange}
          />
          {/* فیلد کودکان */}
          <Input 
            label="کودکان"
            name="children"
            type="number"
            min="0"
            value={formData.children}
            onChange={handleChange}
          />
        </div>
        {/* دکمه جستجو */}
        <div className="col-span-full bg-blue-300 text-blue-800 font-bold md:col-span-1">
          <Button type="submit">جستجو</Button>
        </div>
      </form>
    </div>
  );
};

export default SearchForm;
