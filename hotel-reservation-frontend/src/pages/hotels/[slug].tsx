// src/pages/hotels/[slug].tsx
// version: 5.0.0
// REFACTOR: Complete component separation for better maintainability and cleaner code.

import { GetServerSideProps } from 'next';
import { useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/router';
import { ParsedUrlQuery } from 'querystring';

// --- Imports ---
import { getHotelDetails } from '@/api/pricingService';
import { AvailableRoom, CartItem, HotelDetails } from '@/types/hotel';
import { useAuth } from '@/hooks/useAuth';

// --- UI Components ---
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BookingWidget from '@/components/BookingWidget';

// --- New Sub-Components ---
import HotelHeader from '@/components/hotel-detail/HotelHeader';
import HotelGallery from '@/components/hotel-detail/HotelGallery';
import HotelInfoSummary from '@/components/hotel-detail/HotelInfoSummary';
import HotelDescription from '@/components/hotel-detail/HotelDescription';
import HotelRoomList from '@/components/hotel-detail/HotelRoomList';

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
  
  // State Management
  const [availableRooms, setAvailableRooms] = useState<AvailableRoom[]>(initialRooms);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Handlers
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
      
      // If updating existing item, subtract its old quantity first
      if (existingItemIndex > -1) {
        newTotalReserved -= prevItems[existingItemIndex].quantity;
      }
      newTotalReserved += newItem.quantity;
      
      if (newTotalReserved > roomMaxAvailable) {
          alert(`خطا: مجموع تعداد اتاق‌های انتخابی از موجودی کل (${roomMaxAvailable} اتاق) بیشتر است.`);
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
    // Smooth scroll to widget or cart if needed (optional)
  }, [availableRooms, reservedRoomsMap]);

  const handleRemoveFromCart = useCallback((itemId: string) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== itemId));
  }, []);

  // View
  return (
    <div className="bg-gray-50 min-h-screen" dir="rtl">
      <Header />
      
      <div className="container mx-auto p-4 lg:p-8">
        
        {/* 1. Header Section */}
        <HotelHeader hotel={hotel} />

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content Column */}
          <main className="w-full lg:w-2/3">
              
              {/* 2. Gallery */}
              <HotelGallery images={hotel.images} hotelName={hotel.name} />

              {/* 3. Info Summary (Check-in/out) */}
              <HotelInfoSummary checkInTime={hotel.check_in_time} checkOutTime={hotel.check_out_time} />

              {/* 4. Description */}
              <HotelDescription description={hotel.description} />

              {/* 5. Room List */}
              <HotelRoomList 
                rooms={availableRooms}
                isLoading={isLoading}
                onAddToCart={handleAddToCart}
                duration={duration}
                reservedRoomsMap={reservedRoomsMap}
                hotelId={hotel.id}
              />
          </main>

          {/* Sidebar Column */}
          <aside className="w-full lg:w-1/3">
            <div className="sticky top-8">
                <BookingWidget 
                  hotelSlug={hotel.slug}
                  onRoomsFetch={handleRoomsFetch}
                  setIsLoading={setIsLoading}
                  cartItems={cartItems}
                  onRemoveFromCart={handleRemoveFromCart}
                  userId={user?.id || null} 
                />
            </div>
          </aside>
        </div>
      </div>
      
      <Footer />
    </div>
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
