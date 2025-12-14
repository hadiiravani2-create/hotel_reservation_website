// src/components/attraction/AttractionCard.tsx
// version: 1.0.0

import React from 'react';
import Image from 'next/image';
import { Attraction } from '@/types/attraction';
import DynamicIcon from '@/components/ui/DynamicIcon';
import { formatPrice } from '@/utils/format';
import { Clock, Star } from 'lucide-react';

interface AttractionCardProps {
    attraction: Attraction;
}

const AttractionCard: React.FC<AttractionCardProps> = ({ attraction }) => {
    const coverImage = attraction.images.find(img => img.is_cover)?.image || attraction.images[0]?.image || '/placeholder-attraction.jpg';

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group flex flex-col h-full">
            {/* Image Section */}
            <div className="relative h-48 w-full overflow-hidden">
                <Image 
                    src={coverImage} 
                    alt={attraction.name} 
                    fill 
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                
                {/* Category Badge */}
                <div className="absolute top-2 right-2 flex gap-1">
                    {attraction.categories.slice(0, 2).map(cat => (
                        <span key={cat.id} className="bg-white/90 backdrop-blur text-xs px-2 py-1 rounded-md shadow-sm flex items-center gap-1">
                            <DynamicIcon name={cat.icon_name} size={14} className="text-orange-500" />
                            {cat.name}
                        </span>
                    ))}
                </div>
            </div>

            {/* Content Section */}
            <div className="p-4 flex flex-col flex-grow">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-gray-800 text-lg line-clamp-1">{attraction.name}</h3>
                    {attraction.rating > 0 && (
                        <div className="flex items-center gap-1 bg-yellow-50 px-1.5 py-0.5 rounded text-yellow-700 text-xs font-bold">
                            <span>{attraction.rating}</span>
                            <Star size={12} fill="currentColor" />
                        </div>
                    )}
                </div>

                <p className="text-sm text-gray-500 mb-3 line-clamp-2 flex-grow">
                    {attraction.short_description || attraction.description}
                </p>

                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 bg-gray-50 p-2 rounded-lg mb-3">
                    <div className="flex items-center gap-1.5">
                        <Clock size={14} className="text-blue-500" />
                        <span>{attraction.visit_info.hours || 'ساعات متغیر'}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-green-600">
                            {attraction.entry_fee === 0 ? 'رایگان' : `${formatPrice(attraction.entry_fee)} تومان`}
                        </span>
                    </div>
                </div>

                {/* Amenities / Audience Tags */}
                <div className="flex flex-wrap gap-1 mt-auto pt-2 border-t border-gray-100">
                    {attraction.audiences.slice(0, 2).map(aud => (
                        <span key={aud.id} className="text-[10px] text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                            {aud.name}
                        </span>
                    ))}
                    {attraction.amenities.length > 0 && (
                        <span className="text-[10px] text-gray-400 px-1.5 py-0.5">
                            + {attraction.amenities.length} امکانات
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AttractionCard;
