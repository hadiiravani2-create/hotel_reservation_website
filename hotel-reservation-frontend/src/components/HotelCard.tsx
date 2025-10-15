// src/components/HotelCard.tsx
// version: 1.0.0
// NEW: A reusable component to display a hotel's summary card.

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { StarIcon } from '@heroicons/react/24/solid';
import { SuggestedHotel } from '@/types/hotel';

interface HotelCardProps {
  hotel: SuggestedHotel;
}

const HotelCard: React.FC<HotelCardProps> = ({ hotel }) => {
  // Function to render star icons based on the hotel's star rating
  const renderStars = () => {
    return (
      <div className="flex items-center">
        {Array.from({ length: hotel.stars }, (_, i) => (
          <StarIcon key={i} className="w-5 h-5 text-yellow-400" />
        ))}
      </div>
    );
  };

  return (
    <Link href={`/hotels/${hotel.slug}`} passHref>
      <div className="group block bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden">
        <div className="relative w-full h-48">
          <Image
            src={hotel.main_image || '/placeholder.png'} // Use a placeholder if no image
            alt={hotel.name}
            layout="fill"
            objectFit="cover"
            className="transition-transform duration-300 group-hover:scale-105"
          />
        </div>
        <div className="p-4">
          <h3 className="text-lg font-bold text-gray-800 truncate group-hover:text-primary-brand">{hotel.name}</h3>
          <p className="text-sm text-gray-500 mt-1">{hotel.city_name}</p>
          <div className="mt-2">
            {renderStars()}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default HotelCard;
