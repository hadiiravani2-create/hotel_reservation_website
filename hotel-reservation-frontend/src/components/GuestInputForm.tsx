// src/components/GuestInputForm.tsx v2.0.2
import React, { useState } from 'react';
import { Input } from './ui/Input'; 
// Import GuestPayload type from reservationService for reuse
import { GuestPayload } from '../api/reservationService';

interface GuestInputFormProps {
    index: number;
    onChange: (index: number, data: Partial<GuestPayload>) => void;    
}

export const GuestInputForm: React.FC<GuestInputFormProps> = ({ index, onChange }) => {
    const [guestData, setGuestData] = useState<GuestPayload>({
        first_name: '', last_name: '', is_foreign: false,
        national_id: '', passport_number: '', phone_number: '', nationality: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        
        let newValue: string | boolean = type === 'checkbox' ? checked : value;
        
        // Handle is_foreign logic
        if (name === 'is_foreign') {
            const isForeignValue = newValue as boolean;

            setGuestData(prev => ({ 
                ...prev, 
                is_foreign: isForeignValue,
                // Clear dependent fields upon toggle
                national_id: isForeignValue ? '' : prev.national_id, 
                passport_number: isForeignValue ? prev.passport_number : '',
                nationality: isForeignValue ? prev.nationality : '',
            }));
            
            // Pass the updated structure to the parent
            onChange(index, { 
                ...guestData, 
                is_foreign: isForeignValue,
                national_id: isForeignValue ? '' : guestData.national_id, 
                passport_number: isForeignValue ? guestData.passport_number : '',
                nationality: isForeignValue ? guestData.nationality : '',
            });

        } else {
            // For all text inputs, ensure we treat the value as string
            const stringValue = newValue as string;
            setGuestData(prev => ({ ...prev, [name]: stringValue }));
            onChange(index, { ...guestData, [name]: stringValue });
        }
    };

    const isForeign = guestData.is_foreign;

    return (
        <div className="p-4 border border-gray-200 rounded-lg bg-gray-50 mb-4" dir="rtl">
            <h4 className="text-lg font-bold mb-4 text-primary-brand">اطلاعات میهمان {index + 1}</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="نام" name="first_name" required onChange={handleChange} value={guestData.first_name}/>
                <Input label="نام خانوادگی" name="last_name" required onChange={handleChange} value={guestData.last_name}/>
                <Input label="شماره تماس" name="phone_number" required onChange={handleChange} value={guestData.phone_number}/>
                
                {/* Foreign checkbox - This uses its own separate input and logic */}
                <div className="flex items-center mt-6">
                    <input 
                        type="checkbox" 
                        name="is_foreign" 
                        checked={isForeign} 
                        onChange={handleChange} 
                        className="w-4 h-4 text-primary-brand border-gray-300 rounded focus:ring-primary-brand ml-2"
                    />
                    <label className="text-sm font-medium">میهمان خارجی است</label>
                </div>

                {/* National ID field (Iranians only) */}
                <Input 
                    label="کد ملی" 
                    name="national_id" 
                    required={!isForeign} 
                    disabled={isForeign}
                    onChange={handleChange} 
                    // CRITICAL FIX: Ensure only string is passed here. guestData.national_id is always string.
                    value={guestData.national_id} 
                />
                
                {/* Passport Number field (Foreigners only) */}
                <Input 
                    label="شماره پاسپورت" 
                    name="passport_number" 
                    required={isForeign} 
                    disabled={!isForeign}
                    onChange={handleChange} 
                    // CRITICAL FIX: Ensure only string is passed here.
                    value={guestData.passport_number}
                />
                
                {/* Nationality field (Foreigners only) */}
                {isForeign && (
                    <Input 
                        label="تابعیت" 
                        name="nationality" 
                        required={isForeign} 
                        onChange={handleChange} 
                        // CRITICAL FIX: Ensure only string is passed here.
                        value={guestData.nationality}
                    />
                )}
            </div>
        </div>
    );
};
