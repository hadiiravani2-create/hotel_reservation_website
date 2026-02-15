// src/components/admin/hotels/pricing/RoomSelector.tsx
import { RoomType } from '@/types/hotel';
import { BedDouble, CheckCircle } from 'lucide-react';

interface Props {
  rooms: RoomType[];
  selectedRoom: number | null;
  onSelect: (id: number) => void;
  activeTab: 'inventory' | 'pricing';
}

export const RoomSelector = ({ rooms, selectedRoom, onSelect, activeTab }: Props) => {
  return (
    <section className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
        <h3 className="text-gray-800 font-bold mb-3 text-sm flex items-center gap-2">
            <span className="bg-gray-100 text-gray-600 w-5 h-5 rounded-full flex items-center justify-center text-[10px]">1</span>
            انتخاب اتاق
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {rooms.map((room) => (
                <div
                    key={room.id}
                    onClick={() => onSelect(room.id)}
                    className={`cursor-pointer p-3 rounded-xl border-2 transition-all text-center flex flex-col items-center gap-2 ${
                        selectedRoom === room.id 
                        ? activeTab === 'inventory' ? 'border-blue-500 bg-blue-50' : 'border-green-500 bg-green-50'
                        : 'border-gray-100 hover:border-gray-300'
                    }`}
                >
                    <div className="flex items-center gap-2">
                        <BedDouble size={18} className={selectedRoom === room.id ? 'text-gray-800' : 'text-gray-400'} />
                        <p className="font-bold text-sm text-gray-800">{room.name}</p>
                    </div>
                    {selectedRoom === room.id && <CheckCircle size={14} className={activeTab === 'inventory' ? 'text-blue-600' : 'text-green-600'} />}
                </div>
            ))}
        </div>
    </section>
  );
};
