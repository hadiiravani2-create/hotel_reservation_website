import React, { useState } from 'react';

interface HotelDescriptionProps {
  description: string;
}

const HotelDescription: React.FC<HotelDescriptionProps> = ({ description }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm mb-8 border border-gray-100">
      <h2 className="text-xl font-bold mb-4 text-gray-800">درباره هتل</h2>
      <div className={`text-gray-600 leading-relaxed text-justify relative ${!isExpanded ? 'max-h-24 overflow-hidden' : ''}`}>
        <p>{description}</p>
        
        {/* Fade effect when collapsed */}
        {!isExpanded && (
            <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white to-transparent"></div>
        )}
      </div>
      
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="text-primary-brand font-semibold mt-3 text-sm hover:underline flex items-center gap-1"
      >
        {isExpanded ? 'بستن توضیحات' : 'مشاهده کامل توضیحات'}
      </button>
    </div>
  );
};

export default HotelDescription;
