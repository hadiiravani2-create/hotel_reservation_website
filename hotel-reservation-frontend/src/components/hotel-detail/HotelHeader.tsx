import React from 'react';
import { Star } from 'lucide-react';
import { HotelDetails } from '@/types/hotel';

interface HotelHeaderProps {
  hotel: HotelDetails;
}

const HotelHeader: React.FC<HotelHeaderProps> = ({ hotel }) => {
  return (
    <header className="mb-8">
      <div className="flex items-center gap-4 flex-wrap">
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800">{hotel.name}</h1>
        {hotel.is_online && (
          <span className="bg-green-100 text-green-800 text-sm font-bold px-3 py-1 rounded-full whitespace-nowrap">
            رزرو آنی و آنلاین
          </span>
        )}
      </div>
      <div className="flex items-center gap-4 text-base md:text-lg text-gray-600 mt-2 flex-wrap">
        <div className="flex items-center">
          {Array.from({ length: hotel.stars }, (_, i) => (
            <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
          ))}
        </div>
        <span className="hidden md:inline">-</span>
        <p>{hotel.address}</p>
      </div>
    </header>
  );
};

export default HotelHeader;
