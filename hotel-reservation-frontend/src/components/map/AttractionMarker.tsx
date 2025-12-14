// src/components/map/AttractionMarker.tsx
// version: 1.0.0
// COMPONENT: Handles Attraction specific marker and popup logic.

import React from 'react';
import { Marker, Popup, Tooltip } from 'react-leaflet';
import { Attraction } from '@/types/attraction';
import { attractionIcon } from './MapIcons';

interface AttractionMarkerProps {
    attraction: Attraction;
}

const AttractionMarker: React.FC<AttractionMarkerProps> = ({ attraction }) => {
    if (!attraction.latitude || !attraction.longitude) return null;

    return (
        <Marker position={[attraction.latitude, attraction.longitude]} icon={attractionIcon}>
            <Popup className="custom-popup" closeButton={false}>
                <div className="text-right min-w-[180px] p-2 font-sans" dir="rtl">
                    <div className="flex justify-between items-start mb-2 border-b border-gray-100 pb-2">
                        <h3 className="font-bold text-sm text-gray-800 m-0">{attraction.name}</h3>
                        <span className="bg-orange-100 text-orange-600 text-[10px] px-2 py-0.5 rounded-full font-bold">دیدنی</span>
                    </div>
                    
                    {attraction.categories && attraction.categories.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                            {attraction.categories.map(cat => (
                                <span key={cat.id} className="text-[10px] bg-gray-100 text-gray-500 px-1.5 rounded">
                                    {cat.name}
                                </span>
                            ))}
                        </div>
                    )}

                    {attraction.visiting_hours && (
                        <div className="text-[10px] text-gray-500 flex items-center gap-1">
                            🕒 {attraction.visiting_hours}
                        </div>
                    )}
                </div>
            </Popup>
            <Tooltip direction="top" offset={[0, -20]} opacity={1} className="font-bold text-xs text-orange-700 bg-white shadow-sm px-2 py-1 rounded-full">
                {attraction.name}
            </Tooltip>
        </Marker>
    );
};

export default AttractionMarker;
