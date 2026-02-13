// FILE: src/components/checkout/ServiceDetailsModal.tsx
import React, { useState } from 'react';
import { HotelService } from '@/types/hotel';
import { Button } from '../ui/Button';

interface ServiceDetailsModalProps {
  service: HotelService;
  isOpen: boolean;
  onClose: () => void;
  onSave: (details: Record<string, any>) => void;
}

const ServiceDetailsModal: React.FC<ServiceDetailsModalProps> = ({
  service,
  isOpen,
  onClose,
  onSave
}) => {
  const [note, setNote] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
            <h3 className="font-bold text-gray-800">جزئیات {service.name}</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">&times;</button>
        </div>
        
        <div className="p-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">توضیحات تکمیلی (اختیاری)</label>
            <textarea
                rows={4}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="مثلا: ساعت ورود برای ترانسفر، یا رژیم غذایی خاص..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
            />
        </div>

        <div className="p-4 border-t bg-gray-50 flex justify-end gap-3">
            <button 
                onClick={onClose}
                className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
            >
                انصراف
            </button>
            <Button 
                onClick={() => onSave({ note })} 
                variant="primary"
                className="px-6"
            >
                ثبت جزئیات
            </Button>
        </div>
      </div>
    </div>
  );
};

export default ServiceDetailsModal;
