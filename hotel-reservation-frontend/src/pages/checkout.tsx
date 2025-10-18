// src/pages/checkout.tsx
// version: 3.2.0
// FEATURE: Implemented quantity selection and pricing logic for 'PER_PERSON' services.

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../hooks/useAuth';
import { useQuery, useMutation } from '@tanstack/react-query';
import { calculateMultiPrice, MultiPriceData } from '../api/pricingService';
import { createBooking, BookingPayload, GuestPayload } from '../api/reservationService';
import { fetchHotelServices } from '../api/servicesService';
import { CartItem, HotelService, SelectedServicePayload } from '../types/hotel';

// UI Components
import { Button } from '../components/ui/Button';
import GuestInputForm from '../components/GuestInputForm';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ServicesStep from '../components/checkout/ServicesStep';
import ServiceDetailsModal from '../components/checkout/ServiceDetailsModal';

// Date Handling & Icons
import { DateObject } from "react-multi-date-picker";
import { DATE_CONFIG } from '@/config/date';
import { Info } from 'lucide-react';

const toPersianDigits = (str: string | number | undefined) => {
    if (str === undefined || str === null) return '';
    const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    return String(str).replace(/[0-9]/g, (d) => persianDigits[parseInt(d)]);
};

const CheckoutPage: React.FC = () => {
    const router = useRouter();
    const { user, isAuthenticated } = useAuth();
    const [cart, setCart] = useState<CartItem[]>([]);
    const [checkIn, setCheckIn] = useState('');
    const [checkOut, setCheckOut] = useState('');
    const [duration, setDuration] = useState(0);
    const [guests, setGuests] = useState<Partial<GuestPayload>[]>([]);
    const [rulesAccepted, setRulesAccepted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [selectedServices, setSelectedServices] = useState<SelectedServicePayload[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentService, setCurrentService] = useState<HotelService | null>(null);

    useEffect(() => {
        const storedCart = localStorage.getItem('bookingCart');
        const storedCheckIn = localStorage.getItem('checkInDate');
        const storedCheckOut = localStorage.getItem('checkOutDate');
        const storedDuration = localStorage.getItem('duration');

        if (storedCart && storedCheckIn && storedCheckOut && storedDuration) {
            const parsedCart = JSON.parse(storedCart);
            setCart(parsedCart);
            setCheckIn(storedCheckIn);
            setCheckOut(storedCheckOut);
            setDuration(parseInt(storedDuration, 10));
            
            const totalGuests = parsedCart.reduce((acc: number, item: any) => acc + (item.adults || 0) + (item.children || 0), 0);
            setGuests(Array(totalGuests > 0 ? totalGuests : 1).fill({}));
        } else {
            router.push('/');
        }
    }, [router]);

    const { data: bookingDetails, isLoading: priceLoading } = useQuery<MultiPriceData>({
        queryKey: ['calculatePriceCheckout', cart, checkIn, checkOut, user],
        queryFn: () => {
            const bookingRoomsPayload = cart.map(item => ({
                room_type_id: item.room.id,
                board_type_id: item.selected_board.id,
                quantity: item.quantity,
                extra_adults: (item.adults || 0) - (item.room.base_capacity || 0) > 0 ? (item.adults || 0) - (item.room.base_capacity || 0) : 0,
                children_count: item.children || 0,
            }));
            
            return calculateMultiPrice({
                booking_rooms: bookingRoomsPayload,
                check_in: checkIn,
                check_out: checkOut,
                user_id: user?.id,
            });
        },
        enabled: cart.length > 0 && !!checkIn && !!checkOut && duration > 0,
        refetchOnWindowFocus: false,
        staleTime: 5 * 60 * 1000,
    });

    const hotelId = useMemo(() => cart.length > 0 ? (cart[0].room as any).hotel_id : undefined, [cart]);

    const { data: availableServices, isLoading: isLoadingServices } = useQuery<HotelService[]>({
        queryKey: ['hotelServices', hotelId],
        queryFn: () => fetchHotelServices(hotelId!),
        enabled: !!hotelId,
    });

    const mutation = useMutation({
        mutationFn: (data: BookingPayload) => createBooking(data),
        onSuccess: (data) => {
            localStorage.removeItem('bookingCart');
            if (data.booking_code) {
                 router.push(`/booking-success-transfer?booking_code=${data.booking_code}`);
            } else {
                 router.push(`/payment/${data.booking_code}`);
            }
        },
        onError: (error: any) => {
            setError(error.response?.data?.error || 'خطا در ثبت رزرو. لطفاً مجدداً تلاش کنید.');
        },
        onSettled: () => setLoading(false),
    });

    const handleGuestChange = (index: number, data: Partial<GuestPayload>) => {
        setGuests(prev => prev.map((guest, i) => i === index ? { ...guest, ...data } : guest));
    };
    
    // --- MODIFIED: Handle 'PER_PERSON' pricing model on service selection ---
    const handleSelectService = (service: HotelService) => {
        const totalGuests = guests.length;

        if (service.pricing_model === 'PERSON') {
            const quantityInput = window.prompt(`این سرویس برای چند نفر است؟ (حداکثر ${totalGuests} نفر)`, "1");
            if (quantityInput === null) return; // User cancelled

            const quantity = parseInt(quantityInput, 10);
            if (isNaN(quantity) || quantity <= 0 || quantity > totalGuests) {
                alert(`لطفاً یک عدد معتبر بین ۱ و ${totalGuests} وارد کنید.`);
                return;
            }

            if (service.service_type.requires_details) {
                // We'll pass the quantity to the modal later if needed, for now, just open it
                setCurrentService(service);
                setIsModalOpen(true);
                // For now, we add it with details empty, details are saved via handleSaveServiceDetails
                setSelectedServices(prev => [...prev, { id: service.id, quantity, details: {} }]);
            } else {
                setSelectedServices(prev => [...prev, { id: service.id, quantity, details: {} }]);
            }
        } else {
            if (service.service_type.requires_details) {
                setCurrentService(service);
                setIsModalOpen(true);
            } else {
                setSelectedServices(prev => [...prev, { id: service.id, quantity: 1, details: {} }]);
            }
        }
    };
    
    // --- MODIFIED: Handle quantity editing for 'PER_PERSON' services ---
    const handleEditService = (selected: SelectedServicePayload) => {
        const service = availableServices?.find(s => s.id === selected.id);
        if (!service) return;
        
        const totalGuests = guests.length;

        if (service.pricing_model === 'PERSON') {
            const quantityInput = window.prompt(`این سرویس برای چند نفر است؟ (حداکثر ${totalGuests} نفر)`, `${selected.quantity}`);
            if (quantityInput === null) return; // User cancelled

            const quantity = parseInt(quantityInput, 10);
            if (isNaN(quantity) || quantity <= 0 || quantity > totalGuests) {
                alert(`لطفاً یک عدد معتبر بین ۱ و ${totalGuests} وارد کنید.`);
                return;
            }

            // Update the quantity for the existing service
            setSelectedServices(prev => prev.map(s => s.id === service.id ? { ...s, quantity } : s));
        }
        
        if (service.service_type.requires_details) {
            setCurrentService(service);
            setIsModalOpen(true);
        }
    };

    const handleSaveServiceDetails = (details: Record<string, any>) => {
        if (currentService) {
            setSelectedServices(prev => prev.map(s => s.id === currentService.id ? { ...s, details } : s));
        }
        setIsModalOpen(false);
        setCurrentService(null);
    };

    const handleFinalSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!rulesAccepted) {
            setError('پذیرش قوانین و مقررات الزامی است.');
            return;
        }
        const finalGuests = guests.map(g => ({ ...g, is_foreign: g.is_foreign || false })) as GuestPayload[];
        const payload: BookingPayload = {
            booking_rooms: cart.map(item => ({
                room_type_id: item.room.id,
                board_type_id: item.selected_board.id,
                quantity: item.quantity,
                adults: item.adults,
                children: item.children,
            })),
            check_in: checkIn,
            check_out: checkOut,
            guests: finalGuests,
            rules_accepted: rulesAccepted,
            selected_services: selectedServices,
        };
        setLoading(true);
        mutation.mutate(payload);
    };
    
    const CheckoutSummary = () => {
        const totalServicesPrice = useMemo(() => {
            return selectedServices.reduce((total, selected) => {
                const serviceInfo = availableServices?.find(s => s.id === selected.id);
                if (!serviceInfo) return total;
                
                let price = 0;
                if (serviceInfo.pricing_model === 'PERSON') {
                    price = serviceInfo.price * selected.quantity;
                } else if (serviceInfo.pricing_model === 'BOOKING') {
                    price = serviceInfo.price;
                }
                
                return total + price;
            }, 0);
        }, [selectedServices, availableServices]);

        const finalTotalPrice = (bookingDetails?.total_price ?? 0) + totalServicesPrice;

        const formattedCheckIn = checkIn ? new DateObject({ date: checkIn, calendar: DATE_CONFIG.calendar, locale: DATE_CONFIG.locale }).format("dddd D MMMM") : '';
        const formattedCheckOut = checkOut ? new DateObject({ date: checkOut, calendar: DATE_CONFIG.calendar, locale: DATE_CONFIG.locale }).format("dddd D MMMM") : '';

        return (
            <div className="p-6 bg-white rounded-xl shadow-lg border border-gray-100 sticky top-8">
                <h2 className="text-xl font-bold mb-4 border-b pb-3">خلاصه رزرو</h2>
                
                <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-600">تاریخ ورود:</span>
                        <span className="font-semibold">{toPersianDigits(formattedCheckIn)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-600">تاریخ خروج:</span>
                        <span className="font-semibold">{toPersianDigits(formattedCheckOut)}</span>
                    </div>
                    <div className="flex justify-between text-sm pb-3 border-b">
                        <span className="text-gray-600">مدت اقامت:</span>
                        <span className="font-semibold">{toPersianDigits(duration)} شب</span>
                    </div>
                </div>

                <div className="space-y-2 text-sm mt-3">
                    <h3 className="font-bold mb-2">اتاق‌های انتخابی</h3>
                    {cart.map(item => (
                        <div key={item.id} className="pb-2">
                            <p className="font-semibold">{item.room.name}</p>
                            <p className="text-gray-600">{toPersianDigits(item.quantity)} اتاق - {item.selected_board.name}</p>
                        </div>
                    ))}
                </div>

                {selectedServices.length > 0 && (
                    <div className="mt-4 pt-4 border-t">
                         <h3 className="font-bold mb-2">خدمات اضافی</h3>
                         <ul className="space-y-2 text-sm">
                            {selectedServices.map(s => {
                                const serviceInfo = availableServices?.find(i => i.id === s.id);
                                if (!serviceInfo) return null;

                                const itemTotalPrice = serviceInfo.price * s.quantity;
                                const displayPrice = serviceInfo.price > 0 
                                    ? `${toPersianDigits(itemTotalPrice.toLocaleString())} تومان` 
                                    : 'رایگان';
                                
                                const quantityLabel = serviceInfo.pricing_model === 'PERSON' && s.quantity > 1 
                                    ? ` (${toPersianDigits(s.quantity)} نفر)` 
                                    : '';

                                return (
                                    <li key={s.id} className="flex justify-between items-center text-gray-700">
                                        <span>{serviceInfo.name}{quantityLabel}</span>
                                        <span className="font-medium">{displayPrice}</span>
                                    </li>
                                );
                            })}
                         </ul>
                    </div>
                )}
                
                <div className="mt-4 pt-4 border-t">
                    <div className="flex justify-between items-center text-sm mb-2">
                        <span className="text-gray-600">جمع هزینه اتاق‌ها:</span>
                        <span className="font-semibold">{priceLoading ? '...' : `${toPersianDigits(bookingDetails?.total_price.toLocaleString())} تومان`}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm mb-3">
                        <span className="text-gray-600">جمع هزینه خدمات:</span>
                        <span className="font-semibold">{toPersianDigits(totalServicesPrice.toLocaleString())} تومان</span>
                    </div>
                    <div className="font-bold text-xl flex justify-between items-center text-red-600">
                        <span>مبلغ نهایی:</span>
                        <span>{toPersianDigits(finalTotalPrice.toLocaleString())} تومان</span>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <><Header /><div className="container mx-auto p-4 md:p-8" dir="rtl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2 order-2 md:order-1">
                    <form onSubmit={handleFinalSubmit}>
                        {bookingDetails && (
                            <div>
                                <h2 className="text-2xl font-bold mb-4">اطلاعات میهمانان</h2>
                                <p className="text-sm text-gray-500 mb-4 p-3 bg-blue-50 rounded-md flex items-center"><Info className="ml-2 w-5 h-5 text-blue-500"/>اطلاعات نفر اول به عنوان سرپرست رزرو در نظر گرفته می‌شود.</p>
                                 {guests.map((guest, index) => (
                                    <GuestInputForm
                                        key={index}
                                        index={index}
                                        value={guest}
                                        onChange={handleGuestChange}
                                        isPrincipal={index === 0}
                                        containerClass={index === 0 ? "bg-yellow-50" : "bg-gray-50"}
                                        isUnauthenticated={!isAuthenticated}                                   />
                                ))}
                            </div>
                        )}

                        {!isLoadingServices && availableServices && availableServices.length > 0 && (
                            <div className="mt-8">
                                <ServicesStep services={availableServices} selectedServices={selectedServices} onSelectService={handleSelectService} onEditService={handleEditService} />
                            </div>
                        )}
                        
                        <div className="mt-8 pt-6 border-t">
                            <h2 className="text-2xl font-bold mb-4">تأیید نهایی و ثبت رزرو</h2>
                            <label className="flex items-center mb-6 cursor-pointer">
                                <input type="checkbox" checked={rulesAccepted} onChange={(e) => setRulesAccepted(e.target.checked)}
                                    className="ml-3 w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500" />
                                <span className="text-sm text-gray-700">قوانین و شرایط رزرو را مطالعه کرده و می‌پذیرم.</span>
                            </label>
                            {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
                            <Button type="submit" disabled={loading || !bookingDetails || !rulesAccepted} className="w-full md:w-auto">
                                {loading ? 'در حال ثبت اطلاعات...' : 'ثبت نهایی و هدایت به صفحه پرداخت'}
                            </Button>
                        </div>
                    </form>
                </div>
                <div className="md:col-span-1 order-1 md:order-2">
                    <CheckoutSummary />
                </div>
            </div>
        </div>
        
        {currentService && (
            <ServiceDetailsModal service={currentService} isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setCurrentService(null); }} onSave={handleSaveServiceDetails}/>
        )}

        <Footer /></>
    );
};

export default CheckoutPage;
