// src/components/checkout/ServicesStep.tsx
// version: 1.0.0
// Initial creation of the component to display and select add-on services.

import React from 'react';
import { HotelService, SelectedServicePayload } from '@/types/hotel';
import { Button } from '@/components/ui/Button';
import { PlusCircle, Edit } from 'lucide-react';

interface Props {
  services: HotelService[];
  selectedServices: SelectedServicePayload[];
  onSelectService: (service: HotelService) => void;
  onEditService: (service: SelectedServicePayload) => void;
}

const ServicesStep: React.FC<Props> = ({ services, selectedServices, onSelectService, onEditService }) => {
  const isSelected = (serviceId: number) => {
    return selectedServices.some(s => s.id === serviceId);
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-lg border border-gray-100">
      <h2 className="text-2xl font-bold mb-4 text-blue-700 border-b pb-2">خدمات اضافی</h2>
      <div className="space-y-4">
        {services.map(service => (
          <div key={service.id} className={`p-4 rounded-lg flex justify-between items-center transition-all ${isSelected(service.id) ? 'bg-green-50 border border-green-200' : 'bg-gray-50'}`}>
            <div>
              <h3 className="font-bold text-lg text-gray-800">{service.name}</h3>
              <p className="text-sm text-gray-600 mt-1">{service.description}</p>
              <p className="text-sm font-semibold text-red-600 mt-2">
                {service.price > 0 ? `${service.price.toLocaleString('fa-IR')} تومان` : 'رایگان'}
                {service.pricing_model === 'PERSON' && ' (به ازای هر نفر)'}
              </p>
            </div>
            {isSelected(service.id) ? (
              <Button onClick={() => onEditService(selectedServices.find(s => s.id === service.id)!)} variant="secondary" size="sm" className="flex items-center">
                <Edit className="ml-2 w-4 h-4" />
                ویرایش
              </Button>
            ) : (
              <Button onClick={() => onSelectService(service)} variant="primary" size="sm" className="flex items-center">
                <PlusCircle className="ml-2 w-4 h-4" />
                افزودن
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ServicesStep;
