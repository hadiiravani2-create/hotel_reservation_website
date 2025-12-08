// src/pages/checkout.tsx
// version: 5.0.0
// REFACTOR: Removed editable occupancy logic. Now uses CartItem data from previous step as the single source of truth.
// FIX: Guests count, Pricing, and Payload are strictly derived from the Cart state.

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../hooks/useAuth';
import { useQuery, useMutation } from '@tanstack/react-query';
import { calculateMultiPrice, MultiPriceData } from '../api/pricingService';
import { createBooking, BookingPayload, GuestPayload } from '../api/reservationService';
import { fetchHotelServices } from '../api/servicesService';
import { CartItem, HotelService, SelectedServicePayload, BookingResponse } from '../types/hotel';

// UI Components
import { Button } from '../components/ui/Button';
import GuestInputForm from '../components/GuestInputForm';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ServiceDetailsModal from '../components/checkout/ServiceDetailsModal';

// Icons
import { Info, ChevronDown, Users, CheckCircle } from 'lucide-react';
import { DateObject } from "react-multi-date-picker";
import { DATE_CONFIG } from '@/config/date';
import { formatPrice, toPersianDigits } from '@/utils/format';

// --- Sub-components ---

// 1. Read-Only Room Summary Item (Replaces RoomOccupancyManager)
const RoomSummaryItem: React.FC<{ item: CartItem }> = ({ item }) => {
  return (
    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 mb-3 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors hover:border-blue-200">
      <div>
        <h3 className="font-bold text-gray-800 flex items-center gap-2">
            {item.room.name}
            <span className="text-xs font-normal bg-white px-2 py-1 rounded border text-gray-600">
                {toPersianDigits(item.quantity)} اتاق
            </span>
        </h3>
        <p className="text-sm text-gray-500 mt-1">
            سرویس: <span className="font-medium text-gray-700">{item.selected_board.name}</span>
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm">
          <div className="px-3 py-1 bg-blue-50 text-blue-700 rounded-md flex items-center gap-1 border border-blue-100">
              <Users className="w-4 h-4" />
              <span>ظرفیت پایه: {toPersianDigits(item.room.base_capacity)}</span>
          </div>
          
          {(item.extra_adults > 0 || item.children_count > 0) && (
              <div className="flex gap-2">
                  {item.extra_adults > 0 && (
                      <span className="px-2 py-1 bg-green-50 text-green-700 rounded-md border border-green-100 font-medium">
                          +{toPersianDigits(item.extra_adults)} نفر اضافه
                      </span>
                  )}
                  {item.children_count > 0 && (
                      <span className="px-2 py-1 bg-pink-50 text-pink-700 rounded-md border border-pink-100 font-medium">
                          +{toPersianDigits(item.children_count)} کودک
                      </span>
                  )}
              </div>
          )}
      </div>
    </div>
  );
};

// 2. Services Selection Component
interface ServicesStepProps {
  services: HotelService[];
  selectedServices: SelectedServicePayload[];
  onSelectService: (servicePayload: SelectedServicePayload) => void;
  onRemoveService: (serviceId: number) => void;
  totalGuests: number;
}

