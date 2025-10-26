// src/pages/hotels/[slug].tsx
// version: 4.0.0
// FEATURE: Major UI enhancements including Header/Footer, star icons, read-more, and new info sections.

import { GetServerSideProps } from 'next';
import Image from 'next/image';
import { useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/router';
import { ParsedUrlQuery } from 'querystring';

// --- API and Type Imports ---
import { getHotelDetails, HotelDetails } from '@/api/pricingService';
import { AvailableRoom, CartItem, CancellationPolicy, CancellationRule } from '@/types/hotel';

// --- Component Imports ---
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BookingWidget from '@/components/BookingWidget';
import RoomCard from '@/components/RoomCard';
import { useAuth } from '@/hooks/useAuth';
import { Star, Clock, LogIn, LogOut, Info, AlertTriangle } from 'lucide-react';

// --- Helper Functions and Components ---
const toPersianDigits = (str: string | number | undefined | null) => {
    if (str === undefined || str === null) return '';
    return String(str).replace(/\d/g, (d) => ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'][parseInt(d)]);
};

const StarRating = ({ count }: { count: number }) => (
  <div className="flex items-center">
    {Array.from({ length: count }, (_, i) => (
      <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
    ))}
  </div>
);

// --- Assuming ReadMore component exists ---
const ReadMore = ({ text, maxLength }: { text: string; maxLength: number }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  if (!text) return null;
  const needsReadMore = text.length > maxLength;

  return (
    <div className="text-sm text-gray-600">
      {isExpanded || !needsReadMore ? text : `${text.substring(0, maxLength)}...`}
      {needsReadMore && (
        <button 
          onClick={() => setIsExpanded(!isExpanded)} 
          className="text-blue-600 hover:underline ml-1"
        >
          {isExpanded ? 'کمتر' : 'بیشتر'}
        </button>
      )}
    </div>
  );
};

// --- START: New Helper Component for Cancellation Policy ---
interface CancellationPolicyProps {
  policy: CancellationPolicy;
  title: string;
}

const CancellationPolicyDisplay: React.FC<CancellationPolicyProps> = ({ policy, title }) => {
  
  const translatePenaltyType = (type: string): string => {
    switch (type) {
      case 'PERCENT_TOTAL': return 'درصد از کل مبلغ رزرو';
      case 'PERCENT_FIRST_NIGHT': return 'درصد از هزینه شب اول';
      case 'FIXED_NIGHTS': return 'شب اقامت';
      default: return type;
    }
  };

  const formatRule = (rule: CancellationRule): string => {
    const value = rule.penalty_type === 'FIXED_NIGHTS' ? Math.floor(rule.penalty_value) : rule.penalty_value;
    const daysText = rule.days_before_checkin_min === rule.days_before_checkin_max
      ? `${toPersianDigits(rule.days_before_checkin_min)} روز`
      : `از ${toPersianDigits(rule.days_before_checkin_min)} تا ${toPersianDigits(rule.days_before_checkin_max)} روز`;
      
    return `${daysText} قبل از ورود: جریمه معادل ${toPersianDigits(value)} ${translatePenaltyType(rule.penalty_type)}`;
  };

  return (
    <div className="flex items-start mb-4"> {/* Added margin-bottom */}
      <AlertTriangle className="w-5 h-5 text-orange-600 mt-1 mr-2 flex-shrink-0" />
      <div>
        <h3 className="font-semibold text-gray-700 mb-1">{title} ({policy.name})</h3>
        {policy.rules && policy.rules.length > 0 ? (
          <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
            {policy.rules.sort((a,b) => a.days_before_checkin_min - b.days_before_checkin_min).map((rule) => (
              <li key={rule.id}>{formatRule(rule)}</li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500">قوانین مشخصی تعریف نشده است.</p>
        )}
      </div>
    </div>
  );
};

interface HotelPageProps {
  hotel: HotelDetails;
  initialRooms: AvailableRoom[];
}

interface ContextParams extends ParsedUrlQuery {
    slug: string;
}

const HotelDetailPage = ({ hotel, initialRooms }: HotelPageProps) => {
  const router = useRouter();
  const { duration: durationFromQuery } = router.query;
  const duration = parseInt(durationFromQuery as string, 10) || 1;
  
  const { user } = useAuth();
  
  const [availableRooms, setAvailableRooms] = useState<AvailableRoom[]>(initialRooms);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  const handleRoomsFetch = useCallback((rooms: AvailableRoom[]) => {
    setAvailableRooms(rooms);
  }, []);

  const reservedRoomsMap = useMemo(() => {
    return cartItems.reduce((acc, item) => {
      const roomTypeId = item.room.id;
      acc[roomTypeId] = (acc[roomTypeId] || 0) + item.quantity;
      return acc;
    }, {} as Record<number, number>);
  }, [cartItems]);

  const handleAddToCart = useCallback((newItem: CartItem) => {
    setCartItems((prevItems) => {
      const existingItemIndex = prevItems.findIndex((item) => item.id === newItem.id);
      
      const targetRoom = availableRooms.find(r => r.id === newItem.room.id);
      const roomMaxAvailable = targetRoom?.availability_quantity || 0;
      
      let newTotalReserved = reservedRoomsMap[newItem.room.id] || 0;
      
      if (existingItemIndex > -1) {
        newTotalReserved -= prevItems[existingItemIndex].quantity;
      }
      newTotalReserved += newItem.quantity;
      
      if (newTotalReserved > roomMaxAvailable) {
          alert(`خطا: مجموع تعداد اتاق‌های انتخابی برای ${newItem.room.name} از موجودی کل (${roomMaxAvailable} اتاق) فراتر می‌رود.`);
          return prevItems;
      }

      if (existingItemIndex > -1) {
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex] = newItem;
        return updatedItems;
      } else {
        return [...prevItems, newItem];
      }
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [availableRooms, reservedRoomsMap]);

  const handleRemoveFromCart = useCallback((itemId: string) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== itemId));
  }, []);

  return (
    // start modify
    <div className="bg-gray-50" dir="rtl">
      <Header />
      <div className="container mx-auto p-4 lg:p-8">
        <header className="mb-8">
            <div className="flex items-center gap-4">
              <h1 className="text-4xl font-extrabold text-gray-800">{hotel.name}</h1>
              {hotel.is_online && (
                <span className="bg-green-100 text-green-800 text-sm font-bold px-3 py-1 rounded-full">رزرو آنی و آنلاین</span>
              )}
            </div>
            <div className="flex items-center gap-4 text-lg text-gray-600 mt-2">
              <StarRating count={hotel.stars} />
              <span>-</span>
              <p>{hotel.address}</p>
            </div>
        </header>

        <div className="flex flex-col lg:flex-row gap-8">
          <main className="w-full lg:w-2/3">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-6 h-96 rounded-lg overflow-hidden shadow-lg">
                  <div className="col-span-2 row-span-2 relative">
                      <Image src={hotel.images[0]?.image || '/placeholder.png'} layout="fill" objectFit="cover" alt={hotel.name} priority />
                  </div>
                  {hotel.images.slice(1, 4).map((img, index) => (
                      <div key={index} className="relative">
                          <Image src={img.image} layout="fill" objectFit="cover" alt={`نمای هتل ${index + 2}`} />
                      </div>
                  ))}
              </div>

              <div className="flex justify-around items-center bg-white p-4 rounded-lg shadow-md mb-8 border">
                  <div className="flex items-center gap-2 text-gray-700">
                      <LogIn className="w-6 h-6 text-cyan-600" />
                      <div>
                          <p className="text-sm">ساعت ورود</p>
                          <p className="font-bold text-lg">{toPersianDigits(hotel.check_in_time)}</p>
                      </div>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                      <LogOut className="w-6 h-6 text-red-600" />
                      <div>
                          <p className="text-sm">ساعت خروج</p>
                          <p className="font-bold text-lg">{toPersianDigits(hotel.check_out_time)}</p>
                      </div>
                  </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md mb-8 border">
                <h2 className="text-2xl font-bold mb-4">توضیحات هتل</h2>
                <p className={`text-gray-700 leading-relaxed transition-all duration-300 ${!isDescriptionExpanded ? 'line-clamp-3' : ''}`}>
                    {hotel.description}
                </p>
                <button 
                  onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                  className="text-blue-600 font-semibold mt-2"
                >
                  {isDescriptionExpanded ? 'بستن' : 'بیشتر بخوانید...'}
                </button>
              </div>

              <section id="rooms-section">
                  <h2 className="text-3xl font-bold mb-6 border-b pb-3">انتخاب اتاق</h2>
                  {isLoading ? (
                      <div className="text-center p-10 bg-white rounded-lg shadow">
                          <p className="text-lg font-semibold text-blue-600">در حال جستجوی بهترین قیمت‌ها برای شما...</p>
                      </div>
                  ) : (
                      <div className="space-y-6">
                          {availableRooms.length > 0 ? (
                              availableRooms.map((room) => (
                                  <RoomCard 
                                    key={room.id} 
                                    room={room} 
                                    onAddToCart={handleAddToCart}
                                    duration={duration} 
                                    reservedCount={reservedRoomsMap[room.id] || 0}
				    hotelId={hotel.id}
                                  />
                              ))
                          ) : (
                              <div className="text-center p-10 bg-gray-100 rounded-md border">
                                  <p className="font-semibold text-gray-700">
                                      برای مشاهده قیمت و اتاق‌های موجود، لطفا تاریخ ورود و مدت اقامت خود را در پنل کناری مشخص کنید.
                                  </p>
                              </div>
                          )}
                      </div>
                  )}
              </section>
          </main>

          <aside className="w-full lg:w-1/3">
            <BookingWidget 
              hotelSlug={hotel.slug}
              onRoomsFetch={handleRoomsFetch}
              setIsLoading={setIsLoading}
              cartItems={cartItems}
              onRemoveFromCart={handleRemoveFromCart}
              userId={user?.id || null} 
            />
          </aside>
        </div>
      </div>
      <Footer />
    </div>
    // end modify
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
    const { slug } = context.params as ContextParams;
    const { check_in, duration } = context.query;

    try {
        const hotel = await getHotelDetails(slug, check_in as string, duration as string);
        const initialRooms = hotel.available_rooms || [];
        
        return { 
            props: { 
                hotel,
                initialRooms 
            } 
        };
    } catch (error) {
        console.error('Failed to fetch initial hotel details:', error);
        return { notFound: true };
    }
};

export default HotelDetailPage;
