import React from 'react';
import RoomCard from '@/components/RoomCard';
import { AvailableRoom, CartItem } from '@/types/hotel';

interface HotelRoomListProps {
  rooms: AvailableRoom[];
  isLoading: boolean;
  onAddToCart: (newItem: CartItem) => void;
  duration: number;
  reservedRoomsMap: Record<number, number>;
  hotelId: number;
}

const HotelRoomList: React.FC<HotelRoomListProps> = ({ 
  rooms, 
  isLoading, 
  onAddToCart, 
  duration, 
  reservedRoomsMap, 
  hotelId 
}) => {
  return (
    <section id="rooms-section">
      <h2 className="text-2xl font-bold mb-6 border-b pb-3 text-gray-800">انتخاب اتاق</h2>
      
      {isLoading ? (
        <div className="text-center p-12 bg-white rounded-xl shadow-sm border border-gray-100">
           <div className="animate-spin w-10 h-10 border-4 border-primary-brand border-t-transparent rounded-full mx-auto mb-4"></div>
           <p className="text-lg font-semibold text-gray-600">در حال جستجوی بهترین قیمت‌ها...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {rooms.length > 0 ? (
            rooms.map((room) => (
              <RoomCard 
                key={room.id} 
                room={room} 
                onAddToCart={onAddToCart}
                duration={duration} 
                reservedCount={reservedRoomsMap[room.id] || 0}
                hotelId={hotelId}
              />
            ))
          ) : (
            <div className="text-center p-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
              <p className="font-semibold text-gray-600 mb-2">اتاقی یافت نشد</p>
              <p className="text-sm text-gray-500">
                  لطفا تاریخ ورود و مدت اقامت خود را در پنل کناری (یا بالای صفحه) تغییر دهید تا اتاق‌های موجود نمایش داده شوند.
              </p>
            </div>
          )}
        </div>
      )}
    </section>
  );
};

export default HotelRoomList;
