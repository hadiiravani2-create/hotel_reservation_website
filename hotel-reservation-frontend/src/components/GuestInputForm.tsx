// FILE: src/components/GuestInputForm.tsx
// version: 2.3.0
// FIX: Restored 'phone_number' field visibility.
// FIX: Separated logic for 'national_id' vs 'passport_number' & 'nationality'.
// FEAT: Added 'gender' field to match API requirements.

import React, { memo } from 'react'; 
import { Input } from './ui/Input'; 
import { GuestPayload } from '../api/reservationService';

interface GuestInputFormProps {
    index: number;
    onChange: (index: number, data: Partial<GuestPayload>) => void;
    isPrincipal: boolean;
    value: Partial<GuestPayload>; 
    containerClass?: string;
    isUnauthenticated?: boolean; 
    errors?: any; // Changed to any to handle flexible error structures
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

    // Helper to safely extract error message
    const getFieldError = (fieldName: string) => {
        if (!errors) return undefined;
        // Handle Django DRF array errors (e.g., { phone_number: ["Invalid format"] })
        if (Array.isArray(errors[fieldName])) return errors[fieldName][0];
        return errors[fieldName];
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        // Handle checkbox vs text/select
        const checked = (e.target as HTMLInputElement).checked;
        
        let updatedData: Partial<GuestPayload> = {};

        // 1. Logic for switching between Iranian/Foreign guest
        if (name === 'is_foreign') {
            const isForeignValue = checked;

            updatedData = {
                is_foreign: isForeignValue,
                // If switching to Foreign: Clear National ID
                // If switching to Iranian: Clear Passport & Nationality
                national_id: isForeignValue ? null : '', 
                passport_number: isForeignValue ? '' : null,
                nationality: isForeignValue ? '' : null,
                // Preserve other fields
            };
        } 
        // 2. Logic for Registration Checkbox
        else if (name === 'wants_to_register') {
            updatedData = { [name]: checked };
        } 
        // 3. Standard Fields (Name, Phone, Passport, etc.)
        else {
            updatedData = { [name]: value };
        }
        
        // Notify parent
        onChange(index, updatedData);
    };

    const isForeign = guestData.is_foreign || false;
    
    // Validation Rules (Visual Indication)
    const isNameRequired = isPrincipal; 
    const isPhoneNumberRequired = isPrincipal; // Mobile is required for the booker
    const isNationalIdRequired = !isForeign; // Required if Iranian
    const isPassportRequired = isForeign; // Required if Foreign
    const isNationalityRequired = isForeign; // Required if Foreign

    const guestTitle = isPrincipal ? `اطلاعات میهمان ${index + 1} (سرپرست)` : `اطلاعات میهمان ${index + 1}`;
    const bgColor = containerClass || 'bg-gray-50'; 

    return (
        <div className={`p-4 border border-gray-200 rounded-lg ${bgColor} mb-4 transition-all duration-300`} dir="rtl">
            <div className="flex justify-between items-center mb-4">
                <h4 className="text-lg font-bold text-primary-brand flex items-center gap-2">
                    {guestTitle}
                    {isPrincipal && <span className="text-xs text-red-500 bg-red-50 px-2 py-1 rounded-full">الزامی</span>}
                </h4>

                {/* --- TOGGLE: Foreign National --- */}
                <div className="flex items-center bg-white px-3 py-1 rounded border border-gray-200">
                    <input 
                        type="checkbox" 
                        name="is_foreign" 
                        checked={isForeign} 
                        onChange={handleChange} 
                        className="w-4 h-4 text-primary-brand border-gray-300 rounded focus:ring-primary-brand ml-2 cursor-pointer"
                        id={`is_foreign_${index}`}
                    />
                    <label htmlFor={`is_foreign_${index}`} className="text-sm font-medium cursor-pointer text-gray-700 select-none">
                        اتباع خارجی هستم
                    </label>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* 1. Name */}
                <Input 
                    label="نام" 
                    name="first_name" 
                    required={true}
                    onChange={handleChange} 
                    value={guestData.first_name || ''}
                    error={getFieldError('first_name')}
                />
                
