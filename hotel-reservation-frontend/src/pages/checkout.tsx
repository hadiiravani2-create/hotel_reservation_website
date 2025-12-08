// src/pages/checkout.tsx
// version: 6.0.0
// REFACTOR: Fully componentized structure. Logic separated from UI.

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../hooks/useAuth';
import { useQuery, useMutation } from '@tanstack/react-query';
import { calculateMultiPrice, MultiPriceData } from '../api/pricingService';
import { createBooking, BookingPayload, GuestPayload } from '../api/reservationService';
import { fetchHotelServices } from '../api/servicesService';
import { CartItem, HotelService, SelectedServicePayload, BookingResponse } from '../types/hotel';

// UI Components
import Header from '../components/Header';
import Footer from '../components/Footer';
import ServiceDetailsModal from '../components/checkout/ServiceDetailsModal';

// New Modular Components
import CheckoutCartSummary from '../components/checkout/CheckoutCartSummary';
import CheckoutGuestSection from '../components/checkout/CheckoutGuestSection';
import CheckoutServices from '../components/checkout/CheckoutServices';
import CheckoutPriceSummary from '../components/checkout/CheckoutPriceSummary';
import CheckoutActions from '../components/checkout/CheckoutActions';

const CheckoutPage: React.FC = () => {
    const router = useRouter();
    const { user, isAuthenticated } = useAuth();
    
    // Core State
    const [cart, setCart] = useState<CartItem[]>([]);
    const [checkIn, setCheckIn] = useState('');
    const [checkOut, setCheckOut] = useState('');
    const [duration, setDuration] = useState(0);
    
    // Guest & Form State
    const [guests, setGuests] = useState<Partial<GuestPayload>[]>([]);
    const [rulesAccepted, setRulesAccepted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Services State
    const [selectedServices, setSelectedServices] = useState<SelectedServicePayload[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentService, setCurrentService] = useState<HotelService | null>(null);

    // 1. Load Data from LocalStorage
    useEffect(() => {
        const storedCart = localStorage.getItem('bookingCart');
        const storedCheckIn = localStorage.getItem('checkInDate');
        const storedCheckOut = localStorage.getItem('checkOutDate');
        const storedDuration = localStorage.getItem('duration');

        if (storedCart && storedCheckIn && storedCheckOut && storedDuration) {
            setCart(JSON.parse(storedCart));
            setCheckIn(storedCheckIn);
            setCheckOut(storedCheckOut);
            setDuration(parseInt(storedDuration, 10));
        } else {
            router.push('/');
        }
    }, [router]);
    
    // 2. Calculate Total Guests directly from Cart Items
    const totalGuests = useMemo(() => {
      return cart.reduce((total, item) => {
        const roomCapacity = item.room.base_capacity + item.extra_adults + item.children_count;
        return total + (roomCapacity * item.quantity);
      }, 0);
    }, [cart]);

    // 3. Initialize Guest Forms
    useEffect(() => {
      if (totalGuests > 0 && guests.length !== totalGuests) {
        const newGuests = Array(totalGuests).fill({});
        setGuests(prev => {
            return newGuests.map((_, i) => prev[i] || {});
        });
      }
    }, [totalGuests]);

    // 4. Calculate Price
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
                check_in: checkIn,
                check_out: checkOut,
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

    const mutation = useMutation<BookingResponse, any, BookingPayload>({
        mutationFn: (data: BookingPayload) => createBooking(data),
        onSuccess: (data) => {
            localStorage.removeItem('bookingCart');
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
                if (typeof errorData === 'string') errorMessage = errorData;
                else if (errorData.error) errorMessage = errorData.error;
                else if (typeof errorData === 'object') {
                     const values = Object.values(errorData).flat();
                     if (values.length > 0) errorMessage = String(values[0]);
                }
            }
            setError(errorMessage);
        },
        onSettled: () => setLoading(false),
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

    // Pricing Calcs for Summary
    const totalServicesPrice = useMemo(() => {
        return selectedServices.reduce((total, selected) => {
            const serviceInfo = availableServices?.find(s => s.id === selected.id);
            if (!serviceInfo) return total;
            let price = (serviceInfo.pricing_model === 'PERSON') ? serviceInfo.price * selected.quantity : serviceInfo.price;
            return total + price;
        }, 0);
    }, [selectedServices, availableServices]);

    const basePrice = useMemo(() => cart.reduce((total, item) => total + item.total_price, 0), [cart]);
    const backendTotal = bookingDetails?.total_price ?? basePrice;
    const finalTotalPrice = backendTotal + totalServicesPrice;

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
                        checkIn={checkIn}
                        checkOut={checkOut}
                        duration={duration}
                        basePrice={backendTotal}
                        totalServicesPrice={totalServicesPrice}
                        finalPrice={finalTotalPrice}
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
