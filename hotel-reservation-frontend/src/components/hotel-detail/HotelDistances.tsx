// src/components/hotel-detail/HotelDistances.tsx
// Component to display nearby attractions sorted by distance.

import React, { useMemo } from 'react';
import { MapPin, Car } from 'lucide-react';
import { calculateDistance, formatDistance } from '@/utils/geo';
import { Attraction } from '@/types/attraction'; // اطمینان حاصل کنید این تایپ وجود دارد یا از any استفاده کنید
import { toPersianDigits } from '@/utils/format';

interface HotelDistancesProps {
  hotelLat: number | null;
  hotelLng: number | null;
  attractions: any[]; // یا Attraction[] اگر تایپ آن را دارید
}

const HotelDistances: React.FC<HotelDistancesProps> = ({ hotelLat, hotelLng, attractions }) => {
  
  const sortedAttractions = useMemo(() => {
    if (!hotelLat || !hotelLng || !attractions || attractions.length === 0) return [];

    return attractions
      .map(attraction => {
        const distance = calculateDistance(
            Number(hotelLat), 
            Number(hotelLng), 
            Number(attraction.latitude), 
            Number(attraction.longitude)
        );
        return { ...attraction, distance };
      })
      .sort((a, b) => a.distance - b.distance) // مرتب‌سازی از نزدیک‌ترین
      .slice(0, 6); // نمایش ۶ مورد اول
  }, [hotelLat, hotelLng, attractions]);

  if (!hotelLat || !hotelLng || sortedAttractions.length === 0) {
    return null;
  }

  return (
    <section className="mb-8 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-800">
        <MapPin className="w-5 h-5 text-primary-brand" />
        فاصله تا مراکز مهم
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sortedAttractions.map((item) => (
          <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors group">
            <div className="flex items-center gap-3">
               {/* اگر تصویر داشت نمایش بده، وگرنه آیکون */}
               {item.images && item.images.length > 0 ? (
                   <img src={item.images[0].image} alt={item.name} className="w-10 h-10 rounded-full object-cover border border-gray-200" />
               ) : (
                   <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                       <MapPin className="w-5 h-5" />
                   </div>
               )}
               <span className="font-medium text-gray-700 group-hover:text-blue-700 transition-colors">{item.name}</span>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-gray-500">
                <Car className="w-4 h-4" />
                <span className="font-bold text-gray-800">{toPersianDigits(formatDistance(item.distance))}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default HotelDistances;
