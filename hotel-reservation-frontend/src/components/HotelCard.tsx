// src/components/HotelCard.tsx
// version: 2.4.0
// REFACTOR: Final design with 3-column List view and Price-above-Button layout in Grid view.

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { StarIcon, MapPinIcon, CheckCircleIcon } from '@heroicons/react/24/solid';
import { HotelSummary } from '@/types/hotel';
import { Button } from './ui/Button';
import { formatPrice, toPersianDigits } from '@/utils/format';

interface HotelCardProps {
  hotel: HotelSummary;
  variant?: 'grid' | 'list';
}

const HotelCard: React.FC<HotelCardProps> = ({ hotel, variant = 'grid' }) => {
  const router = useRouter();
  
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  let imageUrl = hotel.main_image || '/placeholder.png';
  if (imageUrl.startsWith('/')) {
      imageUrl = `${backendUrl}${imageUrl}`;
  }

  const queryParams = new URLSearchParams();
  if (router.query.check_in) queryParams.set('check_in', router.query.check_in as string);
  if (router.query.duration) queryParams.set('duration', router.query.duration as string);
  
  const href = `/hotels/${hotel.slug}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

  const renderStars = () => (
    <div className="flex items-center gap-0.5 bg-black/50 backdrop-blur-md px-2 py-1 rounded-lg">
      {Array.from({ length: hotel.stars }, (_, i) => (
        <StarIcon key={i} className="w-3 h-3 text-yellow-400" />
      ))}
    </div>
  );

  // --- LIST VIEW (Search Results) ---
  if (variant === 'list') {
    return (
      <div className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col md:flex-row mb-6 border border-gray-100 h-full min-h-[200px]">
        
        {/* COL 1: Image (Right Side) */}
        <div className="md:w-3/10 relative flex-shrink-0 h-48 md:h-auto overflow-hidden">
          <Link href={href} className="block h-full w-full">
            <Image
              src={imageUrl}
              alt={hotel.name}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-110"
              sizes="(max-width: 768px) 100vw, 30vw"
            />
            <div className="absolute top-3 right-3 z-10">
                {renderStars()}
            </div>
          </Link>
        </div>

        {/* COL 2: Info (Middle) */}
        <div className="md:w-45/100 p-5 flex flex-col justify-start border-l border-gray-50">
            <Link href={href}>
                <h4 className="text-xl font-bold text-gray-800 group-hover:text-primary-brand transition-colors duration-300 mb-2">
                    {hotel.name}
                </h4>
            </Link>
            
            <div className="flex items-start gap-1 text-sm text-gray-500 mb-4">
                <MapPinIcon className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0"/>
                <span className="leading-6">
                    {hotel.city_name} {hotel.address && `، ${hotel.address}`}
                </span>
            </div>

            <div className="mt-auto space-y-1">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                    <CheckCircleIcon className="w-3 h-3 text-green-500" />
                    <span>تایید آنی رزرو</span>
                </div>
            </div>
        </div>

        {/* COL 3: Price & Action (Left Side) */}
        <div className="md:w-25/100 p-4 bg-gray-50/50 flex flex-col justify-between items-center text-center border-r border-gray-100">
            
            <div className="mt-2 w-full">
                {hotel.min_price ? (
                    <div className="flex flex-col items-center">
                        <span className="text-xs text-gray-400 mb-1">شروع قیمت از</span>
                        <div className="text-primary-brand font-black text-2xl flex items-center gap-1">
                            {formatPrice(hotel.min_price)}
                            <span className="text-xs font-medium text-gray-500">ریال</span>
                        </div>
                        <span className="text-[10px] text-gray-400 mt-1">برای ۱ شب</span>
                    </div>
                ) : (
                    <span className="text-gray-400 text-sm bg-white px-3 py-1 rounded-full border">قیمت نامشخص</span>
                )}
            </div>

            <div className="w-full mt-4">
                <Link href={href} className="w-full block">
                    <Button className="w-full rounded-xl shadow-md hover:shadow-lg transition-all py-2.5 text-sm">
                        مشاهده و رزرو
                    </Button>
                </Link>
            </div>
        </div>
      </div>
    );
  }

  // --- GRID VIEW (Homepage / Search Grid) ---
  return (
    <Link href={href} className="group block h-full">
      <div className="bg-white rounded-2xl shadow-md hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 overflow-hidden h-full flex flex-col border border-gray-100 relative">
        
        {/* Image Section */}
        <div className="relative w-full aspect-[4/3] overflow-hidden">
          <Image
            src={imageUrl}
            alt={hotel.name}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
          {/* Dark Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-90 group-hover:opacity-70 transition-opacity"/>
          
          <div className="absolute top-3 right-3">{renderStars()}</div>

          {/* Title & Location */}
          <div className="absolute bottom-4 right-4 left-4 text-white">
              <h3 className="text-lg font-bold mb-1 shadow-black/50 drop-shadow-md truncate">
                  {hotel.name}
              </h3>
              <p className="text-xs text-gray-200 flex items-center gap-1">
                 <MapPinIcon className="w-3 h-3"/>
                 {hotel.city_name}
              </p>
          </div>
        </div>
        
        {/* Footer Content */}
        <div className="p-4 flex flex-col gap-3 bg-white">
            {/* Price Row */}
            <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">شروع نرخ:</span>
                {hotel.min_price ? (
                    <div className="text-primary-brand font-bold text-lg">
                        {formatPrice(hotel.min_price)} <span className="text-[10px] text-gray-500 font-normal">ریال</span>
                    </div>
                ) : (
                    <span className="text-xs text-gray-400">نامشخص</span>
                )}
            </div>

            {/* Button Row */}
            <Button variant="primary" className="w-full rounded-xl py-2.5 text-sm shadow-md group-hover:shadow-lg transition-all">
                مشاهده و رزرو
            </Button>
        </div>
      </div>
    </Link>
  );
};

export default HotelCard;
