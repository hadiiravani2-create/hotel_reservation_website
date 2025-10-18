// src/components/RoomCard.tsx
// version: 2.0.0
// REFACTOR: Complete redesign to a three-column layout with dynamic price updates on board selection.

// start modify
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { AvailableRoom, CartItem, PricedBoardType } from '../types/hotel';
import { Users, BedDouble, PlusCircle } from 'lucide-react';
import { Button } from './ui/Button';

interface RoomCardProps {
  room: AvailableRoom;
  duration: number;
  onAddToCart: (newItem: CartItem) => void;
  reservedCount: number;
  hotelId: number;
}

const toPersianDigits = (str: string | number | undefined) => {
    if (str === undefined || str === null) return '';
    const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    return String(str).replace(/[0-9]/g, (d) => persianDigits[parseInt(d)]);
};

const RoomCard: React.FC<RoomCardProps> = ({ room, duration, onAddToCart, reservedCount, hotelId }) => {
  const [quantity, setQuantity] = useState<number>(1);
  const [selectedBoard, setSelectedBoard] = useState<PricedBoardType | null>(null);

  useEffect(() => {
    // Initialize with the first available board type when the component mounts or room data changes
    if (room.priced_board_types && room.priced_board_types.length > 0) {
      setSelectedBoard(room.priced_board_types[0]);
    }
  }, [room.priced_board_types]);

  const handleAddToCart = () => {
    if (!selectedBoard) {
      alert("لطفا نوع سرویس را انتخاب کنید.");
      return;
    }
    if (quantity <= 0) {
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
	extra_capacity: room.extra_capacity,
	child_capacity: room.child_capacity,
	hotel_id: hotelId,
      },
      selected_board: {
        id: selectedBoard.board_type.id,
        name: selectedBoard.board_type.name,
      },
      quantity: quantity,
      price_per_room: selectedBoard.total_price,
      total_price: selectedBoard.total_price * quantity,
    };

    onAddToCart(cartItem);
    alert(`${toPersianDigits(quantity)} اتاق «${room.name}» با سرویس «${selectedBoard.board_type.name}» به سبد خرید شما اضافه شد.`);
  };

  const roomImage = room.images && room.images.length > 0 ? room.images[0].image : '/placeholder.png';
  const maxAvailableQuantity = room.availability_quantity - reservedCount;

  return (
    <div className="flex flex-col md:flex-row gap-4 border rounded-lg overflow-hidden shadow-md mb-6 bg-white transition-shadow hover:shadow-xl">
      {/* Column 1: Image (20%) */}
      <div className="w-full md:w-1/5 flex-shrink-0">
        <div className="relative h-48 md:h-full">
          <Image 
            src={roomImage} 
            alt={room.name}
            layout="fill"
            objectFit="cover"
            className="rounded-t-lg md:rounded-r-lg md:rounded-t-none"
          />
        </div>
      </div>

      {/* Column 2: Details (50%) */}
      <div className="w-full md:w-1/2 p-4 flex flex-col justify-between">
        <div>
          {/* Row 1: Title and Icons */}
          <h3 className="text-xl font-bold text-gray-800">{room.name}</h3>
          <div className="flex items-center gap-4 text-sm text-gray-600 mt-2">
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4 text-blue-500" />
              <span>ظرفیت: {toPersianDigits(room.base_capacity)} نفر</span>
              {room.extra_capacity > 0 && <span> + {toPersianDigits(room.extra_capacity)}</span>}
            </div>
            <div className="flex items-center gap-1">
              <BedDouble className="w-4 h-4 text-blue-500" />
              <span>{room.bed_type || 'تخت استاندارد'}</span>
            </div>
          </div>
          
          {/* Row 2: Description & Amenities */}
          <p className="text-sm text-gray-700 mt-3 border-t pt-3">{room.description}</p>
        </div>
        
        {/* Row 3: Board Selection */}
        <div className="mt-4">
          <h4 className="text-sm font-semibold mb-2">انتخاب نوع سرویس:</h4>
          <div className="flex flex-wrap gap-2">
            {room.priced_board_types.map(board => (
              <button
                key={board.board_type.id}
                onClick={() => setSelectedBoard(board)}
                className={`px-3 py-2 text-xs font-medium rounded-full transition-all border-2 ${
                  selectedBoard?.board_type.id === board.board_type.id
                    ? 'bg-blue-600 text-white border-blue-700 shadow-md'
                    : 'bg-gray-100 text-gray-800 border-gray-200 hover:bg-blue-50 hover:border-blue-300'
                }`}
              >
                {board.board_type.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Column 3: Pricing and Actions (30%) */}
      <div className="w-full md:w-3/10 p-4 bg-gray-50/70 flex flex-col justify-center items-center text-center border-t md:border-r md:border-t-none">
        <p className="text-xs text-gray-600">قیمت برای {toPersianDigits(duration)} شب</p>
        <p className="font-extrabold text-2xl text-red-600 my-2">
          {selectedBoard ? `${toPersianDigits(selectedBoard.total_price.toLocaleString())} تومان` : 'نامشخص'}
        </p>
        
        <div className="flex items-center gap-2 my-3">
          <label htmlFor={`quantity-${room.id}`} className="text-sm font-medium">تعداد اتاق:</label>
          <input 
            type="number" 
            id={`quantity-${room.id}`}
            value={quantity} 
            onChange={(e) => setQuantity(parseInt(e.target.value))} 
            min="1" 
            max={maxAvailableQuantity}
            className="w-16 p-2 text-center border rounded-md"
            disabled={maxAvailableQuantity <= 0}
          />
        </div>
        {maxAvailableQuantity <= 0 ? (
            <p className="text-sm text-red-500 font-bold mt-2">ظرفیت تکمیل است</p>
        ) : (
            <Button onClick={handleAddToCart} className="w-full mt-2 flex items-center justify-center">
              <PlusCircle className="w-5 h-5 ml-2" />
              افزودن به لیست
            </Button>
        )}
      </div>
    </div>
  );
};

export default RoomCard;
// end modify
