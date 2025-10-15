// src/components/SearchForm.tsx
// version: 1.0.3
// STYLE: Refined the grid layout for better alignment and responsiveness, and added a max-width container.

import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/router";
import { DateObject } from "react-multi-date-picker";
import { getCities } from "../api/pricingService";
import { Button } from "./ui/Button";
import { JalaliDatePicker } from "./ui/JalaliDatePicker";
import { DATE_CONFIG } from "@/config/date";

const getToday = () => new DateObject({ calendar: DATE_CONFIG.calendar, locale: DATE_CONFIG.locale }).format("YYYY-MM-DD");

const toPersianDigits = (str: string | number) => {
    return String(str).replace(/\d/g, (d) => ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'][parseInt(d)]);
};

interface City {
    id: number;
    name: string;
}

const SearchForm: React.FC = () => {
    const router = useRouter();
    const [formData, setFormData] = useState({
        city_id: "",
        check_in: getToday(),
        duration: "1",
    });
    const [errors, setErrors] = useState<{ city_id?: string; check_in?: string }>({});

    const {
        data: cities,
        isLoading: isCitiesLoading,
        error: citiesError,
    } = useQuery<City[]>({
        queryKey: ["cities"],
        queryFn: getCities,
    });

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (e.target.name === 'city_id' && e.target.value) {
            setErrors(prev => ({ ...prev, city_id: undefined }));
        }
    };

    const handleDateChange = (name: string, dateString: string) => {
        setFormData((prev) => ({ ...prev, [name]: dateString, duration: "1" }));
        if (dateString) {
            setErrors(prev => ({ ...prev, check_in: undefined }));
        }
    };

    const durationOptions = useMemo(() => {
        if (!formData.check_in) return [];

        const checkInDate = new DateObject({
            date: formData.check_in,
            calendar: DATE_CONFIG.calendar,
            locale: DATE_CONFIG.locale
        });

        return Array.from({ length: 10 }, (_, i) => {
            const nights = i + 1;
            const checkOutDate = new DateObject(checkInDate).add(nights, "days");
            const formattedCheckout = checkOutDate.format("YYYY/MM/DD");

            return {
                value: nights.toString(),
                label: `${toPersianDigits(nights)} شب (خروج: ${formattedCheckout})`,
            };
        });
    }, [formData.check_in]);

    const validateForm = () => {
        const newErrors: { city_id?: string; check_in?: string } = {};
        if (!formData.city_id) newErrors.city_id = "انتخاب شهر الزامی است.";
        if (!formData.check_in) newErrors.check_in = "انتخاب تاریخ ورود الزامی است.";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validateForm()) {
            router.push({ pathname: "/search", query: formData });
        }
    };

    const isFormValid = formData.city_id && formData.check_in;

    return (
        <div className="max-w-6xl mx-auto" dir="rtl">
            <div className="bg-white px-6 py-9 shadow-2xl rounded-2xl border border-gray-100">
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                    {/* City Selection */}
                    <div className="md:col-span-4">
                        <label className="block text-sm font-medium text-slate-600 mb-1">نام شهر یا هتل</label>
                        <select
                            name="city_id"
                            value={formData.city_id}
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
                            label="از تاریخ"
                            name="check_in"
                            onDateChange={handleDateChange}
                            initialValue={formData.check_in}
                            required
                        />
                        {errors.check_in && <p className="text-red-500 text-xs mt-1">{errors.check_in}</p>}
                    </div>

                    {/* Duration Dropdown */}
                    <div className="md:col-span-3">
                        <label className="block text-sm font-medium text-slate-600 mb-1">مدت اقامت</label>
                        <select
                            name="duration"
                            value={formData.duration}
                            onChange={handleChange}
                            disabled={!formData.check_in}
                            className="w-full h-12 p-4 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-brand focus:border-primary-brand hover:border-blue-500 transition-all"
                        >
                            {durationOptions.map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Submit Button */}
                    <div className="md:col-span-2 flex items-end h-full">
                        <Button
                            type="submit"
                            className="w-full h-12"
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
