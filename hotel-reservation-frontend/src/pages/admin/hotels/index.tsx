// src/pages/admin/hotels/index.tsx
import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/layout/AdminLayout';
import { getAdminHotels } from '@/api/admin/hotelService';
import { AdminHotel } from '@/types/admin';
import { Search, MapPin, Star, Edit, CalendarDays, Plus } from 'lucide-react';
import Link from 'next/link';

export default function HotelManagement() {
  const [hotels, setHotels] = useState<AdminHotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // تابع دریافت اطلاعات
  const fetchHotels = async () => {
    setLoading(true);
    try {
      const data = await getAdminHotels(1, searchTerm);
      // نکته: اگر API شما ساختار متفاوتی دارد، اینجا را تطبیق دهید
      // مثلا اگر data.results نیست و خود data آرایه است: setHotels(data as any)
      setHotels(data.results || []); 
    } catch (error) {
      console.error("Failed to fetch hotels", error);
    } finally {
      setLoading(false);
    }
  };

  // دیبانس ساده برای جستجو
  useEffect(() => {
    const delay = setTimeout(() => {
      fetchHotels();
    }, 500);
    return () => clearTimeout(delay);
  }, [searchTerm]);

  return (
    <AdminLayout>
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">مدیریت هتل‌ها</h1>
          <p className="text-sm text-gray-500 mt-1">لیست تمام هتل‌های ثبت شده در سیستم</p>
        </div>
        
        <Link 
          href="/admin/hotels/create" 
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-lg shadow-blue-500/30"
        >
          <Plus size={20} />
          <span>ثبت هتل جدید</span>
        </Link>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex items-center gap-3">
        <Search className="text-gray-400" size={20} />
        <input 
          type="text" 
          placeholder="جستجوی نام هتل یا شهر..." 
          className="flex-1 outline-none text-gray-700 placeholder-gray-400 font-medium bg-transparent"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Grid List */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-600 border-t-transparent"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {hotels.map((hotel) => (
            <div key={hotel.id} className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden group">
              
              {/* Hotel Image / Placeholder */}
              <div className="h-48 bg-gray-200 relative">
                {hotel.image ? (
                    <img src={hotel.image} alt={hotel.name} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 bg-slate-100">
                        تصویر ندارد
                    </div>
                )}
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-2 py-1 rounded-md text-xs font-bold text-gray-700 flex items-center gap-1 shadow-sm">
                  <Star size={12} className="text-yellow-500 fill-yellow-500" />
                  {hotel.stars}
                </div>
              </div>

              {/* Content */}
              <div className="p-5">
                <h3 className="text-lg font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors">
                    {hotel.name}
                </h3>
                
                <div className="flex items-center text-gray-500 text-sm mb-4">
                  <MapPin size={16} className="ml-1" />
                  {hotel.city_name || 'شهر نامشخص'}
                </div>

                <div className="border-t border-gray-100 pt-4 flex items-center justify-between">
                  {/* Action Buttons */}
                  <Link 
                    href={`/admin/hotels/${hotel.id}/pricing`}
                    className="text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
                  >
                    <CalendarDays size={16} />
                    مدیریت قیمت و موجودی
                  </Link>

                  <Link 
                    href={`/admin/hotels/${hotel.id}`}
                    className="text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Edit size={18} />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {!loading && hotels.length === 0 && (
        <div className="text-center py-20 text-gray-400">
          هیچ هتلی یافت نشد.
        </div>
      )}
    </AdminLayout>
  );
}
