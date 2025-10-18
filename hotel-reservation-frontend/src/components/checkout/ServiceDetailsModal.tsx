// src/components/checkout/ServiceDetailsModal.tsx
// version: 1.0.0
// Initial creation of the modal for capturing extra service details.

import React, { useState } from 'react';
import { HotelService } from '@/types/hotel';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface Props {
  service: HotelService;
  isOpen: boolean;
  onClose: () => void;
  onSave: (details: Record<string, any>) => void;
}

const ServiceDetailsModal: React.FC<Props> = ({ service, isOpen, onClose, onSave }) => {
  const [flightNumber, setFlightNumber] = useState('');
  const [arrivalTime, setArrivalTime] = useState('');

  if (!isOpen) return null;

  const handleSave = () => {
    // In a real scenario, you'd generate the form fields dynamically based on service_type
    const details = {
      flight_number: flightNumber,
      arrival_time: arrivalTime,
    };
    onSave(details);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50" dir="rtl">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">جزئیات سرویس: {service.name}</h2>
        <div className="space-y-4">
          {/* This form should be generated dynamically in a real application */}
          <Input
            label="شماره پرواز"
            value={flightNumber}
            onChange={(e) => setFlightNumber(e.target.value)}
            placeholder="مثال: IR245"
          />
          <Input
            label="ساعت تخمینی ورود به فرودگاه"
            value={arrivalTime}
            onChange={(e) => setArrivalTime(e.target.value)}
            placeholder="مثال: 14:30"
          />
        </div>
        <div className="flex justify-end space-x-4 space-x-reverse mt-6">
          <Button onClick={onClose} variant="secondary">انصراف</Button>
          <Button onClick={handleSave} variant="primary">ذخیره</Button>
        </div>
      </div>
    </div>
  );
};

export default ServiceDetailsModal;
