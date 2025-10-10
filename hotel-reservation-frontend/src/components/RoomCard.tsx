// src/components/RoomCard.tsx
// version: 2.0.0
// Fix: Incorporated reservedCount to enforce overall RoomType capacity (Bug 2).

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { AvailableRoom, PricedBoardType, CartItem } from '@/types/hotel';
import { Button } from './ui/Button';
import { UserGroupIcon } from '@heroicons/react/24/outline';

interface RoomCardProps {
  room: AvailableRoom;
  duration: number; // Duration in nights
  onAddToCart: (item: CartItem) => void;
  // BUG 2: Added prop for reserved count of this room type
  reservedCount: number;
}

const RoomCard: React.FC<RoomCardProps> = ({ room, duration, onAddToCart, reservedCount }) => {
  // Filter available boards first
  const availableBoards = room.priced_board_types.filter(p => p.total_price > 0);
  
  // State to hold the selected board type. Initialize with the first available option.
  const [selectedBoard, setSelectedBoard] = useState<PricedBoardType | null>(
    availableBoards.length > 0 ? availableBoards[0] : null
  );
  // State for the quantity of rooms to book
  const [quantity, setQuantity] = useState<number>(1);
  
  // BUG 2: Calculate max quantity available for NEW reservation/update
  const maxAvailable = room.availability_quantity || 0;
  // The number of rooms that can still be added/updated for this RoomType
  const remainingRooms = maxAvailable - (reservedCount || 0); 
  const isReservationPossible = remainingRooms > 0;
  
  // Find current quantity in cart for this specific room/board combo
  const cartItemId = selectedBoard ? `${room.id}-${selectedBoard.board_type.id}` : null;
  // NOTE: This component doesn't know the cart, but we keep the local quantity state.

  // Effect to reset selection if room data changes
  useEffect(() => {
    const newAvailableBoards = room.priced_board_types.filter(p => p.total_price > 0);
    setSelectedBoard(newAvailableBoards.length > 0 ? newAvailableBoards[0] : null);
    // Ensure quantity doesn't exceed 1 or remainingRooms
    setQuantity(Math.min(1, remainingRooms));
  }, [room, remainingRooms]); // Dependency on remainingRooms is key for auto-reset/limit

  const handleAddToCart = () => {
    if (!selectedBoard || !room.is_available || quantity <= 0) return;

    const cartItem: CartItem = {
      id: `${room.id}-${selectedBoard.board_type.id}`,
      room: {
        id: room.id,
        name: room.name,
        image: room.images.length > 0 ? room.images[0] : null,
      },
      selected_board: {
        id: selectedBoard.board_type.id,
        name: selectedBoard.board_type.name,
      },
      quantity: quantity,
      price_per_room: selectedBoard.total_price, // This is the total price for the whole duration
      total_price: selectedBoard.total_price * quantity,
    };
    
    // Parent component (HotelDetailPage) will perform the global capacity check 
    // before updating the cartItems state.
    onAddToCart(cartItem);
    // After adding/updating, reset local quantity to 1 for next selection.
    setQuantity(1); 
  };

  if (!room.is_available) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200 opacity-50">
        <p className="text-center text-gray-600">{room.name}</p>
        <p className="text-center text-red-500 font-semibold mt-2">{room.error_message || "ظرفیت تکمیل است"}</p>
      </div>
    );
  }
  
  const defaultImage = '/placeholder.png'; // A fallback image

  return (
    <div className={`bg-white p-4 rounded-lg shadow-md border flex flex-col md:flex-row gap-4 ${!isReservationPossible ? 'opacity-70 border-red-300' : 'border-gray-200'}`}>
      {/* Image and Basic Info Section */}
      <div className="md:w-1/3 flex-shrink-0">
        <div className="relative w-full h-48 rounded-md overflow-hidden">
          <Image
            src={room.images.length > 0 ? room.images[0].image : defaultImage}
            alt={room.name}
            layout="fill"
            objectFit="cover"
          />
        </div>
        <h3 className="text-lg font-bold mt-2 text-gray-800">{room.name}</h3>
        <div className="flex items-center text-sm text-gray-600 mt-1">
          <UserGroupIcon className="w-5 h-5 ml-1" />
          <span>ظرفیت: {room.base_capacity} نفر</span>
          {room.extra_capacity > 0 && <span> + {room.extra_capacity} نفر اضافه</span>}
        </div>
        {/* BUG 2: Show Remaining Availability */}
        <p className={`text-sm font-medium mt-2 ${remainingRooms > 0 ? 'text-green-600' : 'text-red-500'}`}>
            موجودی فعلی: {remainingRooms} اتاق (رزرو شده: {reservedCount})
        </p>
      </div>

      {/* Board Selection Section */}
      <div className="flex-grow md:border-r md:border-l px-4">
        <p className="font-semibold mb-2">
          قیمت کل برای <span className="text-blue-600">{duration}</span> شب اقامت:
        </p>
        <div className="space-y-2">
          {availableBoards.map((pricedBoard) => (
            <div
              key={pricedBoard.board_type.id}
              onClick={() => setSelectedBoard(pricedBoard)}
              className={`flex justify-between items-center p-3 rounded-lg border-2 cursor-pointer transition-all ${
                selectedBoard?.board_type.id === pricedBoard.board_type.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-400'
              }`}
            >
              <span className="font-medium text-gray-700">{pricedBoard.board_type.name}</span>
              <span className="font-bold text-blue-600">{pricedBoard.total_price.toLocaleString()} تومان</span>
            </div>
          ))}
        </div>
      </div>

      {/* Action Section */}
      <div className="md:w-1/4 flex flex-col justify-center items-center">
        <div className="w-full">
          <label htmlFor={`quantity-${room.id}`} className="block text-sm font-medium text-gray-700 text-center mb-1">
            تعداد اتاق
          </label>
          <input
            id={`quantity-${room.id}`}
            type="number"
            min="1"
            max={remainingRooms > 0 ? remainingRooms : 0} // Max is the remaining available rooms
            value={quantity}
            onChange={(e) => setQuantity(Math.min(remainingRooms > 0 ? remainingRooms : 1, Math.max(1, parseInt(e.target.value, 10) || 1)))}
            disabled={!isReservationPossible || !selectedBoard}
            className="w-full text-center px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
          />
        </div>
        <div className="mt-3 w-full">
            <Button 
                onClick={handleAddToCart}
                disabled={!selectedBoard || !isReservationPossible || quantity <= 0}
                className="w-full"
            >
                افزودن به سبد
            </Button>
            {!isReservationPossible && (
                <p className="text-red-500 text-xs text-center mt-1">ظرفیت تکمیل است.</p>
            )}
        </div>
      </div>
    </div>
  );
};

export default RoomCard;
