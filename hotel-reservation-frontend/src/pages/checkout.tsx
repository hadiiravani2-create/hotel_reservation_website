// FILE: src/pages/checkout.tsx
// version: 6.2.0
// REFACTOR: Integrated Tax (VAT) Calculation logic based on backend response.

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../hooks/useAuth';
import { useBooking } from '../context/BookingContext'; 
import { useQuery, useMutation } from '@tanstack/react-query';
import { calculateMultiPrice, MultiPriceData } from '../api/pricingService';
import { createBooking, BookingPayload, GuestPayload } from '../api/reservationService';
import { fetchHotelServices } from '../api/servicesService';
import { HotelService, SelectedServicePayload, BookingResponse } from '../types/hotel';

// UI Components
import Header from '../components/Header';
import Footer from '../components/Footer';
import ServiceDetailsModal from '../components/checkout/ServiceDetailsModal';

// Modular Components
import CheckoutCartSummary from '../components/checkout/CheckoutCartSummary';
import CheckoutGuestSection from '../components/checkout/CheckoutGuestSection';
import CheckoutServices from '../components/checkout/CheckoutServices';
import CheckoutPriceSummary from '../components/checkout/CheckoutPriceSummary';
import CheckoutActions from '../components/checkout/CheckoutActions';

const CheckoutPage: React.FC = () => {
    const router = useRouter();
    const { user, isAuthenticated } = useAuth();
    
    // 1. Consumption of BookingContext
    const { 
        cart, 
        checkIn, 
        checkOut, 
        duration, 
        clearCart,
        isLoading: isContextLoading 
    } = useBooking();
    
    // Guest & Form State
    const [guests, setGuests] = useState<Partial<GuestPayload>[]>([]);
    const [rulesAccepted, setRulesAccepted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [validationErrors, setValidationErrors] = useState<any>({});

    // Services State
    const [selectedServices, setSelectedServices] = useState<SelectedServicePayload[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentService, setCurrentService] = useState<HotelService | null>(null);

    // 2. Booking Mutation
    const mutation = useMutation<BookingResponse, any, BookingPayload>({
        mutationFn: (data: BookingPayload) => createBooking(data),
        onSuccess: (data) => {
            clearCart(); 
            
            if (data.payment_type === 'offline') {
                 router.push(`/booking-success-transfer?booking_code=${data.booking_code}`);
            } else {
                 router.push(`/payment/${data.booking_code}`);
            }
        },            
    
        onError: (error: any) => {
            console.error("Booking Error:", error);
            let errorMessage = 'خطا در ثبت رزرو. لطفاً مجدداً تلاش کنید.';
            const errorData = error.response?.data;

            if (errorData) {
                if (typeof errorData === 'object' && !errorData.error && !errorData.detail) {
                    setValidationErrors(errorData);
                } else {
                    setValidationErrors({});
                }

                if (typeof errorData === 'string') errorMessage = errorData;
                else if (errorData.error) errorMessage = errorData.error;
                else if (errorData.detail) errorMessage = errorData.detail;
                else if (typeof errorData === 'object') {
                      if (errorData.non_field_errors) {
                          errorMessage = Array.isArray(errorData.non_field_errors) 
                            ? errorData.non_field_errors.join(' ') 
                            : String(errorData.non_field_errors);
                      } else {
                          errorMessage = 'لطفاً اطلاعات فرم را بررسی و خطاهای مشخص شده را اصلاح کنید.';
                      }
                }
            }
            setError(errorMessage);
        },
        onSettled: () => setLoading(false),
    });

    // 3. Security Redirect Guard
    useEffect(() => {
        if (!isContextLoading && cart.length === 0 && !mutation.isSuccess) {
            router.push('/');
        }
    }, [cart, isContextLoading, router, mutation.isSuccess]);
    
    // 4. Calculate Total Guests
    const totalGuests = useMemo(() => {
      return cart.reduce((total, item) => {
        const roomCapacity = item.room.base_capacity + item.extra_adults + item.children_count;
        return total + (roomCapacity * item.quantity);
      }, 0);
    }, [cart]);

    // 5. Initialize Guest Forms
    useEffect(() => {
      if (totalGuests > 0 && guests.length !== totalGuests) {
        const newGuests = Array(totalGuests).fill({});
        setGuests(prev => {
            return newGuests.map((_, i) => prev[i] || {});
        });
      }
    }, [totalGuests]);

    // 6. Pricing Calculation Query
    const { data: bookingDetails, isLoading: priceLoading } = useQuery<MultiPriceData>({
        queryKey: ['calculatePriceCheckout', cart, checkIn, checkOut, user],
        queryFn: () => {
            const bookingRoomsPayload = cart.map(item => ({
                room_type_id: item.room.id,
                board_type_id: item.selected_board.id,
                quantity: item.quantity,
                extra_adults: item.extra_adults,
                children_count: item.children_count,
            }));
            
            return calculateMultiPrice({
                booking_rooms: bookingRoomsPayload,
                check_in: checkIn!, 
                check_out: checkOut!,
                user_id: user?.id,
            });
        },
        enabled: cart.length > 0 && !!checkIn && !!checkOut && duration > 0,
        refetchOnWindowFocus: false,
        staleTime: 5 * 60 * 1000,
    });

    const hotelId = useMemo(() => cart.length > 0 ? cart[0].room.hotel_id : undefined, [cart]);

    const { data: availableServices, isLoading: isLoadingServices } = useQuery<HotelService[]>({
        queryKey: ['hotelServices', hotelId],
        queryFn: () => fetchHotelServices(hotelId!),
        enabled: !!hotelId,
    });

    // Handlers
    const handleGuestChange = useCallback((index: number, data: Partial<GuestPayload>) => {
        setGuests(prev => prev.map((guest, i) => i === index ? { ...guest, ...data } : guest));
    }, []);
   
    const handleSelectService = useCallback((servicePayload: SelectedServicePayload) => {
        setSelectedServices(prev => [...prev.filter(s => s.id !== servicePayload.id), servicePayload]);
    }, []);

    const handleRemoveService = useCallback((serviceId: number) => {
        setSelectedServices(prev => prev.filter(s => s.id !== serviceId));
    }, []);
    
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

        const principalGuest = guests[0];
        if (!principalGuest || !principalGuest.first_name || !principalGuest.last_name) {
            setError('لطفاً اطلاعات سرپرست رزرو (نفر اول) را به صورت کامل وارد کنید.');
            return;
        }

        const finalGuests = guests
            .filter(g => g.first_name && g.last_name)
            .map(g => ({ ...g, is_foreign: g.is_foreign || false })) as GuestPayload[];

        if (!checkIn || !checkOut) {
             setError('اطلاعات تاریخ رزرو یافت نشد.');
             return;
        }

        const payload: BookingPayload = {
            booking_rooms: cart.map(item => ({
                room_type_id: item.room.id,
                board_type_id: item.selected_board.id,
                quantity: item.quantity,
                extra_adults: item.extra_adults,
                children_count: item.children_count,
                extra_requests: null,
            })),
            check_in: checkIn,
            check_out: checkOut,
            guests: finalGuests,
            rules_accepted: rulesAccepted,
            selected_services: selectedServices,
            agency_id: (isAuthenticated && user?.agency_id) ? user.agency_id : null,
        };

        setLoading(true);
        mutation.mutate(payload);
    };    

    // --- Pricing Totals Logic (Updated for Tax) ---

    // 1. Extract Room Financials from API
    // If API isn't ready yet, fallback to cart calculation (without tax)
    const roomNetPrice = bookingDetails?.total_room_price || cart.reduce((total, item) => total + item.total_price, 0);
    const roomVat = bookingDetails?.total_vat || 0;
    const taxRate = bookingDetails?.tax_percentage || 0; // Get Hotel Tax Rate

    // 2. Calculate Services Financials (Base + Tax)
    const { servicesTotal, servicesVat } = useMemo(() => {
        let total = 0;
        let vat = 0;

        selectedServices.forEach(selected => {
            const serviceInfo = availableServices?.find(s => s.id === selected.id);
            if (!serviceInfo) return;

            // Base Price
            let price = (serviceInfo.pricing_model === 'PERSON') 
                ? serviceInfo.price * selected.quantity 
                : serviceInfo.price;
            
            total += price;

            // Tax Calculation: Only if service is taxable AND hotel has tax rate
            if (serviceInfo.is_taxable && taxRate > 0) {
                vat += price * (taxRate / 100);
            }
        });

        return { servicesTotal: total, servicesVat: vat };
    }, [selectedServices, availableServices, taxRate]);

    // 3. Final Aggregation
    const finalVat = roomVat + servicesVat;
    const finalTotalPrice = roomNetPrice + servicesTotal + finalVat;

    // Loading State
    if (isContextLoading) return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-brand"></div>
        </div>
    );

    return (
        <>
        <Header />
        <div className="container mx-auto p-4 md:p-8 min-h-screen" dir="rtl">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* LEFT COLUMN: Forms */}
                <div className="lg:col-span-2 order-2 lg:order-1 space-y-6">
                    <form onSubmit={handleFinalSubmit}>
                        
                        <CheckoutCartSummary cartItems={cart} />

                        <CheckoutGuestSection 
                            guests={guests} 
                            onGuestChange={handleGuestChange} 
                            isAuthenticated={!!isAuthenticated}
                            validationErrors={validationErrors} 
                        />

                        <CheckoutActions 
                            rulesAccepted={rulesAccepted}
                            setRulesAccepted={setRulesAccepted}
                            onSubmit={handleFinalSubmit}
                            isLoading={loading || priceLoading}
                            error={error}
                        />
                    </form>
                </div>

                {/* RIGHT COLUMN: Summary & Services */}
                <div className="lg:col-span-1 order-1 lg:order-2 space-y-6">
                    <CheckoutPriceSummary 
                        checkIn={checkIn || ''}
                        checkOut={checkOut || ''}
                        duration={duration}
                        basePrice={roomNetPrice}       // قیمت خالص اتاق
                        totalServicesPrice={servicesTotal} // قیمت خالص خدمات
                        totalVat={finalVat}            // کل مالیات (اتاق + خدمات)
                        finalPrice={finalTotalPrice}   // مبلغ قابل پرداخت
                        isLoading={priceLoading}
                    />

                    {!isLoadingServices && availableServices && availableServices.length > 0 && totalGuests > 0 && (
                        <CheckoutServices 
                            services={availableServices} 
                            selectedServices={selectedServices} 
                            onSelectService={handleSelectService} 
                            onRemoveService={handleRemoveService}
                            totalGuests={totalGuests}
                        />
                    )}
                </div>
            </div>
        </div>
        
        {currentService && (
            <ServiceDetailsModal 
                service={currentService} 
                isOpen={isModalOpen} 
                onClose={() => { setIsModalOpen(false); setCurrentService(null); }} 
                onSave={handleSaveServiceDetails}
            />
        )}

        <Footer />
        </>
    );
};

export default CheckoutPage;