                {/* 2. Last Name */}
                <Input 
                    label="نام خانوادگی" 
                    name="last_name" 
                    required={true}
                    onChange={handleChange} 
                    value={guestData.last_name || ''}
                    error={getFieldError('last_name')}
                />

                {/* 3. Gender (Added based on API requirements) */}
                <div className="w-full">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        جنسیت <span className="text-red-500">*</span>
                    </label>
                    <select
                        name="gender"
                        value={guestData.gender || ''}
                        onChange={handleChange}
                        className={`w-full h-12 px-3 border rounded-md shadow-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${getFieldError('gender') ? 'border-red-500' : 'border-gray-300'}`}
                    >
                        <option value="" disabled>انتخاب کنید</option>
                        <option value="M">مرد</option>
                        <option value="F">زن</option>
                    </select>
                    {getFieldError('gender') && (
                        <p className="mt-1 text-xs text-red-600">{getFieldError('gender')}</p>
                    )}
                </div>
                
                {/* 4. Phone Number (CRITICAL: Must be present) */}
                <Input 
                    label="شماره موبایل" 
                    name="phone_number" 
                    required={isPhoneNumberRequired} 
                    onChange={handleChange} 
                    value={guestData.phone_number || ''}
                    error={getFieldError('phone_number')}
                    placeholder="0912..."
                    dir="ltr"
                    className="text-left"
                />
            </div>
            
            <div className='grid grid-cols-1 md:grid-cols-4 gap-4 mt-4'>
                {/* 5. Identification Documents (Switch based on Foreign Status) */}
                {!isForeign ? (
                    // --- IRANIAN MODE ---
                    <div className="md:col-span-2">
                        <Input 
                            label="کد ملی" 
                            name="national_id" 
                            required={isNationalIdRequired} 
                            onChange={handleChange} 
                            value={guestData.national_id || ''}
                            error={getFieldError('national_id')}
                            maxLength={10}
                            placeholder="۱۰ رقم بدون خط تیره"
                            dir="ltr"
                            className="text-left tracking-widest"
                        />
                    </div>
                ) : (
                    // --- FOREIGN MODE ---
                    <>
                        <div className="md:col-span-1">
                            <Input 
                                label="شماره پاسپورت" 
                                name="passport_number" 
                                required={isPassportRequired} 
                                onChange={handleChange} 
                                value={guestData.passport_number || ''}
                                error={getFieldError('passport_number')}
                                dir="ltr"
                                className="text-left"
                            />
                        </div>
                        <div className="md:col-span-1">
                             <Input 
                                label="کشور تابعیت" 
                                name="nationality" 
                                required={isNationalityRequired} 
                                onChange={handleChange} 
                                value={guestData.nationality || ''}
                                error={getFieldError('nationality')}
                                placeholder="مثلا: عراق"
                            />
                        </div>
                    </>
                )}

                 {/* 6. City (Optional) */}
                 <Input 
                    label="شهر محل سکونت" 
                    name="city_of_origin" 
                    required={false} 
                    onChange={handleChange} 
                    value={guestData.city_of_origin || ''}
                    error={getFieldError('city_of_origin')}
                />

                {/* 7. Registration Option (Only for Unauthenticated Principal) */}
                 {isPrincipal && isUnauthenticated ? (
                    <div className="flex items-center mt-8 md:col-start-4 justify-end">
                        <input
                            type="checkbox"
                            name="wants_to_register"
                            checked={guestData.wants_to_register || false}
                            onChange={handleChange}
                            className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500 ml-2"
                            id={`register_${index}`}
                        />
                        <label htmlFor={`register_${index}`} className="text-sm font-bold text-green-700 cursor-pointer">
                            عضویت در سایت
                        </label>
                    </div>
                ) : (
                    <div></div> 
                )}
            </div>
        </div>
    );
};

export default memo(GuestInputForm);
