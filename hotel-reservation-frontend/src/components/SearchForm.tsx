// src/components/SearchForm.tsx
// version: 1.4.0
// FIX: Updated URL query params to match requirements (city_id, duration, persian date). Enforced date constraints.

import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/router";
import { DateObject } from "react-multi-date-picker";
import { getCities } from "../api/pricingService";
import { Button } from "./ui/Button";
import { JalaliDatePicker } from "./ui/JalaliDatePicker";
import { DATE_CONFIG } from "@/config/date";
// Ensure you have created this utility file as requested previously
import { toPersianDigits } from "@/utils/format"; 

const createDateObj = (dateStr: string) => {
    return new DateObject({
        date: dateStr,
        format: "YYYY-MM-DD",
        calendar: DATE_CONFIG.calendar,
        locale: DATE_CONFIG.locale
    });
};

const getToday = () => new DateObject({ calendar: DATE_CONFIG.calendar, locale: DATE_CONFIG.locale }).format("YYYY-MM-DD");
const getTomorrow = () => new DateObject({ calendar: DATE_CONFIG.calendar, locale: DATE_CONFIG.locale }).add(1, "day").format("YYYY-MM-DD");

interface SearchData {
    city_id: string; // Changed from 'city' string to 'city_id'
    check_in: string;
    check_out: string;
}

const SearchForm = () => {
    const router = useRouter();
    
    const [searchData, setSearchData] = useState<SearchData>({
        city_id: "", // Initialize as empty string (for ID)
        check_in: getToday(),
        check_out: getTomorrow(),
    });

    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    const { data: cities, isLoading: isCitiesLoading } = useQuery({
        queryKey: ["cities"],
        queryFn: getCities,
    });

    const duration = useMemo(() => {
        const start = new DateObject({ date: searchData.check_in, calendar: DATE_CONFIG.calendar, locale: DATE_CONFIG.locale });
        const end = new DateObject({ date: searchData.check_out, calendar: DATE_CONFIG.calendar, locale: DATE_CONFIG.locale });
        const diff = (end.toUnix() - start.toUnix()) / (24 * 3600);
        return Math.max(0, Math.round(diff));
    }, [searchData.check_in, searchData.check_out]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setSearchData({ ...searchData, [e.target.name]: e.target.value });
        if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: "" });
    };

    const handleDateChange = (date: DateObject | null, field: "check_in" | "check_out") => {
        if (!date) return;
        const dateStr = date.format("YYYY-MM-DD");
        
        setSearchData(prev => {
            const newData = { ...prev, [field]: dateStr };
            
            // Logic: Ensure Check-out is always after Check-in
            if (field === 'check_in') {
                 const checkInTime = date.toUnix();
                 const currentCheckOut = new DateObject({ date: prev.check_out, calendar: DATE_CONFIG.calendar, locale: DATE_CONFIG.locale });
                 
                 // If new check-in is same or after check-out, reset check-out to check-in + 1 day
                 if (checkInTime >= currentCheckOut.toUnix()) {
                     newData.check_out = date.add(1, 'day').format("YYYY-MM-DD");
                 }
            }
            return newData;
        });
        
        if (errors[field]) setErrors({ ...errors, [field]: "" });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newErrors: { [key: string]: string } = {};
        
        if (!searchData.city_id) newErrors.city_id = "لطفا شهر مقصد را انتخاب کنید";
        if (duration < 1) newErrors.check_out = "حداقل مدت اقامت ۱ شب است";

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        // اصلاح شده: ارسال همان تاریخ شمسی موجود در State
        // نیازی به تبدیل به میلادی نیست، چون بک‌ند اکنون تاریخ شمسی را می‌فهمد.
        router.push({
            pathname: '/search',
            query: {
                city_id: searchData.city_id,
                check_in: searchData.check_in, // ارسال تاریخ شمسی (مثلاً 1403-10-06)
                duration: duration 
            }
        });
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-lg -mt-24 relative z-10 max-w-5xl mx-auto border border-gray-100">
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                
                {/* City Select */}
                <div className="md:col-span-4">
                    <label className="block text-sm font-medium mb-1 text-gray-700">مقصد (شهر یا هتل)</label>
                    <div className="relative">
                        <select
                            name="city_id" // Changed name to match state
                            value={searchData.city_id}
                            onChange={handleInputChange}
                            className="w-full h-12 px-4 bg-gray-50 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none transition-colors"
                            disabled={isCitiesLoading}
                        >
                            <option value="">انتخاب کنید...</option>
                            {cities?.map((city: any) => (
                                // FIX: Use city.id as value
                                <option key={city.id} value={city.id}>{city.name}</option>
                            ))}
                        </select>
                        <div className="absolute left-3 top-3.5 text-gray-400 pointer-events-none">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    </div>
                    {errors.city_id && <p className="text-red-500 text-xs mt-1">{errors.city_id}</p>}
                </div>

                {/* Check In */}
                <div className="md:col-span-3">
                    <JalaliDatePicker
                        label="تاریخ ورود"
                        name="check_in"
                        value={searchData.check_in}
                        onChange={(date) => handleDateChange(date, "check_in")}
                        minDate={new DateObject()}
                        required
                    />
                </div>

                {/* Check Out */}
                <div className="md:col-span-3">
                    <JalaliDatePicker
                        label={`تاریخ خروج (${toPersianDigits(duration)} شب)`}
                        name="check_out"
                        value={searchData.check_out}
                        onChange={(date) => handleDateChange(date, "check_out")}
                        minDate={createDateObj(searchData.check_in)}
                        required
                    />
                    {errors.check_out && <p className="text-red-500 text-xs mt-1">{errors.check_out}</p>}
                </div>

                {/* Submit */}
                <div className="md:col-span-2 h-full flex items-end">
                    <Button 
                        type="submit" 
                        className="w-full h-12 text-lg font-medium shadow-md hover:shadow-lg transition-all"
                        disabled={isCitiesLoading}
                    >
                        جستجو
                    </Button>
                </div>

            </form>
        </div>
    );
};

export default SearchForm;
