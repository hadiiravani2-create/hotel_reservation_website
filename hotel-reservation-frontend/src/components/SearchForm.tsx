// src/components/SearchForm.tsx
// version: 1.1.4
// IMPROVEMENTS: Added useMemo for duration, min/max dates (performance). Display computed nights in check_out label.
// FIX: Separated setErrors from setSearchData to avoid race conditions. Enhanced isFormValid with duration check.
// UX: Added Persian digits for nights display. Accessibility: htmlFor/id for labels.
// VALIDATION: Ensure duration >=1 in isFormValid.
// FIX (1.1.3): Replaced 'value' prop with 'initialValue' to fix TS build error.
// FIX (1.1.3): Added 'key' prop to JalaliDatePicker components to force re-render and fix 'jumping field' bug.
// FIX (1.1.4): Removed 'id' prop from JalaliDatePicker to fix TS build error (component does not accept it).

import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/router";
import { DateObject } from "react-multi-date-picker";
import { getCities } from "../api/pricingService";
import { Button } from "./ui/Button";
import { JalaliDatePicker } from "./ui/JalaliDatePicker";
import { DATE_CONFIG } from "@/config/date";

// Helper function to get today's date string in YYYY-MM-DD format
const getToday = () => new DateObject({ calendar: DATE_CONFIG.calendar, locale: DATE_CONFIG.locale }).format("YYYY-MM-DD");

// Helper function to get tomorrow's date string in YYYY-MM-DD format
const getTomorrow = () => new DateObject({ calendar: DATE_CONFIG.calendar, locale: DATE_CONFIG.locale }).add(1, "day").format("YYYY-MM-DD");

