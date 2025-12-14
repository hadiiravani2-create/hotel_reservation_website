// src/components/map/CityMap.tsx
// version: 3.0.0
// REFACTOR: Cleaned up by extracting markers and icon logic to separate components.

import React from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { HotelSummary } from '@/types/hotel';
import { Attraction } from '@/types/attraction';
import HotelMarker from './HotelMarker';
import AttractionMarker from './AttractionMarker';

interface CityMapProps {
    center: [number, number];
    zoom?: number;
    hotels: HotelSummary[];
    attractions: Attraction[];
}

const CityMap: React.FC<CityMapProps> = ({ center, zoom = 13, hotels, attractions }) => {
    const validCenter = (center && center[0] && center[1]) ? center : [35.6892, 51.3890] as [number, number];

    return (
        <div className="w-full h-[450px] rounded-2xl overflow-hidden shadow-2xl border border-gray-100 z-0 relative">
            <MapContainer 
                center={validCenter} 
                zoom={zoom} 
                scrollWheelZoom={false} 
                style={{ height: '100%', width: '100%', background: '#f8fafc' }}
            >
                {/* CartoDB Voyager Tile Layer */}
                <TileLayer
                    attribution='&copy; CARTO'
                    url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                />

                {/* Render Hotel Markers */}
                {hotels.map((hotel) => (
                    <HotelMarker key={`h-${hotel.id}`} hotel={hotel} />
                ))}

                {/* Render Attraction Markers */}
                {attractions.map((attraction) => (
                    <AttractionMarker key={`a-${attraction.id}`} attraction={attraction} />
                ))}
            </MapContainer>
        </div>
    );
};

export default CityMap;
