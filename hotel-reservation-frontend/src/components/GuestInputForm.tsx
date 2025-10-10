// src/components/GuestInputForm.tsx v2.1.7
// FIX: Finalized conditional rendering of National ID / Passport fields (hiding instead of disabling).
// Feature: Added containerClass prop for flexible styling by the parent.

import React, { memo } from 'react'; 
import { Input } from './ui/Input'; 
import { GuestPayload } from '../api/reservationService';

interface GuestInputFormProps {
    index: number;
    onChange: (index: number, data: Partial<GuestPayload>) => void;
    isPrincipal: boolean;
    value: Partial<GuestPayload>; 
    containerClass?: string; // New prop for overriding the default background
}

const GuestInputForm = ({ index, onChange, isPrincipal, value, containerClass }: GuestInputFormProps) => { // <-- Destructure containerClass
    
    const guestData = value; 

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // ... (omitted handleChange logic - remains the same as v2.1.6)
        const { name, value, type, checked } = e.target;
        
        let newValue: string | boolean = type === 'checkbox' ? checked : value;
        
        let updatedData: Partial<GuestPayload> = {};

        // Handle is_foreign logic which affects multiple fields
        if (name === 'is_foreign') {
            const isForeignValue = newValue as boolean;

            updatedData = {
                is_foreign: isForeignValue,
                // Clearing dependent fields in the parent state manager
                national_id: isForeignValue ? '' : guestData.national_id, 
                passport_number: isForeignValue ? guestData.passport_number : '',
                nationality: isForeignValue ? guestData.nationality : '',
            };
        } else {
            // For other fields, send a single field update
            const stringValue = newValue as string;
            updatedData = { [name]: stringValue } as Partial<GuestPayload>;
        }
        
        // Notify parent to update the central state array
        onChange(index, updatedData);
    };

    const isForeign = guestData.is_foreign || false;
    
    const isPhoneNumberRequired = isPrincipal;
    const isNationalIdRequired = isPrincipal && !isForeign;
    const isPassportRequired = isPrincipal && isForeign;
    const isNationalityRequired = isPrincipal && isForeign;

    const guestTitle = isPrincipal ? `اطلاعات میهمان ${index + 1} (سرپرست)` : `اطلاعات میهمان ${index + 1}`;
    
    // Determine background class: use prop if provided, else default to bg-gray-50
    const bgColor = containerClass || 'bg-gray-50'; 


    return (
        // Apply dynamic background class
        <div className={`p-4 border border-gray-200 rounded-lg ${bgColor} mb-4`} dir="rtl">
            <h4 className="text-lg font-bold mb-4 text-primary-brand">{guestTitle}</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Name fields - Always required (at least in UI for minimal validation) */}
                <Input label="نام" name="first_name" required onChange={handleChange} value={guestData.first_name || ''}/>
                <Input label="نام خانوادگی" name="last_name" required onChange={handleChange} value={guestData.last_name || ''}/>
                
                {/* Phone Number - Required only for the principal guest */}
                <Input 
                    label="شماره تماس" 
                    name="phone_number" 
                    required={isPhoneNumberRequired} 
                    onChange={handleChange} 
                    value={guestData.phone_number || ''}
                />
            </div>
            
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mt-4'>
                {/* City of Origin (always present in this row) */}
                 <Input 
                    label="شهر مبدأ" 
                    name="city_of_origin" 
                    required={false} 
                    onChange={handleChange} 
                    value={guestData.city_of_origin || ''}
                />

                {/* Foreign checkbox (always present in this row) */}
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
                {/* Placeholder for alignment (always present in this row) */}
                <div></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                
                {/* --- Conditional Fields for National/Passport/Nationality --- */}

                {!isForeign ? (
                    // Iranian Fields: Show National ID, hide Passport/Nationality
                    <Input 
                        label="کد ملی" 
                        name="national_id" 
                        required={isNationalIdRequired} 
                        onChange={handleChange} 
                        value={guestData.national_id || ''} 
                    />
                ) : (
                    <>
                        {/* Foreign Fields: Show Passport and Nationality */}
                        <Input 
                            label="شماره پاسپورت" 
                            name="passport_number" 
                            required={isPassportRequired} 
                            onChange={handleChange} 
                            value={guestData.passport_number || ''}
                        />
                        
                        <Input 
                            label="تابعیت" 
                            name="nationality" 
                            required={isNationalityRequired} 
                            onChange={handleChange} 
                            value={guestData.nationality || ''}
                        />
                    </>
                )}
            </div>
        </div>
    );
};

export default memo(GuestInputForm);
