import React from 'react';
import Image from 'next/image';
import { HotelImage } from '@/types/hotel';

interface HotelGalleryProps {
  images: HotelImage[];
  hotelName: string;
}

const HotelGallery: React.FC<HotelGalleryProps> = ({ images, hotelName }) => {
  if (!images || images.length === 0) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-6 h-64 md:h-96 rounded-2xl overflow-hidden shadow-lg border border-gray-100">
      {/* تصویر اصلی بزرگ */}
      <div className="col-span-2 row-span-2 relative group cursor-pointer">
        <Image 
            src={images[0]?.image || '/placeholder.png'} 
            layout="fill" 
            objectFit="cover" 
            alt={hotelName} 
            priority 
            className="transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
      </div>
      
      {/* تصاویر کوچک کناری */}
      {images.slice(1, 5).map((img, index) => (
        <div key={index} className="relative group cursor-pointer hidden md:block">
          <Image 
            src={img.image} 
            layout="fill" 
            objectFit="cover" 
            alt={`${hotelName} - تصویر ${index + 2}`} 
            className="transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
        </div>
      ))}
    </div>
  );
};

export default HotelGallery;
