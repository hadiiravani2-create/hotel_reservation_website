// FILE: src/components/checkout/CheckoutServices.tsx
import React from 'react';
import { HotelService, SelectedServicePayload } from '@/types/hotel';
import { formatPrice, toPersianDigits } from '@/utils/format';
import { Coffee, Plus, Check, Info } from 'lucide-react';

interface CheckoutServicesProps {
  services: HotelService[];
  selectedServices: SelectedServicePayload[];
  onSelectService: (service: SelectedServicePayload) => void;
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

  const isSelected = (id: number) => selectedServices.some(s => s.id === id);

  const handleToggle = (service: HotelService) => {
    if (isSelected(service.id)) {
      onRemoveService(service.id);
    } else {
      // منطق پیش‌فرض: اگر سرویس "نفری" است، تعداد مسافران را ست کن
      const quantity = service.pricing_model === 'PERSON' ? totalGuests : 1;
      onSelectService({
        id: service.id,
        quantity: quantity,
        details: {} // جزئیات خالی که بعدا با مودال پر می‌شود
      });
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 mt-6">
       <div className="bg-gray-50 p-4 border-b border-gray-100">
        <h2 className="font-bold text-gray-800 flex items-center gap-2">
          <Coffee className="w-5 h-5 text-orange-500" />
          خدمات قابل افزودن
        </h2>
      </div>

      <div className="p-2">
        {services.map(service => {
            const active = isSelected(service.id);
            return (
                <div 
                    key={service.id} 
                    className={`
                        flex items-center justify-between p-3 m-2 rounded-lg border transition-all cursor-pointer
                        ${active ? 'bg-orange-50 border-orange-200 ring-1 ring-orange-200' : 'bg-white border-gray-200 hover:border-gray-300'}
                    `}
                    onClick={() => handleToggle(service)}
                >
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${active ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-500'}`}>
                            {active ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-800 text-sm">{service.name}</h4>
                            <p className="text-xs text-gray-500 mt-0.5">
                                {formatPrice(service.price)} ریال / {service.pricing_model === 'PERSON' ? 'هر نفر' : 'هر سرویس'}
                            </p>
                        </div>
                    </div>
                    
                    {/* بجای دکمه تکی، کل کارت قابل کلیک است */}
                </div>
            );
        })}
        
        {services.length === 0 && (
            <div className="p-4 text-center text-gray-500 text-sm flex flex-col items-center gap-2">
                <Info className="w-6 h-6 text-gray-300" />
                سرویس اضافه‌ای برای این هتل تعریف نشده است.
            </div>
        )}
      </div>
    </div>
  );
};

export default CheckoutServices;
