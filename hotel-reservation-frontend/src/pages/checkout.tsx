// src/pages/checkout.tsx
// version: 4.2.0
// REFACTOR: Moved ServicesStep to the sidebar and implemented new interaction logic and UI.

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
// ServicesStep is now redesigned and used differently
import ServiceDetailsModal from '../components/checkout/ServiceDetailsModal';

// Icons
import { Info, Plus, Minus, ChevronDown } from 'lucide-react';
import { DateObject } from "react-multi-date-picker";
import { DATE_CONFIG } from '@/config/date';

const toPersianDigits = (str: string | number | undefined | null) => {
    if (str === undefined || str === null) return '';
    const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    return String(str).replace(/[0-9]/g, (d) => persianDigits[parseInt(d)]);
};

// A type to hold the occupancy details for each cart item
type OccupancyDetail = {
  extra_adults: number;
  children: number;
};

// --- start modify ---

// Redesigned ServicesStep component for the sidebar
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
  
  const servicesToShow = isExpanded ? services : services.slice(0, 1);

  return (
    <div className="p-4 bg-white rounded-xl shadow-lg border border-gray-100 mb-6">
      <h3 className="text-lg font-bold mb-3">خدمات اضافی</h3>
      <div className="space-y-3">
        {servicesToShow.map(service => (
          <div key={service.id} className="flex justify-between items-center text-sm">
            <span className="font-semibold text-gray-700 flex-1">{service.name}</span>
            <span className="text-gray-600 mx-2">
              {service.price > 0 ? `${toPersianDigits(service.price.toLocaleString())} ت` : 'رایگان'}
              {service.pricing_model === 'PERSON' && <span className="text-xs"> (هر نفر)</span>}
            </span>
            {isSelected(service.id) ? (
              <Button onClick={() => onRemoveService(service.id)} variant="danger" size="sm" className="w-auto px-2 py-1 text-xs">
                حذف
              </Button>
            ) : (
              <Button onClick={() => handleSelect(service)} variant="outline" size="sm" className="w-auto px-2 py-1 text-xs">
                افزودن
              </Button>
            )}
          </div>
        ))}
        {services.length > 1 && (
            <button onClick={() => setIsExpanded(!isExpanded)} className="text-blue-600 text-sm font-semibold w-full flex items-center justify-center pt-2">
                {isExpanded ? 'نمایش کمتر' : `نمایش سایر خدمات (${toPersianDigits(services.length - 1)})`}
                <ChevronDown className={`w-4 h-4 mr-1 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
            </button>
        )}
      </div>
    </div>
  );
};


// Helper component for managing occupancy of a single room type from the cart
interface RoomOccupancyManagerProps {
  item: CartItem;
  occupancy: OccupancyDetail;
  onOccupancyChange: (cartItemId: string, newOccupancy: OccupancyDetail) => void;
}

const RoomOccupancyManager: React.FC<RoomOccupancyManagerProps> = ({ item, occupancy, onOccupancyChange }) => {
  const handleUpdate = (field: keyof OccupancyDetail, delta: number) => {
    const newValue = occupancy[field] + delta;
    
    if (field === 'extra_adults' && (newValue < 0 || newValue > item.room.extra_capacity)) return;
    if (field === 'children' && (newValue < 0 || newValue > item.room.child_capacity)) return;

    onOccupancyChange(item.id, { ...occupancy, [field]: newValue });
  };

  return (
    <div className="p-4 bg-gray-50 rounded-lg border mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      {/* Column 1: Room Details */}
      <div className="flex-1">
        <h3 className="font-bold text-lg text-gray-800">{item.room.name} <span className="text-sm font-normal">({toPersianDigits(item.quantity)} اتاق)</span></h3>
        <p className="text-sm text-gray-500">ظرفیت پایه: {toPersianDigits(item.room.base_capacity)} نفر</p>
      </div>
      
      {/* Column 2 & 3: Occupancy Counters */}
      <div className="flex items-center gap-4">
        {/* Extra Adults Counter */}
        {item.room.extra_capacity > 0 && (
            <div className="flex items-center justify-between p-2 bg-white rounded-md border min-w-[200px]">
              <div>
                <label className="font-semibold text-sm text-gray-700">بزرگسال اضافه</label>
                <p className="text-xs text-gray-500">حداکثر {toPersianDigits(item.room.extra_capacity)}</p>
              </div>
              <div className="flex items-center gap-1">
                <Button size="icon" variant="secondary" onClick={() => handleUpdate('extra_adults', 1)} disabled={occupancy.extra_adults >= item.room.extra_capacity} className="w-8 h-8">
                  <Plus className="w-4 h-4" />
                </Button>
                <span className="font-bold text-md w-6 text-center">{toPersianDigits(occupancy.extra_adults)}</span>
                <Button size="icon" variant="secondary" onClick={() => handleUpdate('extra_adults', -1)} disabled={occupancy.extra_adults <= 0} className="w-8 h-8">
                  <Minus className="w-4 h-4" />
                </Button>
              </div>
            </div>
        )}

        {/* Children Counter */}
        {item.room.child_capacity > 0 && (
            <div className="flex items-center justify-between p-2 bg-white rounded-md border min-w-[200px]">
              <div>
                <label className="font-semibold text-sm text-gray-700">کودک</label>
                <p className="text-xs text-gray-500">حداکثر {toPersianDigits(item.room.child_capacity)}</p>
              </div>
              <div className="flex items-center gap-1">
                <Button size="icon" variant="secondary" onClick={() => handleUpdate('children', 1)} disabled={occupancy.children >= item.room.child_capacity} className="w-8 h-8">
                  <Plus className="w-4 h-4" />
                </Button>
                <span className="font-bold text-md w-6 text-center">{toPersianDigits(occupancy.children)}</span>
                <Button size="icon" variant="secondary" onClick={() => handleUpdate('children', -1)} disabled={occupancy.children <= 0} className="w-8 h-8">
                  <Minus className="w-4 h-4" />
                </Button>
              </div>
            </div>
        )}
      </div>
    </div>
  );
};

// Helper component for creating collapsible sections
interface AccordionSectionProps {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}
const AccordionSection: React.FC<AccordionSectionProps> = ({ title, isOpen, onToggle, children }) => (
  <div className="p-6 bg-white rounded-xl shadow-lg border border-gray-100 mb-6">
    <button type="button" onClick={onToggle} className="flex items-center justify-between w-full font-bold text-2xl text-gray-800">
      {title}
      <ChevronDown className={`w-6 h-6 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
    </button>
    {isOpen && (
      <div className="mt-4 pt-4 border-t">
        {children}
      </div>
    )}
  </div>
);
// end modify


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

    const [occupancyDetails, setOccupancyDetails] = useState<Record<string, OccupancyDetail>>({});
    const [isOccupancyOpen, setOccupancyOpen] = useState(true);
    const [isGuestDetailsOpen, setGuestDetailsOpen] = useState(false);

    useEffect(() => {
        const storedCart = localStorage.getItem('bookingCart');
        const storedCheckIn = localStorage.getItem('checkInDate');
        const storedCheckOut = localStorage.getItem('checkOutDate');
        const storedDuration = localStorage.getItem('duration');

        if (storedCart && storedCheckIn && storedCheckOut && storedDuration) {
            const parsedCart: CartItem[] = JSON.parse(storedCart);
            setCart(parsedCart);
            setCheckIn(storedCheckIn);
            setCheckOut(storedCheckOut);
            setDuration(parseInt(storedDuration, 10));
            
            const initialOccupancy = parsedCart.reduce((acc, item) => {
              acc[item.id] = { extra_adults: 0, children: 0 };
              return acc;
            }, {} as Record<string, OccupancyDetail>);
            setOccupancyDetails(initialOccupancy);

        } else {
            router.push('/');
        }
    }, [router]);
    
    const totalGuests = useMemo(() => {
      if (Object.keys(occupancyDetails).length === 0) return 0;
      return cart.reduce((total, item) => {
        const occupancy = occupancyDetails[item.id] || { extra_adults: 0, children: 0 };
        const guestsPerRoom = item.room.base_capacity + occupancy.extra_adults + occupancy.children;
        return total + (guestsPerRoom * item.quantity);
      }, 0);
    }, [cart, occupancyDetails]);

    useEffect(() => {
      if (totalGuests > 0) {
        setGuests(Array(totalGuests).fill({}));
      }
    }, [totalGuests]);

    const { data: bookingDetails, isLoading: priceLoading } = useQuery<MultiPriceData>({
        queryKey: ['calculatePriceCheckout', cart, checkIn, checkOut, user, occupancyDetails],
        queryFn: () => {
            const bookingRoomsPayload = cart.map(item => ({
                room_type_id: item.room.id,
                board_type_id: item.selected_board.id,
                quantity: item.quantity,
                extra_adults: occupancyDetails[item.id]?.extra_adults || 0,
                children_count: occupancyDetails[item.id]?.children || 0,
            }));
            
            return calculateMultiPrice({
                booking_rooms: bookingRoomsPayload,
                check_in: checkIn,
                check_out: checkOut,
                user_id: user?.id,
            });
        },
        enabled: cart.length > 0 && !!checkIn && !!checkOut && duration > 0 && Object.keys(occupancyDetails).length > 0,
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
            setError(error.response?.data?.error || 'خطا در ثبت رزرو. لطفاً مجدداً تلاش کنید.');
        },
        onSettled: () => setLoading(false),
    });

    const handleOccupancyChange = useCallback((cartItemId: string, newOccupancy: OccupancyDetail) => {
      setOccupancyDetails(prev => ({ ...prev, [cartItemId]: newOccupancy }));
    }, []);

    const handleGuestChange = (index: number, data: Partial<GuestPayload>) => {
        setGuests(prev => prev.map((guest, i) => i === index ? { ...guest, ...data } : guest));
    };
    
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

        // --- CORRECTED VALIDATION LOGIC ---
        // 1. Validate the principal guest (first guest)
        const principalGuest = guests[0];
        if (!principalGuest || !principalGuest.first_name || !principalGuest.last_name || (!principalGuest.national_id && !principalGuest.passport_number)) {
            setError('لطفاً اطلاعات سرپرست رزرو (نفر اول) را به صورت کامل وارد کنید.');
            return;
        }

        // 2. Filter out other guests who have not been filled out
        const otherGuests = guests.slice(1).filter(g => g.first_name && g.last_name);
        
        // 3. Combine principal guest with filled-out other guests
        const finalGuests = [principalGuest, ...otherGuests].map(g => ({
            ...g,
            is_foreign: g.is_foreign || false
        })) as GuestPayload[];


        const payload: BookingPayload = {
            booking_rooms: cart.map(item => ({
                room_type_id: item.room.id,
                board_type_id: item.selected_board.id,
                quantity: item.quantity,
                adults: item.room.base_capacity + (occupancyDetails[item.id]?.extra_adults || 0),
                children: occupancyDetails[item.id]?.children || 0,
                extra_requests: null, // UI does not collect this, so pass null.
            })),
            check_in: checkIn,
            check_out: checkOut,
            guests: finalGuests,
            rules_accepted: rulesAccepted,
            selected_services: selectedServices,
	    agency_id: (isAuthenticated && user?.agency_id)
                            ? user.agency_id
                            : null,
	    
        };

        setLoading(true);
        mutation.mutate(payload);
    };   
    const CheckoutSummary = () => {
        const totalServicesPrice = useMemo(() => {
            return selectedServices.reduce((total, selected) => {
                const serviceInfo = availableServices?.find(s => s.id === selected.id);
                if (!serviceInfo) return total;
                let price = (serviceInfo.pricing_model === 'PERSON') ? serviceInfo.price * selected.quantity : serviceInfo.price;
                return total + price;
            }, 0);
        }, [selectedServices, availableServices, totalGuests]);

        const basePrice = useMemo(() => cart.reduce((total, item) => total + item.total_price, 0), [cart]);
        const extraOccupancyPrice = (bookingDetails?.total_price ?? basePrice) - basePrice;
        const finalTotalPrice = basePrice + extraOccupancyPrice + totalServicesPrice;

        const formattedCheckIn = checkIn ? new DateObject({ date: checkIn, calendar: DATE_CONFIG.calendar, locale: DATE_CONFIG.locale }).format("dddd D MMMM") : '';
        const formattedCheckOut = checkOut ? new DateObject({ date: checkOut, calendar: DATE_CONFIG.calendar, locale: DATE_CONFIG.locale }).format("dddd D MMMM") : '';

        return (
            <div className="p-6 bg-white rounded-xl shadow-lg border border-gray-100 sticky top-8">
                <h2 className="text-xl font-bold mb-4 border-b pb-3">خلاصه رزرو</h2>
                
                <div className="space-y-3 pb-3 border-b">
                    <div className="flex justify-between text-sm"><span className="text-gray-600">تاریخ ورود:</span><span className="font-semibold">{toPersianDigits(formattedCheckIn)}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-gray-600">تاریخ خروج:</span><span className="font-semibold">{toPersianDigits(formattedCheckOut)}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-gray-600">مدت اقامت:</span><span className="font-semibold">{toPersianDigits(duration)} شب</span></div>
                </div>

                <div className="mt-4 pt-4 border-t">
                    <div className="flex justify-between items-center text-sm mb-2"><span className="text-gray-600">هزینه پایه اتاق‌ها:</span><span className="font-semibold">{toPersianDigits(basePrice.toLocaleString())} تومان</span></div>
                    <div className="flex justify-between items-center text-sm mb-2"><span className="text-gray-600">هزینه نفرات اضافه:</span><span className="font-semibold">{priceLoading ? '...' : `${toPersianDigits(extraOccupancyPrice.toLocaleString())} تومان`}</span></div>
                    <div className="flex justify-between items-center text-sm mb-3"><span className="text-gray-600">جمع هزینه خدمات:</span><span className="font-semibold">{toPersianDigits(totalServicesPrice.toLocaleString())} تومان</span></div>
                    <div className="font-bold text-xl flex justify-between items-center text-red-600"><span >مبلغ نهایی:</span><span>{priceLoading ? '...' : `${toPersianDigits(finalTotalPrice.toLocaleString())} تومان`}</span></div>
                </div>
            </div>
        );
    };

    return (
        <><Header /><div className="container mx-auto p-4 md:p-8" dir="rtl">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 order-2 lg:order-1">
                    <form onSubmit={handleFinalSubmit}>
                        <AccordionSection title="۱. مدیریت اتاق‌ها و نفرات" isOpen={isOccupancyOpen} onToggle={() => setOccupancyOpen(!isOccupancyOpen)}>
                          {cart.map(item => (
                            <RoomOccupancyManager 
                              key={item.id}
                              item={item}
                              occupancy={occupancyDetails[item.id]}
                              onOccupancyChange={handleOccupancyChange}
                            />
                          ))}
                        </AccordionSection>
                        
                        <div className="p-6 bg-white rounded-xl shadow-lg border border-gray-100">
                            <h2 className="text-2xl font-bold mb-4">۲. اطلاعات میهمانان</h2>
                            <p className="text-sm text-gray-500 mb-4 p-3 bg-blue-50 rounded-md flex items-center"><Info className="ml-2 w-5 h-5 text-blue-500"/>اطلاعات نفر اول به عنوان سرپرست رزرو در نظر گرفته می‌شود.</p>
                            
                            {guests.length > 0 && (
                              <GuestInputForm index={0} value={guests[0]} onChange={handleGuestChange} isPrincipal={true} containerClass="bg-yellow-50" isUnauthenticated={!isAuthenticated} />
                            )}
                            
                            {guests.length > 1 && (
                              <div className="mt-4 border-t pt-4">
                                <button type="button" onClick={() => setGuestDetailsOpen(!isGuestDetailsOpen)} className="flex items-center justify-between w-full font-bold text-lg text-blue-700">
                                  اطلاعات سایر میهمانان ({toPersianDigits(guests.length - 1)} نفر)
                                  <ChevronDown className={`w-6 h-6 transition-transform ${isGuestDetailsOpen ? 'rotate-180' : ''}`} />
                                </button>
                                {isGuestDetailsOpen && (
                                  <div className="mt-4 space-y-4">
                                    {guests.slice(1).map((guest, index) => (
                                      <GuestInputForm key={index + 1} index={index + 1} value={guest} onChange={handleGuestChange} isPrincipal={false} containerClass="bg-gray-50" isUnauthenticated={!isAuthenticated} />
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}
                        </div>

                        <div className="mt-8 pt-6 border-t">
                            <h2 className="text-2xl font-bold mb-4">تأیید نهایی و ثبت رزرو</h2>
                            <label className="flex items-center mb-6 cursor-pointer"><input type="checkbox" checked={rulesAccepted} onChange={(e) => setRulesAccepted(e.target.checked)} className="ml-3 w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500" /><span className="text-sm text-gray-700">قوانین و شرایط رزرو را مطالعه کرده و می‌پذیرم.</span></label>
                            {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
                            <Button type="submit" disabled={loading || priceLoading || !rulesAccepted} className="w-full md:w-auto">{loading || priceLoading ? 'در حال پردازش...' : 'ثبت نهایی و هدایت به صفحه پرداخت'}</Button>
                        </div>
                    </form>
                </div>
                <div className="lg:col-span-1 order-1 lg:order-2">
                    {!isLoadingServices && availableServices && availableServices.length > 0 && totalGuests > 0 && (
                        <ServicesStep 
                            services={availableServices} 
                            selectedServices={selectedServices} 
                            onSelectService={handleSelectService} 
                            onRemoveService={handleRemoveService}
                            totalGuests={totalGuests}
                        />
                    )}
                    <CheckoutSummary />
                </div>
            </div>
        </div>
        
        {currentService && (<ServiceDetailsModal service={currentService} isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setCurrentService(null); }} onSave={handleSaveServiceDetails}/>)}

        <Footer /></>
    );
};

export default CheckoutPage;
