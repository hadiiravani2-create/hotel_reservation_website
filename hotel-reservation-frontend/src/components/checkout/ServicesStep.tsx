// src/components/checkout/ServicesStep.tsx
// version: 2.0.0
// REFACTOR: Redesigned for sidebar, with a 3-column layout, accordion view, and automatic guest count logic.

import React, { useState } from 'react';
import { HotelService, SelectedServicePayload } from '@/types/hotel';
import { Button } from '@/components/ui/Button';
import { PlusCircle, Edit, ChevronDown } from 'lucide-react';

// start modify
interface Props {
  services: HotelService[];
  selectedServices: SelectedServicePayload[];
  onSelectService: (servicePayload: SelectedServicePayload) => void;
  onRemoveService: (serviceId: number) => void;
  totalGuests: number;
}

const toPersianDigits = (str: string | number | undefined) => {
    if (str === undefined || str === null) return '';
    return String(str).replace(/\d/g, (d) => ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'][parseInt(d)]);
};

const ServicesStep: React.FC<Props> = ({ services, selectedServices, onSelectService, onRemoveService, totalGuests }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const isSelected = (serviceId: number) => {
    return selectedServices.some(s => s.id === serviceId);
  };

  const handleSelect = (service: HotelService) => {
    const quantity = service.pricing_model === 'PERSON' ? totalGuests : 1;
    // Note: We are simplifying for now and not opening the details modal from here.
    // This can be re-added if editing details from the sidebar is required.
    onSelectService({ id: service.id, quantity, details: {} });
  };
  
  const servicesToShow = isExpanded ? services : services.slice(0, 1);

  return (
    <div className="p-4 bg-white rounded-xl shadow-lg border border-gray-100 mb-6">
      <h3 className="text-lg font-bold mb-3">خدمات اضافی</h3>
      <div className="space-y-3">
        {servicesToShow.map(service => (
          <div key={service.id} className="flex justify-between items-center text-sm">
            <span className="font-semibold text-gray-700">{service.name}</span>
            <span className="text-gray-600">
              {service.price > 0 ? `${toPersianDigits(service.price.toLocaleString())} ت` : 'رایگان'}
              {service.pricing_model === 'PERSON' && <span className="text-xs"> (هر نفر)</span>}
            </span>
            {isSelected(service.id) ? (
              <Button onClick={() => onRemoveService(service.id)} variant="danger" size="sm" className="w-auto px-2 py-1 text-xs">
                حذف
              </Button>
            ) : (
              <Button onClick={() => handleSelect(service)} variant="outline" size="sm" className="w-auto px-2 py-1 text-xs">
                افزودن
              </Button>
            )}
          </div>
        ))}
        {services.length > 1 && (
            <button onClick={() => setIsExpanded(!isExpanded)} className="text-blue-600 text-sm font-semibold w-full flex items-center justify-center pt-2">
                {isExpanded ? 'نمایش کمتر' : `نمایش سایر خدمات (${toPersianDigits(services.length - 1)})`}
                <ChevronDown className={`w-4 h-4 mr-1 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
            </button>
        )}
      </div>
    </div>
  );
};

export default ServicesStep;
// end modify
