// FILE: src/pages/admin/hotels/[id]/pricing.tsx

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { AdminLayout } from '@/components/admin/layout/AdminLayout';
import { getHotelRooms, updateStock, updatePrice } from '@/api/admin/inventoryService';
import { getBoardTypes } from '@/api/admin/hotelService';
import { RoomType, BoardType } from '@/types/hotel'; 
import api from '@/api/coreService';
import { Save, ArrowRight, CheckCircle, AlertCircle, Calendar as CalendarIcon, ChevronRight, Layers, DollarSign } from 'lucide-react';

// Components
import { CalendarDrawer } from '@/components/admin/hotels/pricing/CalendarDrawer';
import { RoomSelector } from '@/components/admin/hotels/pricing/RoomSelector';
import { PricingForm } from '@/components/admin/hotels/pricing/PricingForm';

// Date Picker
import DatePicker, { DateObject } from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";

// REMOVED: const BOARD_TYPES = [...]  <-- حذف این آرایه ثابت که منبع خطا بود

export default function PricingPage() {
  const router = useRouter();
  const { id } = router.query;

  // --- States ---
  const [activeTab, setActiveTab] = useState<'inventory' | 'pricing'>('inventory');
  const [hotelName, setHotelName] = useState('');
  const [rooms, setRooms] = useState<RoomType[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  // Form Data
  const [selectedRoom, setSelectedRoom] = useState<number | null>(null);
  const [dateRange, setDateRange] = useState<DateObject[]>([]);

  // Inputs
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [extraPrice, setExtraPrice] = useState('');
  const [childPrice, setChildPrice] = useState('');
  
  // Dynamic Board Data
  const [boardTypes, setBoardTypes] = useState<BoardType[]>([]);
  const [boardType, setBoardType] = useState<number>(0);

  // --- API Calls ---
  useEffect(() => {
    if (!id) return;
    const init = async () => {
      try {
        setLoading(true);
        const [hotelRes, roomsRes, boardsRes] = await Promise.all([
            api.get(`/api/hotels/${id}/`),
            getHotelRooms(Number(id)),
            getBoardTypes() 
        ]);
        setHotelName(hotelRes.data.name);
        setRooms(roomsRes);
        setBoardTypes(boardsRes); // ذخیره لیست واقعی
        
        // تنظیم مقدار پیش‌فرض صحیح از دیتای واقعی
        if (boardsRes.length > 0) setBoardType(boardsRes[0].id); 
        
        if (roomsRes.length > 0) setSelectedRoom(roomsRes[0].id);
      } catch (error) {
        console.error(error);
        setMessage({ type: 'error', text: 'خطا در دریافت اطلاعات اولیه.' });
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [id]);

  // --- Handlers ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    if (!selectedRoom || dateRange.length < 2) return setMessage({ type: 'error', text: 'اتاق و تاریخ را انتخاب کنید.' });

    const startDate = dateRange[0].toDate().toISOString().split('T')[0];
    const endDate = dateRange[1].toDate().toISOString().split('T')[0];
    setSubmitting(true);

    try {
        if (activeTab === 'inventory') {
            if (!quantity) throw new Error("تعداد الزامی است.");
            await updateStock({ room: selectedRoom, start_date: startDate, end_date: endDate, quantity: Number(quantity) });
        } else {
            if (!price) throw new Error("قیمت پایه الزامی است.");
            // boardType اکنون حاوی ID واقعی است (مثلاً 5) نه ID ثابت (1)
            await updatePrice({
                room: selectedRoom, start_date: startDate, end_date: endDate, board_type: boardType,
                price: Number(price), extra_price: Number(extraPrice || 0), child_price: Number(childPrice || 0),
            });
        }
        setMessage({ type: 'success', text: 'تغییرات با موفقیت ذخیره شد.' });
    } catch (err: any) {
        setMessage({ type: 'error', text: err.message || 'خطا در عملیات' });
    } finally {
        setSubmitting(false);
    }
  };

  if (loading) return <AdminLayout><div className="p-20 text-center">در حال بارگذاری...</div></AdminLayout>;

  return (
    <AdminLayout>
      <button
        onClick={() => setIsCalendarOpen(true)}
        className="fixed left-0 top-32 z-30 flex items-center gap-2 pl-2 pr-4 py-3 bg-gradient-to-r from-blue-700 to-blue-500 text-white rounded-r-2xl shadow-xl hover:pr-6 transition-all group"
      >
        <CalendarIcon size={24} />
        <div className="flex flex-col items-start"><span className="text-xs font-bold opacity-90">مشاهده</span><span className="text-sm font-extrabold">تقویم</span></div>
        <ChevronRight size={18} className="mr-1 opacity-60 group-hover:translate-x-1 transition-transform" />
      </button>

      {/* FIX: استفاده از state به جای ثابت */}
      <CalendarDrawer 
        isOpen={isCalendarOpen} 
        onClose={() => setIsCalendarOpen(false)} 
        roomId={selectedRoom} 
        rooms={rooms} 
        boardTypes={boardTypes} // تغییر مهم: استفاده از state
      />

      <div className="max-w-4xl mx-auto">
        <div className="bg-white border-b border-gray-100 py-4 px-6 mb-6 -mx-6 flex items-center justify-between sticky top-16 z-20 shadow-sm rounded-b-xl">
            <h1 className="text-xl font-bold text-gray-800">مدیریت هتل <span className="text-blue-600 px-2">{hotelName}</span></h1>
            <Link href="/admin/hotels" className="text-gray-500 hover:text-gray-800 flex items-center gap-2 text-sm font-medium"><ArrowRight size={18} /> بازگشت</Link>
        </div>

        <div className="bg-gray-100 p-1 rounded-xl flex mb-6">
            {[
                { id: 'inventory', label: 'مدیریت موجودی', icon: Layers, color: 'text-blue-600' },
                { id: 'pricing', label: 'مدیریت قیمت', icon: DollarSign, color: 'text-green-600' }
            ].map((tab) => (
                <button
                    key={tab.id} onClick={() => setActiveTab(tab.id as any)}
                    className={`flex-1 py-3 px-4 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${activeTab === tab.id ? `bg-white ${tab.color} shadow-sm` : 'text-gray-500'}`}
                >
                    <tab.icon size={18} /> {tab.label}
                </button>
            ))}
        </div>

        {message && (
            <div className={`p-4 rounded-xl flex items-center gap-3 text-sm font-medium mb-6 ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />} {message.text}
            </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
            <RoomSelector rooms={rooms} selectedRoom={selectedRoom} onSelect={setSelectedRoom} activeTab={activeTab} />
            
            <section className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                <h3 className="text-gray-800 font-bold mb-3 text-sm flex items-center gap-2">
                    <span className="bg-gray-100 text-gray-600 w-5 h-5 rounded-full flex items-center justify-center text-[10px]">2</span> انتخاب بازه زمانی
                </h3>
                <DatePicker 
                    value={dateRange} onChange={setDateRange} range calendar={persian} locale={persian_fa}
                    inputClass="w-full p-3 rounded-xl border border-gray-200 outline-none focus:border-blue-500 font-vazir text-center bg-gray-50 focus:bg-white transition-colors"
                    placeholder="روی تقویم کلیک کنید"
                />
            </section>

            {/* FIX: استفاده از state به جای ثابت */}
            <PricingForm 
                activeTab={activeTab} 
                quantity={quantity} setQuantity={setQuantity}
                price={price} setPrice={setPrice} 
                extraPrice={extraPrice} setExtraPrice={setExtraPrice}
                childPrice={childPrice} setChildPrice={setChildPrice} 
                boardType={boardType} setBoardType={setBoardType}
                boardTypes={boardTypes} // تغییر مهم: استفاده از state
            />

            <button 
                disabled={submitting || !selectedRoom || dateRange.length < 2}
                className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2 ${activeTab === 'inventory' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'}`}
            >
                {submitting ? 'در حال ذخیره...' : <><Save size={20} /> ذخیره تغییرات</>}
            </button>
        </form>
      </div>
    </AdminLayout>
  );
}
