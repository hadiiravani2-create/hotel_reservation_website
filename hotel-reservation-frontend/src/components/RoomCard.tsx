// src/components/RoomCard.tsx
// version: 1.1.0
// Feature: Added duration display and filtering for unavailable boards.

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { AvailableRoom, PricedBoardType, CartItem } from '@/types/hotel';
import { Button } from './ui/Button';
import { UserGroupIcon } from '@heroicons/react/24/outline';

interface RoomCardProps {
  room: AvailableRoom;
  duration: number; // Duration in nights
  onAddToCart: (item: CartItem) => void;
}

const RoomCard: React.FC<RoomCardProps> = ({ room, duration, onAddToCart }) => {
  // Filter available boards first
  const availableBoards = room.priced_board_types.filter(p => p.total_price > 0);
  
  // State to hold the selected board type. Initialize with the first available option.
  const [selectedBoard, setSelectedBoard] = useState<PricedBoardType | null>(
    availableBoards.length > 0 ? availableBoards[0] : null
  );
  // State for the quantity of rooms to book
  const [quantity, setQuantity] = useState<number>(1);

  // Effect to reset selection if room data changes
  useEffect(() => {
    const newAvailableBoards = room.priced_board_types.filter(p => p.total_price > 0);
    setSelectedBoard(newAvailableBoards.length > 0 ? newAvailableBoards[0] : null);
    setQuantity(1);
  }, [room]);

  const handleAddToCart = () => {
    if (!selectedBoard || !room.is_available) return;

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
    onAddToCart(cartItem);
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
    <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200 flex flex-col md:flex-row gap-4">
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
            max={room.availability_quantity || 1}
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10)))}
            className="w-full text-center px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div className="mt-3 w-full">
            <Button 
                onClick={handleAddToCart}
                disabled={!selectedBoard || quantity > (room.availability_quantity || 0)}
                className="w-full"
            >
                افزودن به سبد
            </Button>
            {quantity > (room.availability_quantity || 0) && (
                <p className="text-red-500 text-xs text-center mt-1">موجودی کافی نیست</p>
            )}
        </div>
      </div>
    </div>
  );
};

export default RoomCard;