const ServicesStep: React.FC<ServicesStepProps> = ({ services, selectedServices, onSelectService, onRemoveService, totalGuests }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const isSelected = (serviceId: number) => {
    return selectedServices.some(s => s.id === serviceId);
  };

  const handleSelect = (service: HotelService) => {
    const quantity = service.pricing_model === 'PERSON' ? totalGuests : 1;
    onSelectService({ id: service.id, quantity, details: {} });
  };
  
  const servicesToShow = isExpanded ? services : services.slice(0, 2);

  return (
    <div className="p-5 bg-white rounded-xl shadow-lg border border-gray-100 mb-6">
      <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <span className="w-1 h-6 bg-primary-brand rounded-full"></span>
          خدمات اضافی (اختیاری)
      </h3>
      <div className="space-y-3">
        {servicesToShow.map(service => (
          <div key={service.id} className="flex justify-between items-center text-sm p-2 hover:bg-gray-50 rounded-lg transition-colors border border-transparent hover:border-gray-100">
            <div className="flex flex-col">
                <span className="font-semibold text-gray-800">{service.name}</span>
                <span className="text-gray-500 text-xs mt-0.5">
                    {service.price > 0 ? `${formatPrice(service.price)} ریال` : 'رایگان'}
                    {service.pricing_model === 'PERSON' && ' (هر نفر)'}
                </span>
            </div>
            
            {isSelected(service.id) ? (
              <Button onClick={() => onRemoveService(service.id)} variant="danger" size="sm" className="h-8 text-xs px-3">
                حذف
              </Button>
            ) : (
              <Button onClick={() => handleSelect(service)} variant="outline" size="sm" className="h-8 text-xs px-3 border-blue-200 text-blue-600 hover:bg-blue-50">
                افزودن
              </Button>
            )}
          </div>
        ))}
        {services.length > 2 && (
            <button onClick={() => setIsExpanded(!isExpanded)} className="text-primary-brand text-sm font-medium w-full flex items-center justify-center pt-3 mt-2 border-t border-dashed border-gray-200 hover:text-blue-700 transition-colors">
                {isExpanded ? 'بستن لیست' : `مشاهده ${toPersianDigits(services.length - 2)} خدمت دیگر`}
                <ChevronDown className={`w-4 h-4 mr-1 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
            </button>
        )}
      </div>
    </div>
  );
};

// --- Main Page Component ---

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

    // UI State
    const [isGuestDetailsOpen, setGuestDetailsOpen] = useState(false);

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
        // base + extra adults + children (already selected in previous step)
        const roomCapacity = item.room.base_capacity + item.extra_adults + item.children_count;
        return total + (roomCapacity * item.quantity);
      }, 0);
    }, [cart]);

    // 3. Initialize Guest Forms
    useEffect(() => {
      if (totalGuests > 0 && guests.length !== totalGuests) {
        const newGuests = Array(totalGuests).fill({});
        setGuests(prev => {
            // Keep existing guest data if available when resizing (rare case here)
            return newGuests.map((_, i) => prev[i] || {});
        });
      }
    }, [totalGuests]);

    // 4. Calculate Price (Using Cart Data directly)
    const { data: bookingDetails, isLoading: priceLoading } = useQuery<MultiPriceData>({
        queryKey: ['calculatePriceCheckout', cart, checkIn, checkOut, user],
        queryFn: () => {
            const bookingRoomsPayload = cart.map(item => ({
                room_type_id: item.room.id,
                board_type_id: item.selected_board.id,
                quantity: item.quantity,
                extra_adults: item.extra_adults,     // DIRECTLY FROM CART
                children_count: item.children_count, // DIRECTLY FROM CART
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
                     // Flatten field errors for display
                     const values = Object.values(errorData).flat();
                     if (values.length > 0) errorMessage = String(values[0]);
                }
            }
            setError(errorMessage);
        },
        onSettled: () => setLoading(false),
    });

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

        // Validate Principal Guest
        const principalGuest = guests[0];
        if (!principalGuest || !principalGuest.first_name || !principalGuest.last_name) {
            setError('لطفاً اطلاعات سرپرست رزرو (نفر اول) را به صورت کامل وارد کنید.');
            return;
        }

        // Clean Guests Data (Filter out empty forms)
        const finalGuests = guests
            .filter(g => g.first_name && g.last_name)
            .map(g => ({ ...g, is_foreign: g.is_foreign || false })) as GuestPayload[];

        const payload: BookingPayload = {
            booking_rooms: cart.map(item => ({
                room_type_id: item.room.id,
                board_type_id: item.selected_board.id,
                quantity: item.quantity,
                extra_adults: item.extra_adults,     // DIRECTLY FROM CART
                children_count: item.children_count, // DIRECTLY FROM CART
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

    // --- Summary Component ---
    const CheckoutSummary = () => {
        // Calculate services price
        const totalServicesPrice = useMemo(() => {
            return selectedServices.reduce((total, selected) => {
                const serviceInfo = availableServices?.find(s => s.id === selected.id);
                if (!serviceInfo) return total;
                let price = (serviceInfo.pricing_model === 'PERSON') ? serviceInfo.price * selected.quantity : serviceInfo.price;
                return total + price;
            }, 0);
        }, [selectedServices, availableServices]);

        // Base price comes from Cart logic (client-side approximation)
        const basePrice = useMemo(() => cart.reduce((total, item) => total + item.total_price, 0), [cart]);
        
        // Backend Total Price (includes complex logic, special days, etc.)
        const backendTotal = bookingDetails?.total_price ?? basePrice;
        
        // Final Total
        const finalTotalPrice = backendTotal + totalServicesPrice;

        const formattedCheckIn = checkIn ? new DateObject({ date: checkIn, calendar: DATE_CONFIG.calendar, locale: DATE_CONFIG.locale }).format("dddd D MMMM") : '';
        const formattedCheckOut = checkOut ? new DateObject({ date: checkOut, calendar: DATE_CONFIG.calendar, locale: DATE_CONFIG.locale }).format("dddd D MMMM") : '';

        return (
            <div className="p-6 bg-white rounded-xl shadow-lg border border-gray-100 sticky top-24 transition-all duration-300">
                <h2 className="text-xl font-bold mb-4 border-b pb-3 text-gray-800">خلاصه رزرو</h2>
                
                <div className="space-y-3 pb-3 border-b text-sm">
                    <div className="flex justify-between"><span className="text-gray-500">تاریخ ورود:</span><span className="font-semibold text-gray-800">{toPersianDigits(formattedCheckIn)}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">تاریخ خروج:</span><span className="font-semibold text-gray-800">{toPersianDigits(formattedCheckOut)}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">مدت اقامت:</span><span className="font-semibold text-gray-800">{toPersianDigits(duration)} شب</span></div>
                </div>

                <div className="mt-4 pt-2 space-y-2">
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">مبلغ اتاق‌ها و نفرات:</span>
                        <span className="font-bold text-gray-900">{priceLoading ? '...' : formatPrice(backendTotal)} <span className="text-xs font-normal">ریال</span></span>
                    </div>
                    
                    {totalServicesPrice > 0 && (
                        <div className="flex justify-between items-center text-sm text-blue-600">
                            <span>خدمات اضافی:</span>
                            <span className="font-bold">{formatPrice(totalServicesPrice)} <span className="text-xs font-normal">ریال</span></span>
                        </div>
                    )}
                    
                    <div className="border-t border-dashed my-3 pt-3">
                         <div className="flex justify-between items-center text-lg font-black text-primary-brand">
                            <span>مبلغ نهایی:</span>
                            <span>{priceLoading ? 'محاسبه...' : formatPrice(finalTotalPrice)} ریال</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <>
        <Header />
        <div className="container mx-auto p-4 md:p-8 min-h-screen" dir="rtl">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* LEFT COLUMN: Forms */}
                <div className="lg:col-span-2 order-2 lg:order-1 space-y-6">
                    <form onSubmit={handleFinalSubmit}>
                        
                        {/* 1. Rooms Summary (Read Only) */}
                        <div className="p-6 bg-white rounded-xl shadow-lg border border-gray-100">
                             <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-800">
                                <span className="w-1 h-6 bg-primary-brand rounded-full"></span>
                                ۱. جزئیات اتاق‌های انتخابی
                            </h2>
                            <div className="space-y-2">
                                {cart.map(item => (
                                    <RoomSummaryItem key={item.id} item={item} />
                                ))}
                            </div>
                        </div>

                        {/* 2. Guest Information */}
                        <div className="p-6 bg-white rounded-xl shadow-lg border border-gray-100 mt-6">
                            <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-800">
                                <span className="w-1 h-6 bg-primary-brand rounded-full"></span>
                                ۲. اطلاعات میهمانان
                            </h2>
                            
                            <div className="mb-6 p-4 bg-blue-50 border border-blue-100 rounded-lg flex items-start gap-3 text-sm text-blue-800">
                                <Info className="w-5 h-5 flex-shrink-0 mt-0.5"/>
                                <p>
                                    وارد کردن اطلاعات <strong>سرپرست رزرو (نفر اول)</strong> الزامی است. 
                                    <br/>
                                    اطلاعات سایر میهمانان ({toPersianDigits(Math.max(0, guests.length - 1))} نفر دیگر) اختیاری است، اما جهت تسریع در پذیرش هتل پیشنهاد می‌شود تکمیل گردد.
                                </p>
                            </div>
                            
                            {guests.length > 0 && (
                              <GuestInputForm 
                                index={0} 
                                value={guests[0]} 
                                onChange={handleGuestChange} 
                                isPrincipal={true} 
                                containerClass="bg-white border-2 border-primary-brand/20 shadow-sm"
                                isUnauthenticated={!isAuthenticated}
                              />
                            )}
                            
                            {guests.length > 1 && (
                              <div className="mt-6 border-t pt-4">
                                <button 
                                    type="button" 
                                    onClick={() => setGuestDetailsOpen(!isGuestDetailsOpen)} 
                                    className="flex items-center justify-between w-full font-bold text-gray-700 hover:text-primary-brand transition-colors p-2 rounded hover:bg-gray-50"
                                >
                                  <span>تکمیل اطلاعات سایر میهمانان (اختیاری)</span>
                                  <ChevronDown className={`w-5 h-5 transition-transform ${isGuestDetailsOpen ? 'rotate-180' : ''}`} />
                                </button>
                                
                                {isGuestDetailsOpen && (
                                  <div className="mt-4 space-y-4 animate-fadeIn">
                                    {guests.slice(1).map((guest, index) => (
                                      <GuestInputForm 
                                        key={index + 1} 
                                        index={index + 1} 
                                        value={guest} 
                                        onChange={handleGuestChange} 
                                        isPrincipal={false} 
                                        containerClass="bg-gray-50 border border-gray-200"
                                        isUnauthenticated={!isAuthenticated}
                                      />
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}
                        </div>

                        {/* 3. Final Actions */}
                        <div className="mt-8 pt-6">
                            <div className="flex items-start gap-3 mb-6 p-4 bg-gray-50 rounded-lg border">
                                <input 
                                    type="checkbox" 
                                    id="rules"
                                    checked={rulesAccepted} 
                                    onChange={(e) => setRulesAccepted(e.target.checked)} 
                                    className="mt-1 w-5 h-5 text-primary-brand border-gray-300 rounded focus:ring-primary-brand cursor-pointer" 
                                />
                                <label htmlFor="rules" className="text-sm text-gray-700 cursor-pointer leading-6 select-none">
                                    <span className="font-bold text-gray-900">قوانین و مقررات</span> رزرو هتل را به دقت مطالعه کرده و می‌پذیرم.
                                    مسئولیت صحت اطلاعات وارد شده بر عهده کاربر می‌باشد.
                                </label>
                            </div>
                            
                            {error && (
                                <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 border border-red-100 flex items-center gap-2">
                                    <Info className="w-5 h-5"/>
                                    {error}
                                </div>
                            )}

                            <Button 
                                type="submit" 
                                disabled={loading || priceLoading || !rulesAccepted} 
                                className="w-full py-4 text-lg font-bold shadow-xl shadow-blue-500/20 flex items-center justify-center gap-2"
                            >
                                {loading || priceLoading ? (
                                    'در حال پردازش...'
                                ) : (
                                    <>
                                        <CheckCircle className="w-5 h-5" />
                                        تایید نهایی و پرداخت
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </div>

                {/* RIGHT COLUMN: Summary & Services */}
                <div className="lg:col-span-1 order-1 lg:order-2 space-y-6">
                    <CheckoutSummary />

                    {!isLoadingServices && availableServices && availableServices.length > 0 && totalGuests > 0 && (
                        <ServicesStep 
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
