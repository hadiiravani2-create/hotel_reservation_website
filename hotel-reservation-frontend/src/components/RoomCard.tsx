// src/components/RoomCard.tsx
// version: 2.2.1
// DEBUG: Added console logs to inspect 'extra_adult_price' value.

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { AvailableRoom, CartItem, PricedBoardType } from '@/types/hotel';
import { Users, BedDouble, UserPlus, Baby, PlusCircle } from 'lucide-react';
import { Button } from './ui/Button';
import { formatPrice, toPersianDigits } from '@/utils/format';

interface RoomCardProps {
  room: AvailableRoom;
  duration: number;
  onAddToCart: (newItem: CartItem) => void;
  reservedCount: number;
  hotelId: number;
}

const RoomCard: React.FC<RoomCardProps> = ({ room, duration, onAddToCart, reservedCount, hotelId }) => {
  const quantity = 1;
  
  const [selectedBoard, setSelectedBoard] = useState<PricedBoardType | null>(null);
  const [extraAdults, setExtraAdults] = useState<number>(0);
  const [childrenCount, setChildrenCount] = useState<number>(0);

  useEffect(() => {
    if (room.priced_board_types && room.priced_board_types.length > 0) {
      setSelectedBoard(room.priced_board_types[0]);
    }
  }, [room.priced_board_types]);

  const maxExtraAdults = room.extra_capacity || 0;
  const maxChildren = room.child_capacity || 0;

  // Logic: Dynamic Price Calculation
  const finalPrice = useMemo(() => {
    if (!selectedBoard) return 0;
    
    let baseTotal = Number(selectedBoard.total_price);
    let extrasTotal = 0;

    // --- DEBUG LOGGING ---
    console.log(`[Room: ${room.name}] DEBUG PRICE CALCULATION:`);
    console.log('Base Price:', baseTotal);
    console.log('Extra Adult Price (Raw):', room.extra_adult_price);
    console.log('Child Price (Raw):', room.child_price);
    // ---------------------

    // Add extra adults cost
    if (extraAdults > 0) {
        // Fallback to 0 if price is missing/invalid to avoid NaN or weird logic
        const price = room.extra_adult_price ? Number(room.extra_adult_price) : 0;
        console.log(`Adding Adults: ${extraAdults} * ${price} * ${duration}`);
        extrasTotal += (extraAdults * price * duration);
    }
    
    // Add children cost
    if (childrenCount > 0) {
        const price = room.child_price ? Number(room.child_price) : 0;
        console.log(`Adding Children: ${childrenCount} * ${price} * ${duration}`);
        extrasTotal += (childrenCount * price * duration);
    }

    return baseTotal + extrasTotal;
  }, [selectedBoard, extraAdults, childrenCount, room.extra_adult_price, room.child_price, duration, room.name]);

  const handleAddToCart = () => {
    if (!selectedBoard) {
      alert("لطفا نوع سرویس را انتخاب کنید.");
      return;
    }
    
    const unitPrice = finalPrice; 

    const cartItem: CartItem = {
      id: `${room.id}-${selectedBoard.board_type.id}-${Date.now()}`,
      room: {
        id: room.id,
        name: room.name,
        image: room.images && room.images.length > 0 ? room.images[0] : null,
        base_capacity: room.base_capacity,
        extra_capacity: room.extra_capacity,
        child_capacity: room.child_capacity,
        hotel_id: hotelId,
        extra_adult_price: room.extra_adult_price,
        child_price: room.child_price
      },
      selected_board: {
        id: selectedBoard.board_type.id,
        name: selectedBoard.board_type.name,
      },
      quantity: quantity,
      price_per_room: unitPrice,
      total_price: unitPrice * quantity,
      extra_adults: extraAdults,
      children_count: childrenCount
    };

    onAddToCart(cartItem);
  };

  const roomImage = room.images && room.images.length > 0 ? room.images[0].image : '/placeholder.png';
  const maxAvailableQuantity = room.availability_quantity - reservedCount;

  return (
    <div className="flex flex-col md:flex-row gap-4 border rounded-lg overflow-hidden shadow-sm mb-6 bg-white transition-all duration-300 hover:shadow-lg hover:border-blue-200">
      
      {/* Column 1: Image (20%) */}
      <div className="w-full md:w-1/5 flex-shrink-0 relative min-h-[200px] md:min-h-0">
         <Image 
            src={roomImage} 
            alt={room.name}
            fill
            className="object-cover md:rounded-r-lg"
          />
      </div>

      {/* Column 2: Details & Selectors (50%) */}
      <div className="w-full md:w-1/2 p-4 flex flex-col justify-between">
        <div>
          <h3 className="text-xl font-bold text-gray-800">{room.name}</h3>
          
          <div className="flex items-center gap-4 text-sm text-gray-600 mt-2">
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4 text-blue-500" />
              <span>ظرفیت: {toPersianDigits(room.base_capacity)} نفر</span>
              {maxExtraAdults > 0 && <span className="text-green-600 text-xs"> (+{toPersianDigits(maxExtraAdults)} اضافه)</span>}
            </div>
            <div className="flex items-center gap-1">
              <BedDouble className="w-4 h-4 text-blue-500" />
              <span>{room.bed_types && room.bed_types.length > 0 ? room.bed_types[0].name : (room.bed_type || 'تخت استاندارد')}</span>
            </div>
          </div>
          
          <p className="text-sm text-gray-500 mt-3 border-t pt-3 line-clamp-2">{room.description}</p>
        </div>
        
        {/* INLINE SELECTORS & BOARD */}
        <div className="mt-4 space-y-4">
            
            {/* Board Selection */}
            <div>
                 <span className="text-xs font-semibold text-gray-700 block mb-2">نوع سرویس:</span>
                 <div className="flex flex-wrap gap-2">
                    {room.priced_board_types?.map(board => (
                      <button
                        key={board.board_type.id}
                        onClick={() => setSelectedBoard(board)}
                        className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all border ${
                          selectedBoard?.board_type.id === board.board_type.id
                            ? 'bg-blue-50 text-blue-700 border-blue-500 shadow-sm ring-1 ring-blue-500'
                            : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {board.board_type.name}
                      </button>
                    ))}
                 </div>
            </div>

            {/* Extra Guests Selectors */}
            {(maxExtraAdults > 0 || maxChildren > 0) && (
                <div className="flex gap-4 p-3 bg-gray-50 rounded-lg border border-gray-100">
                    {maxExtraAdults > 0 && (
                        <div className="flex items-center gap-2">
                            <UserPlus className="w-4 h-4 text-gray-400" />
                            <span className="text-xs text-gray-600">نفر اضافه:</span>
                            <select 
                                value={extraAdults}
                                onChange={(e) => setExtraAdults(Number(e.target.value))}
                                className="text-sm border rounded px-1 py-0.5 bg-white outline-none focus:border-blue-500"
                            >
                                {Array.from({ length: maxExtraAdults + 1 }, (_, i) => (
                                    <option key={i} value={i}>{toPersianDigits(i)}</option>
                                ))}
                            </select>
                        </div>
                    )}
                    
                    {maxChildren > 0 && (
                        <div className="flex items-center gap-2 border-r pr-4 border-gray-200">
                            <Baby className="w-4 h-4 text-gray-400" />
                            <span className="text-xs text-gray-600">کودک:</span>
                            <select 
                                value={childrenCount}
                                onChange={(e) => setChildrenCount(Number(e.target.value))}
                                className="text-sm border rounded px-1 py-0.5 bg-white outline-none focus:border-blue-500"
                            >
                                {Array.from({ length: maxChildren + 1 }, (_, i) => (
                                    <option key={i} value={i}>{toPersianDigits(i)}</option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>
            )}
        </div>
      </div>

      {/* Column 3: Pricing and Actions (30%) */}
      <div className="w-full md:w-3/10 p-4 bg-gray-50/50 flex flex-col justify-center items-center text-center border-t md:border-r md:border-t-none">
        <p className="text-xs text-gray-500">قیمت برای {toPersianDigits(duration)} شب</p>
        
        {/* Dynamic Price Display */}
        <p className="font-extrabold text-2xl text-primary-brand my-2">
          {finalPrice > 0 ? formatPrice(finalPrice) : 'نامشخص'}
          <span className="text-sm font-normal text-gray-600 mr-1">ریال</span>
        </p>
        
        {(extraAdults > 0 || childrenCount > 0) && (
            <p className="text-[10px] text-green-600 bg-green-50 px-2 py-0.5 rounded-full mb-2">
                (شامل هزینه نفرات اضافه)
            </p>
        )}
        
        {maxAvailableQuantity <= 0 ? (
            <p className="text-sm text-red-500 font-bold mt-2 bg-red-50 px-3 py-1 rounded">ظرفیت تکمیل است</p>
        ) : (
            <Button onClick={handleAddToCart} className="w-full mt-4 flex items-center justify-center gap-2 shadow-md py-3">
              <PlusCircle className="w-5 h-5" />
              افزودن به سبد
            </Button>
        )}
        
        {maxAvailableQuantity > 0 && maxAvailableQuantity <= 3 && (
             <span className="text-[10px] text-red-500 mt-2 font-medium animate-pulse">
                 فقط {toPersianDigits(maxAvailableQuantity)} اتاق باقی مانده!
             </span>
        )}
      </div>
    </div>
  );
};

export default RoomCard;
