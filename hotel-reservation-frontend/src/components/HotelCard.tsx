// src/components/HotelCard.tsx
// version: 2.5.0
// FIX: Added fallback logic to use 'images[0]' if 'main_image' is missing.
// REFACTOR: Enhanced Grid vs List layout styles for better responsiveness.

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { StarIcon, MapPinIcon } from '@heroicons/react/24/solid';
import { HotelSummary, HotelDetails } from '@/types/hotel'; // Import HotelDetails for 'images' type
import { Button } from './ui/Button';
import { formatPrice, toPersianDigits } from '@/utils/format';

interface HotelCardProps {
  // Accepts both summary and details types to handle different API responses
  hotel: HotelSummary | HotelDetails | any;
  variant?: 'grid' | 'list';
}

const HotelCard: React.FC<HotelCardProps> = ({ hotel, variant = 'grid' }) => {
  const router = useRouter();
  
  // --- 1. Image Resolution Logic ---
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  
  let rawImage = hotel.main_image;
  
  // Fallback: If main_image is missing, try the first image from the gallery
  if (!rawImage && hotel.images && hotel.images.length > 0) {
      rawImage = hotel.images[0].image;
  }
  
  // Final Image URL construction
  let imageUrl = rawImage || '/placeholder.png';
  if (imageUrl.startsWith('/')) {
      imageUrl = `${backendUrl}${imageUrl}`;
  }

  // Query Params persistence
  const queryParams = new URLSearchParams();
  if (router.query.check_in) queryParams.set('check_in', router.query.check_in as string);
  if (router.query.duration) queryParams.set('duration', router.query.duration as string);
  
  const href = `/hotels/${hotel.slug}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

  const renderStars = () => (
    <div className="flex text-yellow-400 text-xs">
      {'★'.repeat(hotel.stars)}
      <span className="text-gray-300">{'★'.repeat(5 - hotel.stars)}</span>
    </div>
  );

  // --- 2. Grid Layout (Vertical - for City Page) ---
  if (variant === 'grid') {
    return (
      <div className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col h-full">
        {/* Image Top */}
        <div className="relative h-48 w-full overflow-hidden bg-gray-100">
            <Image
                src={imageUrl}
                alt={hotel.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.png'; }}
            />
            <div className="absolute top-2 right-2 bg-white/90 backdrop-blur px-2 py-1 rounded-md shadow-sm">
                {renderStars()}
            </div>
        </div>

        {/* Content Bottom */}
        <div className="p-4 flex flex-col flex-grow">
            <div className="mb-2">
                <h3 className="font-bold text-gray-800 text-lg line-clamp-1 group-hover:text-blue-600 transition-colors">
                    {hotel.name}
                </h3>
                <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                    <MapPinIcon className="w-3 h-3 text-gray-400" />
                    {hotel.city?.name || hotel.city_name || 'شهر نامشخص'}
                </div>
            </div>

            <div className="mt-auto pt-3 border-t border-gray-100 flex items-center justify-between">
                <div>
                    <span className="text-xs text-gray-400 block">شروع نرخ</span>
                    {hotel.min_price ? (
                        <div className="text-primary-brand font-bold text-base">
                            {formatPrice(hotel.min_price)} <span className="text-[10px] text-gray-500 font-normal">ریال</span>
                        </div>
                    ) : (
                        <span className="text-xs text-gray-400 font-medium">استعلام قیمت</span>
                    )}
                </div>
                
                <Link href={href}>
                    <Button variant="outline" className="text-xs py-2 px-3 !rounded-lg hover:bg-blue-50">
                        مشاهده
                    </Button>
                </Link>
            </div>
        </div>
      </div>
    );
  }

  // --- 3. List Layout (Horizontal - for Search Page) ---
  return (
    <div className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col sm:flex-row">
      {/* Image Left */}
      <div className="relative h-48 sm:h-auto sm:w-1/3 min-w-[240px] bg-gray-100">
          <Image
              src={imageUrl}
              alt={hotel.name}
              fill
              className="object-cover"
              onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.png'; }}
          />
          <div className="absolute top-3 right-3 bg-white/95 px-2 py-1 rounded-full shadow-sm">
              {renderStars()}
          </div>
      </div>

      {/* Content Right */}
      <div className="p-5 flex flex-col flex-grow justify-between">
          <div>
              <h3 className="font-bold text-xl text-gray-800 mb-2 group-hover:text-blue-600 transition-colors">
                  {hotel.name}
              </h3>
              <div className="flex items-center gap-1 text-sm text-gray-500 mb-4">
                  <MapPinIcon className="w-4 h-4 text-gray-400" />
                  {hotel.address || hotel.city?.name || hotel.city_name}
              </div>
              
              {/* Optional: Add amenities preview here if available in hotel object */}
          </div>

          <div className="flex items-end justify-between border-t border-gray-100 pt-4 mt-2">
              <div className="flex flex-col">
                  {hotel.min_price ? (
                      <>
                          <span className="text-xs text-gray-500 mb-1">قیمت برای ۱ شب:</span>
                          <div className="text-2xl font-bold text-primary-brand">
                              {formatPrice(hotel.min_price)}
                              <span className="text-xs font-normal text-gray-500 mr-1">ریال</span>
                          </div>
                      </>
                  ) : (
                      <span className="text-sm text-gray-400 font-medium bg-gray-50 px-2 py-1 rounded">
                          نیازمند استعلام
                      </span>
                  )}
              </div>

              <Link href={href} className="w-full sm:w-auto">
                  <Button variant="primary" className="w-full sm:w-auto px-8 py-3 shadow-lg shadow-blue-500/20">
                      رزرو آنلاین
                  </Button>
              </Link>
          </div>
      </div>
    </div>
  );
};

export default HotelCard;