// Helper to convert to Persian digits
const toPersianDigits = (str: string | number) => {
    return String(str).replace(/\d/g, (d) => ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'][parseInt(d)]);
};

interface City {
    id: number;
    name: string;
}

const SearchForm: React.FC = () => {
    const router = useRouter();
    
    // Use state for form data, replacing 'duration' with 'check_out'
    const [searchData, setSearchData] = useState({
        city_id: "",
        check_in: getToday(),
        check_out: getTomorrow(),
    });

    // Updated errors state to include check_out
    const [errors, setErrors] = useState<{ city_id?: string; check_in?: string; check_out?: string }>({});

    // Fetch cities data using react-query
    const {
        data: cities,
        isLoading: isCitiesLoading,
        error: citiesError,
    } = useQuery<City[]>({
        queryKey: ["cities"],
        queryFn: getCities,
    });

    // Computed duration (nights) with useMemo for performance
    const duration = useMemo(() => {
        if (!searchData.check_in || !searchData.check_out) return 1;
        const checkInDate = new DateObject({ date: searchData.check_in, ...DATE_CONFIG });
        const checkOutDate = new DateObject({ date: searchData.check_out, ...DATE_CONFIG });
        
        // Use Unix timestamps for calculation (as .diff() might have TS issues)
        const checkInUnix = checkInDate.toUnix();
        const checkOutUnix = checkOutDate.toUnix();
        const diffInSeconds = checkOutUnix - checkInUnix;
        const nights = Math.round(diffInSeconds / 86400); // 86400 = seconds in a day
        
        return Math.max(1, nights); // Ensure duration is at least 1 night
    }, [searchData.check_in, searchData.check_out]);

    // Handle change for standard inputs (like city select)
    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSearchData({ ...searchData, [e.target.name]: e.target.value });
        if (e.target.name === 'city_id' && e.target.value) {
            setErrors(prev => ({ ...prev, city_id: undefined }));
        }
    };
    
    // Advanced handler for date changes with chaining logic
    const handleDateChange = (name: string, dateString: string) => {
        if (!dateString) return; // Prevent updates if date is cleared

        setSearchData((prev) => {
            const newData = { ...prev, [name]: dateString };
            
            // Date Chaining Logic:
            // If check_in changes, check if it's after check_out
            if (name === "check_in") {
                const checkInDate = new DateObject({ date: dateString, ...DATE_CONFIG });
                const checkOutDate = new DateObject({ date: newData.check_out, ...DATE_CONFIG });
                
                // If new check_in is on or after check_out, push check_out to be 1 day after new check_in
                if (checkInDate.toUnix() >= checkOutDate.toUnix()) {
                    newData.check_out = checkInDate.add(1, "day").format("YYYY-MM-DD");
                }
            }
            return newData;
        });

        // Clear errors separately to avoid race conditions
        if (name === "check_in") {
            setErrors(e => ({ ...e, check_in: undefined, check_out: undefined }));
        } else if (name === "check_out") {
            setErrors(e => ({ ...e, check_out: undefined }));
        }
    };
    
    // Validate the form before submission
    const validateForm = () => {
        const newErrors: { city_id?: string; check_in?: string; check_out?: string } = {};
        if (!searchData.city_id) newErrors.city_id = "انتخاب شهر الزامی است.";
        if (!searchData.check_in) newErrors.check_in = "انتخاب تاریخ ورود الزامی است.";
        if (!searchData.check_out) newErrors.check_out = "انتخاب تاریخ خروج الزامی است.";

        // Final check to ensure check_out is after check_in
        if (searchData.check_in && searchData.check_out && duration < 1) {
            newErrors.check_out = "تاریخ خروج باید حداقل یک روز پس از تاریخ ورود باشد.";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    
    // Handle form submission
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validateForm()) {
            // Prepare query parameters for the backend (city_id, check_in, duration)
            const queryParams = {
                city_id: searchData.city_id,
                check_in: searchData.check_in,
                duration: String(duration), // Use memoized duration
            };
            
            // Navigate to search page with the correct query parameters
            router.push({ pathname: "/search", query: queryParams });
        }
    };
    
    // Determine if the form is valid to enable/disable the submit button (now includes duration check)
    const isFormValid = searchData.city_id && searchData.check_in && searchData.check_out && duration >= 1;
    
    // --- Dynamic Date Objects for Min/Max Props with useMemo ---
    
    // minDate for check_out picker: 1 day after check_in
    const checkOutMinDate = useMemo(() => 
        searchData.check_in
            ? new DateObject({ date: searchData.check_in, ...DATE_CONFIG }).add(1, "day")
            : new DateObject({ ...DATE_CONFIG }).add(1, "day")
    , [searchData.check_in]);
    
    // maxDate for check_in picker: 1 day before check_out
    const checkInMaxDate = useMemo(() => 
        searchData.check_out
            ? new DateObject({ date: searchData.check_out, ...DATE_CONFIG }).subtract(1, "day")
            : undefined
    , [searchData.check_out]);

    return (
        <div className="max-w-6xl mx-auto" dir="rtl">
            <div className="bg-white px-6 py-9 shadow-2xl rounded-2xl border border-gray-100">
                {/* Updated grid layout: 4 (City) + 3 (Check-in) + 3 (Check-out) + 2 (Button) = 12 */}
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                    
                    {/* City Selection */}
                    <div className="md:col-span-4">
                        <label htmlFor="city_id" className="block text-sm font-medium text-slate-600 mb-1">نام شهر یا هتل</label>
                        <select
                            id="city_id"
                            name="city_id"
                            value={searchData.city_id}
                            onChange={handleChange}
                            required
                            className={`w-full h-12 p-4 border rounded-md shadow-sm focus:outline-none focus:ring-primary-brand focus:border-primary-brand hover:border-blue-500 transition-all ${errors.city_id ? 'border-red-500' : 'border-gray-300'}`}
                        >
                            <option value="" disabled>شهر را انتخاب کنید</option>
                            {isCitiesLoading && <option disabled>در حال بارگذاری...</option>}
                            {cities?.map((city) => (
                                <option key={city.id} value={city.id}>{city.name}</option>
                            ))}
                        </select>
                        {citiesError && <p className="text-red-500 text-xs mt-1">خطا در بارگذاری شهرها</p>}
                        {errors.city_id && <p className="text-red-500 text-xs mt-1">{errors.city_id}</p>}
                    </div>
                    
                    {/* Check-in Date */}
                    <div className="md:col-span-3">
                        <JalaliDatePicker
                            // FIX (1.1.4): 'id' prop removed to fix build error.
                            label="از تاریخ"
                            name="check_in"
                            onDateChange={handleDateChange}
                            required
                            // FIX (1.1.3): Use 'initialValue' instead of 'value'
                            initialValue={searchData.check_in}
                            // FIX (1.1.3): Add 'key' to force re-render on state change (solves 'jump' bug)
                            key={`check-in-${searchData.check_in}`}
                            // Set minDate to today
                            minDate={new DateObject({ ...DATE_CONFIG })}
                            // Set maxDate to one day before check-out
                            maxDate={checkInMaxDate}
                        />
                        {errors.check_in && <p className="text-red-500 text-xs mt-1">{errors.check_in}</p>}
                    </div>
                    
                    {/* Check-out Date (Replaces Duration) */}
                    <div className="md:col-span-3">
                        <JalaliDatePicker
                            // FIX (1.1.4): 'id' prop removed to fix build error.
                            label={`تا تاریخ (${toPersianDigits(duration)} شب)`}
                            name="check_out"
                            onDateChange={handleDateChange}
                            required
                            // FIX (1.1.3): Use 'initialValue' instead of 'value'
                            initialValue={searchData.check_out}
                            // FIX (1.1.3): Add 'key' to force re-render on state change (solves 'jump' bug)
                            key={`check-out-${searchData.check_out}`}
                            // Set minDate to one day after check-in
                            minDate={checkOutMinDate}
                        />
                        {errors.check_out && <p className="text-red-500 text-xs mt-1">{errors.check_out}</p>}
                    </div>
                    
                    {/* Submit Button */}
                    <div className="md:col-span-2 flex items-end h-full">
                        <Button
                            type="submit"
                            className="w-full h-12"
                            // Button is disabled if form is not valid or cities are loading
                            disabled={!isFormValid || isCitiesLoading}
                        >
                            جستجو
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SearchForm;
