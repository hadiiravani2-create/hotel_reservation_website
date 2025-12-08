import React, { useState } from 'react';
import { HotelService, SelectedServicePayload } from '@/types/hotel';
import { Button } from '../ui/Button';
import { ChevronDown } from 'lucide-react';
import { formatPrice, toPersianDigits } from '@/utils/format';

interface CheckoutServicesProps {
  services: HotelService[];
  selectedServices: SelectedServicePayload[];
  onSelectService: (servicePayload: SelectedServicePayload) => void;
  onRemoveService: (serviceId: number) => void;
  totalGuests: number;
}

const CheckoutServices: React.FC<CheckoutServicesProps> = ({ 
  services, 
  selectedServices, 
  onSelectService, 
  onRemoveService, 
  totalGuests 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const isSelected = (serviceId: number) => {
    return selectedServices.some(s => s.id === serviceId);
  };

  const handleSelect = (service: HotelService) => {
    const quantity = service.pricing_model === 'PERSON' ? totalGuests : 1;
    onSelectService({ id: service.id, quantity, details: {} });
  };
  
  const servicesToShow = isExpanded ? services : services.slice(0, 2);

  if (!services || services.length === 0) return null;

  return (
    <div className="p-5 bg-white rounded-xl shadow-lg border border-gray-100 mb-6">
      <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <span className="w-1 h-6 bg-primary-brand rounded-full"></span>
          خدمات اضافی (اختیاری)
      </h3>
      <div className="space-y-3">
        {servicesToShow.map(service => (
          <div key={service.id} className="flex justify-between items-center text-sm p-2 hover:bg-gray-50 rounded-lg transition-colors border border-transparent hover:border-gray-100">
            <div className="flex flex-col">
                <span className="font-semibold text-gray-800">{service.name}</span>
                <span className="text-gray-500 text-xs mt-0.5">
                    {service.price > 0 ? `${formatPrice(service.price)} ریال` : 'رایگان'}
                    {service.pricing_model === 'PERSON' && ' (هر نفر)'}
                </span>
            </div>
            
            {isSelected(service.id) ? (
              <Button onClick={() => onRemoveService(service.id)} variant="danger" size="sm" className="h-8 text-xs px-3">
                حذف
              </Button>
            ) : (
              <Button onClick={() => handleSelect(service)} variant="outline" size="sm" className="h-8 text-xs px-3 border-blue-200 text-blue-600 hover:bg-blue-50">
                افزودن
              </Button>
            )}
          </div>
        ))}
        {services.length > 2 && (
            <button onClick={() => setIsExpanded(!isExpanded)} className="text-primary-brand text-sm font-medium w-full flex items-center justify-center pt-3 mt-2 border-t border-dashed border-gray-200 hover:text-blue-700 transition-colors">
                {isExpanded ? 'بستن لیست' : `مشاهده ${toPersianDigits(services.length - 2)} خدمت دیگر`}
                <ChevronDown className={`w-4 h-4 mr-1 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
            </button>
        )}
      </div>
    </div>
  );
};

export default CheckoutServices;
