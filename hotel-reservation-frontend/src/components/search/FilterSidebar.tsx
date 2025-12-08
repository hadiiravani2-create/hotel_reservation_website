// src/components/search/FilterSidebar.tsx
// version: 1.2.0
// FIX: Slider interaction fixed (handles are now draggable).
// UI: Compact spacing, improved typography, and better visual hierarchy.

import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAmenities } from '@/api/pricingService';
import { Button } from '../ui/Button';
import { AdjustmentsHorizontalIcon, StarIcon, FunnelIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { toPersianDigits, formatPrice } from '@/utils/format';

interface FilterState {
  minPrice: string;
  maxPrice: string;
  stars: number[];
  amenities: number[];
}

interface FilterSidebarProps {
  onFilterApply: (filters: FilterState) => void;
  initialFilters: FilterState;
}

const FilterSidebar: React.FC<FilterSidebarProps> = ({ onFilterApply, initialFilters }) => {
  // Price State
  const [minPrice, setMinPrice] = useState<number>(Number(initialFilters.minPrice) || 0);
  const [maxPrice, setMaxPrice] = useState<number>(Number(initialFilters.maxPrice) || 50000000); 
  
  const PRICE_CAP = 50000000; 
  const PRICE_STEP = 500000;

  const [selectedStars, setSelectedStars] = useState<number[]>(initialFilters.stars || []);
  const [selectedAmenities, setSelectedAmenities] = useState<number[]>(initialFilters.amenities || []);

  const { data: amenities } = useQuery<{ id: number; name: string }[]>({
    queryKey: ['amenities'],
    queryFn: getAmenities,
  });

  const handleStarChange = (star: number) => {
    setSelectedStars(prev => 
      prev.includes(star) ? prev.filter(s => s !== star) : [...prev, star]
    );
  };

  const handleAmenityChange = (id: number) => {
    setSelectedAmenities(prev => 
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    );
  };

  const handleApply = () => {
    onFilterApply({
      minPrice: minPrice > 0 ? minPrice.toString() : '',
      maxPrice: maxPrice < PRICE_CAP ? maxPrice.toString() : '',
      stars: selectedStars,
      amenities: selectedAmenities
    });
  };

  // Slider Logic with safe bounds
  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = Math.min(Number(e.target.value), maxPrice - PRICE_STEP);
      setMinPrice(val);
  };
  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = Math.max(Number(e.target.value), minPrice + PRICE_STEP);
      setMaxPrice(val);
  };

  // Calculate percentage for track background
  const minPercent = (minPrice / PRICE_CAP) * 100;
  const maxPercent = (maxPrice / PRICE_CAP) * 100;

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 sticky top-24" dir="rtl">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-5 border-b border-gray-100 pb-3">
        <div className="flex items-center gap-2 text-gray-800">
            <AdjustmentsHorizontalIcon className="w-5 h-5" />
            <h3 className="font-bold text-base">فیلترها</h3>
        </div>
        {/* Optional: Reset button could go here */}
      </div>

      {/* 1. Price Range Filter */}
      <div className="mb-6">
        <label className="block font-bold mb-4 text-xs text-gray-700">محدوده قیمت (یک شب)</label>
        
        <div className="relative w-full h-10 mb-2 flex items-center">
            {/* Background Track */}
            <div className="absolute w-full h-1.5 bg-gray-200 rounded-full"></div>
            
            {/* Active Track */}
            <div 
                className="absolute h-1.5 bg-primary-brand rounded-full z-10"
                style={{ right: `${minPercent}%`, left: `${100 - maxPercent}%` }}
            ></div>

            {/* Range Inputs - Overlay */}
            {/* Note: 'pointer-events-none' on input allows click-through, 'pointer-events-auto' on thumb allows dragging */}
            <input 
                type="range" 
                min={0} max={PRICE_CAP} step={PRICE_STEP}
                value={minPrice} 
                onChange={handleMinChange}
                className="absolute w-full h-1.5 opacity-0 cursor-pointer z-20 pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:appearance-none [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5"
            />
            <input 
                type="range" 
                min={0} max={PRICE_CAP} step={PRICE_STEP}
                value={maxPrice} 
                onChange={handleMaxChange}
                className="absolute w-full h-1.5 opacity-0 cursor-pointer z-20 pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:appearance-none [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5"
            />

            {/* Visual Thumbs (Optional, for custom styling, but standard thumbs are usually enough if styled via CSS. 
                Here we rely on the invisible inputs driving standard interaction, but we can style the 'thumb' via CSS in global styles if needed.
                For simplicity in Tailwind without external CSS, we use the raw inputs above. 
                To make sure handles are visible, we need a small trick: 
                The inputs above are opacity-0, so we need visual handles that track the values.
            */}
            
            {/* Custom Visual Thumbs to ensure they look good across browsers */}
            <div 
                className="absolute w-4 h-4 bg-white border-2 border-primary-brand rounded-full shadow-md z-10 pointer-events-none"
                style={{ right: `calc(${minPercent}% - 8px)` }}
            ></div>
            <div 
                className="absolute w-4 h-4 bg-white border-2 border-primary-brand rounded-full shadow-md z-10 pointer-events-none"
                style={{ right: `calc(${maxPercent}% - 8px)` }}
            ></div>
        </div>

        <div className="flex justify-between items-center text-xs text-gray-600 font-medium font-mono dir-ltr">
            <span>{formatPrice(minPrice)}</span>
            <span>{formatPrice(maxPrice)}+</span>
        </div>
      </div>

      <div className="w-full h-px bg-gray-100 my-5"></div>

      {/* 2. Star Rating Filter - Compact */}
      <div className="mb-6">
        <label className="block font-bold mb-3 text-xs text-gray-700">تعداد ستاره</label>
        <div className="flex flex-col gap-1.5">
          {[5, 4, 3, 2, 1].map((star) => (
            <label 
                key={star} 
                className={`group flex items-center justify-between px-2 py-1.5 rounded-lg cursor-pointer transition-all duration-200 ${selectedStars.includes(star) ? 'bg-amber-50 border border-amber-100' : 'hover:bg-gray-50 border border-transparent'}`}
            >
              <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }, (_, i) => (
                    <StarIconSolid 
                        key={i} 
                        className={`w-4 h-4 ${i < star ? 'text-amber-400' : 'text-gray-200'}`} 
                    />
                  ))}
              </div>
              <div className="relative flex items-center">
                  <input 
                    type="checkbox" 
                    checked={selectedStars.includes(star)}
                    onChange={() => handleStarChange(star)}
                    className="peer appearance-none w-4 h-4 border border-gray-300 rounded checked:bg-primary-brand checked:border-primary-brand transition-colors"
                  />
                  <FunnelIcon className="w-3 h-3 text-white absolute inset-0 m-auto opacity-0 peer-checked:opacity-100 pointer-events-none hidden" />
                  {/* Custom Checkmark */}
                  <svg className="w-3 h-3 text-white absolute inset-0 m-auto opacity-0 peer-checked:opacity-100 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
              </div>
            </label>
          ))}
        </div>
      </div>

      <div className="w-full h-px bg-gray-100 my-5"></div>

      {/* 3. Amenities Filter */}
      <div className="mb-6">
        <label className="block font-bold mb-3 text-xs text-gray-700">امکانات هتل</label>
        <div className="space-y-1.5 max-h-48 overflow-y-auto custom-scrollbar pl-1">
          {amenities?.map((amenity) => (
            <label key={amenity.id} className="flex items-center p-1.5 hover:bg-gray-50 rounded-md cursor-pointer transition-colors">
              <div className="relative flex items-center">
                  <input 
                    type="checkbox" 
                    checked={selectedAmenities.includes(amenity.id)}
                    onChange={() => handleAmenityChange(amenity.id)}
                    className="peer appearance-none w-4 h-4 border border-gray-300 rounded-md checked:bg-primary-brand checked:border-primary-brand transition-colors"
                  />
                  <svg className="w-3 h-3 text-white absolute inset-0 m-auto opacity-0 peer-checked:opacity-100 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
              </div>
              <span className={`mr-2 text-sm select-none ${selectedAmenities.includes(amenity.id) ? 'text-gray-800 font-medium' : 'text-gray-500'}`}>
                {amenity.name}
              </span>
            </label>
          ))}
        </div>
      </div>

      <Button onClick={handleApply} className="w-full py-2.5 text-sm shadow-md hover:shadow-lg transition-all rounded-xl">
        اعمال فیلترها
      </Button>
    </div>
  );
};

export default FilterSidebar;
