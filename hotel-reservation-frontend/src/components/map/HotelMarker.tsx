// src/components/map/HotelMarker.tsx
// version: 1.1.0
// FIX: Image logic updated to support both 'main_image' string and 'images' array.
// FIX: Button text forced to white.
// FEATURE: Replaced "Hotel" badge with dynamic hotel categories.

import React from 'react';
import { Marker, Popup, Tooltip } from 'react-leaflet';
import Link from 'next/link';
import { HotelDetails, HotelSummary } from '@/types/hotel'; // Import HotelDetails to access 'images' and 'hotel_categories' types
import { formatPrice } from '@/utils/format';
import { hotelIcon } from './MapIcons';

interface HotelMarkerProps {
    // The hotel prop can be either a summary (from suggested) or full details (from search)
    // We use a union type or 'any' safely to access common properties
    hotel: HotelSummary | HotelDetails | any; 
}

const HotelMarker: React.FC<HotelMarkerProps> = ({ hotel }) => {
    // Validate coordinates
    const lat = hotel.latitude;
    const lng = hotel.longitude;

    if (!lat || !lng) return null;

    // --- 1. Smart Image Selection Logic ---
    // First try 'main_image' (from Suggested API), then try first item of 'images' array (from Search API)
    let displayImage = '/placeholder.png'; // Default fallback
    
    if (hotel.main_image) {
        displayImage = hotel.main_image;
    } else if (hotel.images && hotel.images.length > 0) {
        // If 'images' is an array of objects {image: 'url', ...}
        displayImage = hotel.images[0].image;
    }

    return (
        <Marker position={[lat, lng]} icon={hotelIcon}>
            <Popup className="custom-popup p-0 overflow-hidden" closeButton={false} minWidth={220} maxWidth={220}>
                <div className="text-right font-sans" dir="rtl">
                    
                    {/* Image Header */}
                    <div className="relative h-32 w-full bg-gray-100">
                        <img 
                            src={displayImage} 
                            alt={hotel.name} 
                            className="w-full h-full object-cover rounded-t-lg"
                            onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.png'; }} // Fallback on load error
                        />
                        
                        {/* Dynamic Categories Badge */}
                        <div className="absolute top-2 right-2 flex flex-wrap gap-1 max-w-[90%]">
                            {hotel.hotel_categories && hotel.hotel_categories.length > 0 ? (
                                hotel.hotel_categories.slice(0, 2).map((cat: any) => (
                                    <span key={cat.id} className="bg-blue-600/90 backdrop-blur text-white text-[10px] px-2 py-0.5 rounded shadow-sm">
                                        {cat.name}
                                    </span>
                                ))
                            ) : (
                                // Fallback if no category is set
                                <span className="bg-blue-600/90 backdrop-blur text-white text-[10px] px-2 py-0.5 rounded shadow-sm">
                                    هتل
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-3">
                        <h3 className="font-bold text-sm text-gray-800 mb-1 leading-tight line-clamp-1">{hotel.name}</h3>
                        
                        <div className="flex justify-between items-center mb-3">
                            <div className="flex text-yellow-400 text-xs">
                                {'★'.repeat(hotel.stars)}
                                <span className="text-gray-300">{'★'.repeat(5 - hotel.stars)}</span>
                            </div>
                            
                            {/* Price Logic */}
                            {(hotel.min_price && hotel.min_price > 0) ? (
                                <span className="text-xs font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded">
                                    از {formatPrice(hotel.min_price)}
                                </span>
                            ) : (
                                <span className="text-[10px] text-gray-400">قیمت به‌روز</span>
                            )}
                        </div>

                        {/* Button with Forced White Text */}
                        <Link href={`/hotels/${hotel.slug}`} className="block w-full text-center bg-blue-600 !text-white text-xs py-2 rounded-md hover:bg-blue-700 transition shadow-md font-medium">
                            مشاهده و رزرو
                        </Link>
                    </div>
                </div>
            </Popup>
            
            <Tooltip direction="top" offset={[0, -20]} opacity={1} className="font-bold text-xs text-blue-700 bg-white shadow-sm px-2 py-1 rounded-md">
                {hotel.name}
            </Tooltip>
        </Marker>
    );
};

export default HotelMarker;
