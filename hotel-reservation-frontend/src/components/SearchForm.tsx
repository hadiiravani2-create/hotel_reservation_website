// src/components/SearchForm.tsx
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/router";
import { getCities } from "../api/pricingService";
import { Input } from "./ui/Input";
import { Button } from "./ui/Button";
import { JalaliDatePicker } from "./ui/JalaliDatePicker";

interface City {
    id: number;
    name: string;
}

const SearchForm: React.FC = () => {
    const router = useRouter();
    const [formData, setFormData] = useState({
        city_id: "",
        check_in: "",
        duration: "1",
    });

    const {
        data: cities,
        isLoading: isCitiesLoading,
        error: citiesError,
    } = useQuery<City[]>({
        queryKey: ["cities"],
        queryFn: getCities,
    });

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    ) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleDateChange = (name: string, dateString: string) => {
        setFormData((prev) => ({ ...prev, [name]: dateString }));
    };

    // FIX: Added the missing handleSubmit function definition
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.city_id || !formData.check_in || !formData.duration) {
            alert("لطفا تمام فیلدهای فرم را پر کنید.");
            return;
        }

        router.push({
            pathname: "/search",
            query: formData,
        });
    };

    return (
        <div
            className="bg-white px-6 py-9 shadow-2xl rounded-2xl border border-gray-100"
            dir="rtl"
        >
            <form
                onSubmit={handleSubmit}
                className="grid grid-cols-1 md:grid-cols-8 gap-4"
            >
                <div className="md:col-span-3">
                    <label className="block text-sm font-medium text-slate-600 mb-1">
                        نام شهر یا هتل
                    </label>
                    <select
                        name="city_id"
                        value={formData.city_id}
                        onChange={handleChange}
                        className="w-full h-12 p-4 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-brand focus:border-primary-brand hover:border-blue-500 transition-all"
                    >
                        <option value="">شهر را انتخاب کنید</option>
                        {isCitiesLoading && <option disabled>در حال بارگذاری...</option>}
                        {cities?.map((city) => (
                            <option key={city.id} value={city.id}>
                                {city.name}
                            </option>
                        ))}
                    </select>
                    {citiesError && <p className="text-red-500 text-xs mt-1">خطا در بارگذاری شهرها</p>}
                </div>

                <div className="md:col-span-2">
                    <JalaliDatePicker
                        label="از تاریخ"
                        name="check_in"
                        onDateChange={handleDateChange}
                        required
                    />
                </div>

                <div className="md:col-span-1">
                    <Input
                        label="به مدت"
                        name="duration"
                        type="number"
                        min="1"
                        value={formData.duration}
                        onChange={handleChange}
                    />
                </div>
                
                <div className="md:col-span-2 self-end">
                    <Button
                        type="submit"
                        className="w-full h-12"
                    >
                        جستجوی هتل
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default SearchForm;
