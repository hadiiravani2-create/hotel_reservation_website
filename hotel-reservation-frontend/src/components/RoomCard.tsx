// src/components/RoomCard.tsx
// version: 1.2.0
// FINAL FIX: Corrected the component's props interface to accept all required props from the parent, resolving all type errors.

import React, { useState } from 'react';
import { AvailableRoom, CartItem, PricedBoardType, RoomImage } from '../types/hotel';

// --- FINAL FIX: The props interface now includes all necessary properties ---
interface RoomCardProps {
  room: AvailableRoom;
  duration: number;
  onAddToCart: (newItem: CartItem) => void;
  reservedCount: number; // Added to accept the count of already reserved rooms
}

const RoomCard: React.FC<RoomCardProps> = ({ room, duration, onAddToCart, reservedCount }) => {
  const [quantity, setQuantity] = useState<number>(1);
  const [adults, setAdults] = useState<number>(room.base_capacity);
  const [children, setChildren] = useState<number>(0);

  const handleCreateCartItem = (selectedBoard: PricedBoardType) => {
    if (quantity === 0) {
      alert("لطفا تعداد اتاق را مشخص کنید.");
      return;
    }

    const cartItem: CartItem = {
      id: `${room.id}-${selectedBoard.board_type.id}`,
      room: {
        id: room.id,
        name: room.name,
        image: room.images.length > 0 ? room.images[0] : null,
        base_capacity: room.base_capacity,
        hotel_id: (room as any).hotel_id,
      },
      selected_board: {
        id: selectedBoard.board_type.id,
        name: selectedBoard.board_type.name,
      },
      quantity: quantity,
      adults: adults,
      children: children,
      price_per_room: selectedBoard.total_price,
      total_price: selectedBoard.total_price * quantity,
    };

    // Call the parent's handler function
    onAddToCart(cartItem);
    alert(`${quantity} اتاق ${room.name} به سبد خرید شما اضافه شد.`);
  };

  return (
    <div className="border rounded-lg overflow-hidden shadow-sm mb-6">
        {/* UI for image, room description, etc. */}
        <div className="p-4">
            <h3 className="text-xl font-bold">{room.name}</h3>
            <p className="text-sm text-gray-600 mt-1">{room.description}</p>
            
            {/* UI for selecting quantity, adults, and children */}
            <div className="my-4 grid grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium">تعداد اتاق:</label>
                <input type="number" value={quantity} onChange={(e) => setQuantity(parseInt(e.target.value))} min="1" max={room.availability_quantity - reservedCount} className="w-full p-2 border rounded-md mt-1"/>
              </div>
              <div>
                <label className="text-sm font-medium">بزرگسال:</label>
                <input type="number" value={adults} onChange={(e) => setAdults(parseInt(e.target.value))} min={room.base_capacity} max={room.base_capacity + room.extra_capacity} className="w-full p-2 border rounded-md mt-1"/>
              </div>
              <div>
                <label className="text-sm font-medium">کودک:</label>
                <input type="number" value={children} onChange={(e) => setChildren(parseInt(e.target.value))} min="0" max={room.child_capacity} className="w-full p-2 border rounded-md mt-1"/>
              </div>
            </div>

            <div className="mt-4">
                <h4 className="font-semibold">انتخاب نوع سرویس:</h4>
                <div className="space-y-2 mt-2">
                    {room.priced_board_types.map(board => (
                        <div key={board.board_type.id} className="p-3 bg-gray-50 rounded-md flex justify-between items-center">
                            <div>
                                <span className="font-medium">{board.board_type.name}</span>
                            </div>
                            <div className="text-left">
                                <p className="font-bold text-lg text-red-600">{board.total_price.toLocaleString('fa-IR')} تومان</p>
                                <p className="text-xs text-gray-500">برای {duration} شب</p>
                                <button onClick={() => handleCreateCartItem(board)} className="mt-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700">
                                    افزودن به سبد
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    </div>
  );
};

export default RoomCard;
