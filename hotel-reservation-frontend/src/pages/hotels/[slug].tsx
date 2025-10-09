// src/pages/hotels/[slug].tsx
// version: 2.1.0
// Final: Implements the complete two-column dynamic layout with robust state management, modular components, and fixes the infinite loop issue.

import { GetServerSideProps } from 'next';
import Image from 'next/image';
import { useState } from 'react';
import { ParsedUrlQuery } from 'querystring';

// --- API and Type Imports ---
import { getHotelDetails, HotelDetails } from '@/api/pricingService';
import { AvailableRoom, CartItem } from '@/types/hotel';

// --- Component Imports ---
import BookingWidget from '@/components/BookingWidget';
import RoomCard from '@/components/RoomCard';
import { UserGroupIcon } from '@heroicons/react/24/outline'; // Assuming this is now installed

interface HotelPageProps {
  hotel: HotelDetails; // Basic hotel data fetched server-side
  initialRooms: AvailableRoom[]; // Rooms list, possibly empty if no date in URL
}

interface ContextParams extends ParsedUrlQuery {
    slug: string;
}

const HotelDetailPage = ({ hotel, initialRooms }: HotelPageProps) => {
  // State for rooms, initialized by server, updated by client
  const [availableRooms, setAvailableRooms] = useState<AvailableRoom[]>(initialRooms);
  // State for the local shopping cart
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  // State to show a loading indicator over the rooms list
  const [isLoading, setIsLoading] = useState(false);

  // Handler for BookingWidget to update the parent page's room list
  const handleRoomsFetch = (rooms: AvailableRoom[]) => {
    setAvailableRooms(rooms);
  };

  // Handler for RoomCard to add/update items in the cart
  const handleAddToCart = (newItem: CartItem) => {
    setCartItems((prevItems) => {
      const existingItemIndex = prevItems.findIndex((item) => item.id === newItem.id);

      if (existingItemIndex > -1) {
        // If item with the same room and board type exists, update it
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex] = newItem;
        return updatedItems;
      } else {
        // Otherwise, add as a new item
        return [...prevItems, newItem];
      }
    });
     // Optional: Scroll to the booking widget to show the updated cart summary
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="container mx-auto p-4 lg:p-8 bg-gray-50" dir="rtl">
      {/* Hotel Header */}
      <header className="mb-8">
          <h1 className="text-4xl font-extrabold text-gray-800">{hotel.name}</h1>
          <p className="text-lg text-gray-600 mt-1">{hotel.stars} ستاره - {hotel.address}</p>
      </header>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main Content Column */}
        <main className="w-full lg:w-2/3">
            {/* Image Gallery */}
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

            {/* Rooms Section */}
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
                                <RoomCard key={room.id} room={room} onAddToCart={handleAddToCart} />
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

        {/* Sidebar Column */}
        <aside className="w-full lg:w-1/3">
          <BookingWidget 
            hotelSlug={hotel.slug}
            onRoomsFetch={handleRoomsFetch}
            setIsLoading={setIsLoading}
            cartItems={cartItems}
          />
        </aside>
      </div>
    </div>
  );
};

// Fetches initial data on the server
export const getServerSideProps: GetServerSideProps = async (context) => {
    const { slug } = context.params as ContextParams;
    const { check_in, duration } = context.query;

    try {
        // Fetch hotel details. If dates are provided, it will include priced rooms.
        const hotel = await getHotelDetails(slug, check_in as string, duration as string);
        
        // available_rooms will be populated if check_in and duration are valid
        const initialRooms = hotel.available_rooms || [];
        
        return { 
            props: { 
                hotel,
                initialRooms 
            } 
        };
    } catch (error) {
        console.error('Failed to fetch initial hotel details:', error);
        // If hotel is not found or another error occurs, show a 404 page
        return { notFound: true };
    }
};

export default HotelDetailPage;
