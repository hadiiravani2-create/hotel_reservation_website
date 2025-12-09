// src/components/GuestInputForm.tsx
// version: 2.2.0
// FIX: Moved 'is_foreign' checkbox to the top.
// Feature: Added 'errors' prop and connected to Input components.

import React, { memo } from 'react'; 
import { Input } from './ui/Input'; 
import { GuestPayload } from '../api/reservationService';

interface GuestInputFormProps {
    index: number;
    onChange: (index: number, data: Partial<GuestPayload>) => void;
    isPrincipal: boolean;
    value: Partial<GuestPayload>; 
    containerClass?: string;
    // Prop to indicate if the user is unauthenticated (Guest Booking flow)
    isUnauthenticated?: boolean; 
    // NEW: Receive validation errors for this specific guest form
    errors?: Record<string, string>; 
}

const GuestInputForm = ({ 
    index, 
    onChange, 
    isPrincipal, 
    value, 
    containerClass, 
    isUnauthenticated, 
    errors = {} 
}: GuestInputFormProps) => { 
    
    const guestData = value; 

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
                // Preserve wants_to_register state
                wants_to_register: guestData.wants_to_register
            };
        } else if (name === 'wants_to_register') {
             // Handle the new wants_to_register checkbox
            updatedData = { [name]: checked } as Partial<GuestPayload>;
        } 
        else {
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
    // Name/Last Name are required only for the principal guest
    const isNameRequired = isPrincipal; 

    const guestTitle = isPrincipal ? `اطلاعات میهمان ${index + 1} (سرپرست)` : `اطلاعات میهمان ${index + 1}`;
    
    // Determine background class: use prop if provided, else default to bg-gray-50
    const bgColor = containerClass || 'bg-gray-50'; 


    return (
        // Apply dynamic background class
        <div className={`p-4 border border-gray-200 rounded-lg ${bgColor} mb-4`} dir="rtl">
            <h4 className="text-lg font-bold mb-4 text-primary-brand">{guestTitle}</h4>
            
            {/* NEW LOCATION: Foreign checkbox moved to top */}
            <div className="flex items-center mb-6">
                <input 
                    type="checkbox" 
                    name="is_foreign" 
                    checked={isForeign} 
                    onChange={handleChange} 
                    className="w-4 h-4 text-primary-brand border-gray-300 rounded focus:ring-primary-brand ml-2"
                    id={`is_foreign_${index}`}
                />
                <label htmlFor={`is_foreign_${index}`} className="text-sm font-medium cursor-pointer">
                    این میهمان خارجی است
                </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Name fields - REQUIRED ONLY IF isPrincipal is TRUE */}
                <Input 
                    label="نام" 
                    name="first_name" 
                    required={isNameRequired}
                    onChange={handleChange} 
                    value={guestData.first_name || ''}
                    error={errors.first_name}
                />
                <Input 
                    label="نام خانوادگی" 
                    name="last_name" 
                    required={isNameRequired}
                    onChange={handleChange} 
                    value={guestData.last_name || ''}
                    error={errors.last_name}
                />
                
                {/* Phone Number - Required only for the principal guest */}
                <Input 
                    label="شماره تماس" 
                    name="phone_number" 
                    required={isPhoneNumberRequired} 
                    onChange={handleChange} 
                    value={guestData.phone_number || ''}
                    error={errors.phone_number}
                />
            </div>
            
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mt-4'>
                {/* City of Origin */}
                 <Input 
                    label="شهر مبدأ" 
                    name="city_of_origin" 
                    required={false} 
                    onChange={handleChange} 
                    value={guestData.city_of_origin || ''}
                    error={errors.city_of_origin}
                />

                {/* --- Conditional Fields for National/Passport/Nationality --- */}

                {!isForeign ? (
                    // Iranian Fields: Show National ID
                    <Input 
                        label="کد ملی" 
                        name="national_id" 
                        required={isNationalIdRequired} 
                        onChange={handleChange} 
                        value={guestData.national_id || ''}
                        error={errors.national_id}
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
                            error={errors.passport_number}
                        />
                        
                        <Input 
                            label="تابعیت" 
                            name="nationality" 
                            required={isNationalityRequired} 
                            onChange={handleChange} 
                            value={guestData.nationality || ''}
                            error={errors.nationality}
                        />
                    </>
                )}

                 {/* Placeholder for alignment or Registration Option */}
                 {isPrincipal && isUnauthenticated ? (
                    // Show register option for unauthenticated principal guest
                    <div className="flex items-center mt-6 md:col-start-3">
                        <input
                            type="checkbox"
                            name="wants_to_register"
                            checked={guestData.wants_to_register || false}
                            onChange={handleChange}
                            className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500 ml-2"
                            id={`register_${index}`}
                        />
                        <label htmlFor={`register_${index}`} className="text-sm font-medium text-green-700 cursor-pointer">
                            ثبت نام در سایت با این اطلاعات
                        </label>
                    </div>
                ) : (
                    <div></div> // Ensures alignment if option is hidden
                )}
            </div>
        </div>
    );
};

export default memo(GuestInputForm);
