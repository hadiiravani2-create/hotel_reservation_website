// src/pages/hotels/[slug].tsx
// version: 3.0.3
// REFACTOR: Removed moment-jalaali and the unnecessary toEnglishDigits utility function.

import { GetServerSideProps } from 'next';
import Image from 'next/image';
import { useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/router';
import { ParsedUrlQuery } from 'querystring';

// --- API and Type Imports ---
import { getHotelDetails, HotelDetails } from '@/api/pricingService';
import { AvailableRoom, CartItem } from '@/types/hotel';

// --- Component Imports ---
import BookingWidget from '@/components/BookingWidget';
import RoomCard from '@/components/RoomCard';
import { UserGroupIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/hooks/useAuth';

// --- Utility Functions (toEnglishDigits removed) ---

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
          console.warn(`Cannot add/update. Total reserved rooms for ${newItem.room.name} exceeds availability of ${roomMaxAvailable}.`);
          alert(`خطا: مجموع تعداد اتاق‌های انتخابی (شامل سرویس‌های مختلف) برای ${newItem.room.name} از موجودی کل (${roomMaxAvailable} اتاق) فراتر می‌رود.`);
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
    <div className="container mx-auto p-4 lg:p-8 bg-gray-50" dir="rtl">
      <header className="mb-8">
          <h1 className="text-4xl font-extrabold text-gray-800">{hotel.name}</h1>
          <p className="text-lg text-gray-600 mt-1">{hotel.stars} ستاره - {hotel.address}</p>
      </header>

      <div className="flex flex-col lg:flex-row gap-8">
        <main className="w-full lg:w-2/3">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-8 h-96 rounded-lg overflow-hidden shadow-lg">
                <div className="col-span-2 row-span-2 relative">
                    <Image src={hotel.images[0]?.image || '/placeholder.png'} layout="fill" objectFit="cover" alt={hotel.name} priority />
                </div>
                {hotel.images.slice(1, 4).map((img, index) => (
                    <div key={index} className="relative">
                        <Image src={img.image} layout="fill" objectFit="cover" alt={`نمای هتل ${index + 2}`} />
                    </div>
                ))}
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
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
    const { slug } = context.params as ContextParams;
    const { check_in, duration } = context.query;

    try {
        // The check_in from query is already in the correct "YYYY-MM-DD" format.
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
