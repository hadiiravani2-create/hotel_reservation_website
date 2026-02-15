// FILE: src/components/admin/hotels/pricing/CalendarDrawer.tsx

import { useState, useEffect, useMemo, useRef } from 'react';
import { 
    X, RefreshCw, BarChart3, Filter, Save as SaveIcon, 
    Package, Coins, Users, Baby, ChevronLeft, ChevronRight, 
    Edit, AlertCircle, Copy, CheckSquare, FilterX, CalendarDays
} from 'lucide-react';
import { DateObject } from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import gregorian from "react-date-object/calendars/gregorian"; 
import gregorian_en from "react-date-object/locales/gregorian_en";

import { pricingService } from '@/api/admin/pricingService';
import { updateStock, updatePrice } from '@/api/admin/inventoryService';
import { PricingCalendarData } from '@/types/pricing';
import { RoomType, BoardType } from '@/types/hotel';

// --- لیست تعطیلات ثابت شمسی (ماه-روز) ---
const SOLAR_HOLIDAYS: Record<string, string> = {
    "01-01": "عید نوروز",
    "01-02": "عید نوروز",
    "01-03": "عید نوروز",
    "01-04": "عید نوروز",
    "01-12": "روز جمهوری اسلامی",
    "01-13": "روز طبیعت",
    "03-14": "رحلت امام خمینی",
    "03-15": "قیام ۱۵ خرداد",
    "11-22": "پیروزی انقلاب",
    "12-29": "ملی شدن صنعت نفت",
    // نکته: تعطیلات قمری چرخشی هستند و نیاز به تبدیل پیچیده دارند
    // اما جمعه‌ها همیشه محاسبه می‌شوند.
};

interface Props {
  isOpen: boolean;
  onClose: () => void;
  roomId: number | null;
  rooms: RoomType[];
  boardTypes: BoardType[];
}

interface EditModeState {
    startDate: string;
    endDate: string;
    jalaliLabel: string; 
    price: number;
    extra_price: number;
    child_price: number;
    stock: number;
    isRange: boolean;
}

interface ContextMenuState {
    x: number;
    y: number;
    data: PricingCalendarData | undefined;
    date: DateObject;
}

type FilterType = 'none' | 'no-rate' | 'active' | 'sold-out' | 'holiday' | 'selected';

const WEEK_DAYS = ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنج‌شنبه', 'جمعه'];

export const CalendarDrawer = ({ isOpen, onClose, roomId, rooms, boardTypes }: Props) => {
  const [data, setData] = useState<PricingCalendarData[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedBoardId, setSelectedBoardId] = useState<number | null>(null);
  
  const [activeFilter, setActiveFilter] = useState<FilterType>('none');
  const [currentDate, setCurrentDate] = useState(new DateObject({ calendar: persian, locale: persian_fa }));
  const today = useMemo(() => new DateObject({ calendar: persian, locale: persian_fa }), []);

  const [editState, setEditState] = useState<EditModeState | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  
  // انتخاب بازه
  const [selectionStart, setSelectionStart] = useState<DateObject | null>(null);
  const [selectionEnd, setSelectionEnd] = useState<DateObject | null>(null);

  const [clipboard, setClipboard] = useState<PricingCalendarData | null>(null);
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);
  const contextMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (boardTypes.length > 0 && !selectedBoardId) {
        setSelectedBoardId(boardTypes[0].id);
    }
  }, [boardTypes]);

  useEffect(() => {
      const handleClick = (e: MouseEvent) => {
          if (contextMenuRef.current && !contextMenuRef.current.contains(e.target as Node)) {
              setContextMenu(null);
          }
      };
      document.addEventListener('click', handleClick);
      return () => document.removeEventListener('click', handleClick);
  }, []);

  // محاسبه روزهای تقویم
  const calendarDays = useMemo(() => {
      const startOfMonth = new DateObject(currentDate).toFirstOfMonth();
      const endOfMonth = new DateObject(currentDate).toLastOfMonth();
      const days = [];
      let loop = new DateObject(startOfMonth);
      while (loop.toUnix() <= endOfMonth.toUnix()) {
          days.push(new DateObject(loop));
          loop.add(1, 'day');
      }
      return days;
  }, [currentDate]);

  // --- منطق تعطیلات (جمعه + مناسبت‌های ثابت) ---
  const getHolidayInfo = (date: DateObject) => {
      // 1. جمعه
      if (date.weekDay.index === 6) return { isHoliday: true, name: "جمعه" };
      
      // 2. مناسبت شمسی
      const monthDay = date.format("MM-DD"); // مثلا 01-01
      if (SOLAR_HOLIDAYS[monthDay]) {
          return { isHoliday: true, name: SOLAR_HOLIDAYS[monthDay] };
      }

      return { isHoliday: false, name: "" };
  };

  const getDayData = (date: DateObject) => {
      const dateGregorian = new DateObject(date).convert(gregorian, gregorian_en).format("YYYY-MM-DD");
      return data.find(d => d.date === dateGregorian);
  };

  const addCommas = (num: number) => num?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") || "0";

  const fetchCalendarData = async () => {
    if (!roomId || !selectedBoardId) return;
    setLoading(true);
    try {
        const startOfMonth = new DateObject(currentDate).toFirstOfMonth();
        const endOfMonth = new DateObject(currentDate).toLastOfMonth();
        const startGregorian = new DateObject(startOfMonth).convert(gregorian, gregorian_en).format("YYYY-MM-DD");
        const endGregorian = new DateObject(endOfMonth).convert(gregorian, gregorian_en).format("YYYY-MM-DD");

        const result = await pricingService.getCalendarRange(roomId, startGregorian, endGregorian, selectedBoardId);
        setData(result);
    } catch (error) {
        console.error(error);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && roomId) fetchCalendarData();
  }, [isOpen, roomId, selectedBoardId, currentDate.month.number]);

  // --- هندل کلیک و انتخاب گروهی ---
  const handleDayClick = (date: DateObject, e: React.MouseEvent, isPast: boolean) => {
      if (contextMenu) setContextMenu(null);

      // منطق انتخاب گروهی با Shift یا Ctrl+Shift
      if (e.shiftKey && selectionStart) {
          // حذف انتخاب متن مرورگر
          window.getSelection()?.removeAllRanges();
          
          // مرتب‌سازی تاریخ‌ها (اگر کاربر برعکس انتخاب کرد)
          const start = selectionStart.toUnix() < date.toUnix() ? selectionStart : date;
          const end = selectionStart.toUnix() < date.toUnix() ? date : selectionStart;
          
          setSelectionStart(start);
          setSelectionEnd(end);
          return;
      }

      // شروع انتخاب جدید
      setSelectionStart(date);
      setSelectionEnd(null);
      
      if (isPast) return; // روز گذشته ویرایش تکی ندارد

      // باز کردن مودال برای تک روز
      const dayData = getDayData(date);
      const dateGregorian = new DateObject(date).convert(gregorian, gregorian_en).format("YYYY-MM-DD");
      
      setEditState({
          startDate: dateGregorian,
          endDate: dateGregorian,
          jalaliLabel: date.format("YYYY/MM/DD"),
          price: dayData?.price ?? 0,
          extra_price: dayData?.extra_price ?? 0,
          child_price: dayData?.child_price ?? 0,
          stock: dayData?.stock ?? 0,
          isRange: false
      });
  };

  const handleRightClick = (e: React.MouseEvent, date: DateObject) => {
      e.preventDefault();
      const dayData = getDayData(date);
      setContextMenu({
          x: e.clientX,
          y: e.clientY,
          data: dayData,
          date: date
      });
  };

  const handleRangeEdit = () => {
      if (!selectionStart || !selectionEnd) return;
      const startData = getDayData(selectionStart); // مقادیر پیش‌فرض از روز شروع
      setEditState({
          startDate: new DateObject(selectionStart).convert(gregorian, gregorian_en).format("YYYY-MM-DD"),
          endDate: new DateObject(selectionEnd).convert(gregorian, gregorian_en).format("YYYY-MM-DD"),
          jalaliLabel: `${selectionStart.format("D MMMM")} تا ${selectionEnd.format("D MMMM")}`,
          price: startData?.price ?? 0,
          extra_price: startData?.extra_price ?? 0,
          child_price: startData?.child_price ?? 0,
          stock: startData?.stock ?? 0,
          isRange: true
      });
  };

  const handleCopy = () => {
      if (contextMenu?.data) {
          setClipboard(contextMenu.data);
          setContextMenu(null);
      }
  };

  const handlePaste = async () => {
      if (!clipboard || !contextMenu?.date || !roomId || !selectedBoardId) return;
      const targetDate = contextMenu.date;
      const dateGregorian = new DateObject(targetDate).convert(gregorian, gregorian_en).format("YYYY-MM-DD");
      try {
          setLoading(true);
          await Promise.all([
              updateStock({ room: roomId, start_date: dateGregorian, end_date: dateGregorian, quantity: clipboard.stock }),
              updatePrice({ 
                  room: roomId, start_date: dateGregorian, end_date: dateGregorian, board_type: selectedBoardId,
                  price: clipboard.price!, extra_price: clipboard.extra_price!, child_price: clipboard.child_price!
              })
          ]);
          await fetchCalendarData();
      } catch (e) { console.error(e); } 
      finally { setLoading(false); setContextMenu(null); }
  };

  const handleSaveChanges = async () => {
      if (!editState || !roomId || !selectedBoardId) return;
      setEditLoading(true);
      try {
          await updateStock({
              room: roomId, start_date: editState.startDate, end_date: editState.endDate, quantity: Number(editState.stock)
          });
          if (editState.price > 0) {
              await updatePrice({
                  room: roomId, start_date: editState.startDate, end_date: editState.endDate, board_type: selectedBoardId,
                  price: Number(editState.price), extra_price: Number(editState.extra_price), child_price: Number(editState.child_price)
              });
          }
          setEditState(null);
          setSelectionStart(null);
          setSelectionEnd(null);
          await fetchCalendarData();
      } catch (error) { alert("خطا در ذخیره تغییرات"); } 
      finally { setEditLoading(false); }
  };

  const InputField = ({ label, value, onChange, icon: Icon, color }: any) => (
      <div className="relative">
          <label className="block text-xs font-bold text-gray-500 mb-1">{label}</label>
          <div className="relative group">
              <input 
                  type="text" 
                  value={addCommas(value)}
                  onChange={e => {
                      const val = Number(e.target.value.replace(/,/g, ''));
                      if (!isNaN(val)) onChange(val);
                  }}
                  className={`w-full p-3 pl-10 rounded-xl border border-gray-200 focus:border-${color}-500 outline-none font-bold text-center text-gray-800 transition-all focus:ring-2 focus:ring-${color}-100 text-lg`}
              />
              {Icon && <Icon size={18} className={`absolute left-3 top-3.5 text-${color}-500 group-hover:scale-110 transition-transform`} />}
          </div>
      </div>
  );

  return (
    <>
      <div className={`fixed inset-0 bg-slate-900/50 z-40 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={onClose} />
      
      <div className={`fixed top-0 left-0 h-full w-full bg-gray-50 z-50 shadow-2xl transform transition-transform duration-300 ease-out flex flex-col ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
            
            {/* Header */}
            <div className="px-6 py-4 bg-white border-b border-gray-200 flex flex-col md:flex-row items-center justify-between gap-4 z-10 shadow-sm shrink-0">
                <div className="flex items-center gap-4">
                    <div className="bg-blue-600 p-2.5 rounded-xl text-white shadow-lg shadow-blue-200"><BarChart3 size={24} /></div>
                    <div>
                        <h3 className="font-extrabold text-xl text-gray-800">تقویم نرخ‌گذاری</h3>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-gray-500 font-bold">اتاق فعال:</span>
                            <span className="text-xs text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded border border-blue-100">{rooms.find(r => r.id === roomId)?.name || '...'}</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4 bg-gray-50 p-1.5 rounded-xl border border-gray-200">
                    <button onClick={() => setCurrentDate(new DateObject(currentDate).add(-1, 'month'))} className="p-2 hover:bg-white hover:shadow-sm rounded-lg text-gray-600"><ChevronRight size={20}/></button>
                    <span className="font-extrabold text-lg w-32 text-center text-gray-800 select-none">{currentDate.format("MMMM YYYY")}</span>
                    <button onClick={() => setCurrentDate(new DateObject(currentDate).add(1, 'month'))} className="p-2 hover:bg-white hover:shadow-sm rounded-lg text-gray-600"><ChevronLeft size={20}/></button>
                </div>

                <div className="flex items-center gap-3">
                    {selectionStart && selectionEnd && (
                        <button onClick={handleRangeEdit} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl font-bold text-sm shadow-md animate-in fade-in slide-in-from-top-2">
                            <Edit size={16} /> ویرایش گروهی ({Math.round((selectionEnd.toUnix() - selectionStart.toUnix()) / 86400) + 1} روز)
                        </button>
                    )}

                    <div className="flex items-center bg-white px-3 py-2 rounded-xl border border-gray-200 shadow-sm hover:border-blue-300">
                         <Filter size={16} className="text-gray-400 ml-2" />
                         <select value={selectedBoardId || ''} onChange={(e) => setSelectedBoardId(Number(e.target.value))} className="bg-transparent text-sm font-bold text-gray-700 outline-none min-w-[140px]" disabled={loading}>
                            {boardTypes.map(bt => <option key={bt.id} value={bt.id}>{bt.name}</option>)}
                         </select>
                    </div>
                    <button onClick={fetchCalendarData} disabled={loading} className="p-3 bg-white hover:bg-blue-50 text-gray-600 rounded-xl border border-gray-200 shadow-sm"><RefreshCw size={20} className={loading ? "animate-spin" : ""} /></button>
                    <button onClick={onClose} className="p-3 bg-white hover:bg-red-50 text-gray-400 rounded-xl border border-gray-200 shadow-sm"><X size={20} /></button>
                </div>
            </div>

            {/* Calendar Body */}
            <div className="flex-1 p-4 overflow-y-auto bg-gray-100/50">
                <div className="overflow-x-auto pb-4">
                    <div className="min-w-[1100px] bg-white p-6 rounded-3xl border border-gray-200 shadow-sm select-none">
                        
                        <div className="grid grid-cols-7 gap-3 mb-3">
                            {WEEK_DAYS.map((day, idx) => (
                                <div key={idx} className={`text-center font-extrabold py-2 rounded-lg text-sm ${idx === 6 ? 'bg-red-50 text-red-500' : 'bg-gray-50 text-gray-500'}`}>{day}</div>
                            ))}
                        </div>

                        <div className="grid grid-cols-7 gap-2">
                            {Array.from({ length: calendarDays.length > 0 ? calendarDays[0].weekDay.index : 0 }).map((_, i) => (
                                <div key={`empty-${i}`} className="h-[110px] bg-gray-50/30 rounded-2xl border border-dashed border-gray-100"></div>
                            ))}

                            {calendarDays.map((date, index) => {
                                const dayData = getDayData(date);
                                const hasStock = (dayData?.stock ?? 0) > 0;
                                const hasPrice = (dayData?.price ?? 0) > 0;
                                const isSoldOut = hasPrice && !hasStock;
                                
                                const holidayInfo = getHolidayInfo(date);
                                const isHolidayDay = holidayInfo.isHoliday;
                                
                                const isPast = date.toUnix() < today.toUnix();
                                const isToday = date.format("YYYYMMDD") === today.format("YYYYMMDD");
                                
                                const isSelected = selectionStart && selectionEnd && 
                                    date.toUnix() >= selectionStart.toUnix() && 
                                    date.toUnix() <= selectionEnd.toUnix();

                                // --- FILTER LOGIC ---
                                let isDimmed = false;
                                if (activeFilter !== 'none') {
                                    if (activeFilter === 'no-rate' && hasPrice) isDimmed = true;
                                    if (activeFilter === 'active' && (!hasPrice || isSoldOut)) isDimmed = true;
                                    if (activeFilter === 'sold-out' && !isSoldOut) isDimmed = true;
                                    if (activeFilter === 'holiday' && !isHolidayDay) isDimmed = true;
                                    if (activeFilter === 'selected' && !isSelected) isDimmed = true;
                                }

                                return (
                                    <div 
                                        key={index}
                                        onClick={(e) => handleDayClick(date, e, isPast)}
                                        onContextMenu={(e) => handleRightClick(e, date)}
                                        className={`
                                            h-[110px] relative rounded-2xl border transition-all flex flex-col p-1.5 overflow-hidden group
                                            ${isDimmed ? 'opacity-20 grayscale scale-95 pointer-events-none' : ''}
                                            ${isSelected ? 'ring-2 ring-indigo-500 ring-offset-1 bg-indigo-50' : ''}
                                            ${isPast 
                                                ? 'bg-gray-50 border-gray-100 opacity-60 grayscale' 
                                                : isSoldOut 
                                                    ? 'bg-red-50/50 border-red-200 hover:shadow-md'
                                                    : dayData 
                                                        ? 'bg-white border-gray-200 hover:border-blue-400 hover:shadow-lg hover:-translate-y-0.5 hover:z-10' 
                                                        : 'bg-gray-50/30 border-gray-100 hover:bg-white'
                                            }
                                            ${isToday ? 'ring-2 ring-blue-500 ring-offset-2' : ''}
                                            ${isHolidayDay && !isPast && !isSoldOut && !isSelected && !dayData ? 'bg-orange-50/30 border-orange-100' : ''}
                                        `}
                                    >
                                        <div className="flex justify-between items-start mb-1">
                                            <div className="flex flex-col">
                                                <span className={`text-lg font-black leading-none ${isHolidayDay ? 'text-red-500' : (isToday ? 'text-blue-600' : 'text-gray-700')}`}>
                                                    {date.format("D")}
                                                </span>
                                                {/* نام مناسبت (اگر بود) */}
                                                {holidayInfo.name && holidayInfo.name !== "جمعه" && (
                                                    <span className="text-[8px] text-red-500 font-bold mt-0.5 truncate max-w-[50px]">
                                                        {holidayInfo.name}
                                                    </span>
                                                )}
                                            </div>
                                            
                                            {dayData && (
                                                isSoldOut ? 
                                                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1 bg-red-100 text-red-600"><AlertCircle size={10} /> بسته</span> :
                                                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-1 bg-blue-100 text-blue-700"><Package size={10} /> {dayData.stock}</span>
                                            )}
                                        </div>

                                        <div className="flex-1 flex flex-col justify-end gap-1">
                                            {hasPrice ? (
                                                <>
                                                    <div className={`flex justify-between items-center px-1.5 py-0.5 rounded-lg border shadow-sm ${isSoldOut ? 'bg-red-50 border-red-100 text-red-800' : 'bg-green-50 text-green-800 border-green-200'}`}>
                                                        <span className="text-[9px] opacity-70 font-bold">پایه</span>
                                                        <span className="text-xs font-extrabold">{addCommas(dayData?.price!)}</span>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-1">
                                                        <div className={`flex flex-col items-center border rounded-lg py-0.5 ${isPast ? 'bg-gray-100 text-gray-400' : 'bg-gray-50 text-gray-600'} border-gray-200`}>
                                                            <span className="text-[8px] opacity-60 font-bold">اضافه</span>
                                                            <span className="text-[9px] font-bold">{addCommas(dayData?.extra_price ?? 0)}</span>
                                                        </div>
                                                        <div className={`flex flex-col items-center border rounded-lg py-0.5 ${isPast ? 'bg-gray-100 text-gray-400 border-gray-200' : 'bg-orange-50 text-orange-600 border-orange-100'}`}>
                                                            <span className="text-[8px] opacity-60 font-bold">کودک</span>
                                                            <span className="text-[9px] font-bold">{addCommas(dayData?.child_price ?? 0)}</span>
                                                        </div>
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="flex-1 flex items-center justify-center opacity-20 text-2xl font-black text-gray-300">-</div>
                                            )}
                                        </div>

                                        {!isPast && (
                                            <div className="absolute inset-0 bg-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                                                <div className="bg-white p-1.5 rounded-full shadow-md text-blue-600 transform scale-0 group-hover:scale-100 transition-transform duration-200">
                                                    <Edit size={16} />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* --- FILTERS & LEGEND --- */}
            <div className="bg-white border-t border-gray-200 p-3 flex flex-wrap justify-center gap-4 text-xs font-bold text-gray-600 select-none">
                <div className="flex items-center gap-2 text-gray-400">
                    <FilterX size={14} /> فیلتر:
                </div>

                <button onClick={() => setActiveFilter(activeFilter === 'no-rate' ? 'none' : 'no-rate')} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all ${activeFilter === 'no-rate' ? 'bg-gray-800 text-white shadow-md scale-105' : 'bg-white hover:bg-gray-50'}`}>
                    <span className="w-2.5 h-2.5 rounded bg-gray-200 border border-gray-400"></span> آزاد / بدون نرخ
                </button>
                <button onClick={() => setActiveFilter(activeFilter === 'active' ? 'none' : 'active')} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all ${activeFilter === 'active' ? 'bg-green-600 text-white shadow-md scale-105' : 'bg-white hover:bg-green-50'}`}>
                    <span className="w-2.5 h-2.5 rounded bg-green-100 border border-green-400"></span> دارای نرخ فعال
                </button>
                <button onClick={() => setActiveFilter(activeFilter === 'sold-out' ? 'none' : 'sold-out')} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all ${activeFilter === 'sold-out' ? 'bg-red-600 text-white shadow-md scale-105' : 'bg-white hover:bg-red-50'}`}>
                    <span className="w-2.5 h-2.5 rounded bg-red-100 border border-red-400"></span> تکمیل ظرفیت
                </button>
                <button onClick={() => setActiveFilter(activeFilter === 'selected' ? 'none' : 'selected')} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all ${activeFilter === 'selected' ? 'bg-indigo-600 text-white shadow-md scale-105' : 'bg-white hover:bg-indigo-50'}`}>
                    <span className="w-2.5 h-2.5 rounded bg-indigo-100 border border-indigo-400"></span> انتخاب شده
                </button>
                <button onClick={() => setActiveFilter(activeFilter === 'holiday' ? 'none' : 'holiday')} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all ${activeFilter === 'holiday' ? 'bg-orange-500 text-white shadow-md scale-105' : 'bg-white hover:bg-orange-50'}`}>
                    <CalendarDays size={14} /> روزهای تعطیل
                </button>

                <div className="ml-4 pl-4 border-r border-gray-200 text-gray-400 font-normal flex items-center gap-2">
                    <span className="font-mono bg-gray-100 px-1 rounded border">Shift + Click</span> انتخاب گروهی
                </div>
            </div>

            {/* --- CONTEXT MENU --- */}
            {contextMenu && (
                <div 
                    ref={contextMenuRef}
                    className="fixed z-[70] bg-white rounded-xl shadow-2xl border border-gray-100 p-1.5 w-48 animate-in fade-in zoom-in-95 duration-100"
                    style={{ top: contextMenu.y, left: contextMenu.x }}
                >
                    <div className="px-3 py-2 text-xs font-bold text-gray-400 border-b border-gray-100 mb-1">
                        {contextMenu.date.format("D MMMM YYYY")}
                    </div>
                    <button onClick={handleCopy} disabled={!contextMenu.data?.price} className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg hover:bg-blue-50 text-gray-700 hover:text-blue-600 text-sm font-medium transition-colors disabled:opacity-50">
                        <Copy size={16} /> کپی نرخ‌ها
                    </button>
                    <button onClick={handlePaste} disabled={!clipboard} className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg hover:bg-green-50 text-gray-700 hover:text-green-600 text-sm font-medium transition-colors disabled:opacity-50">
                        <CheckSquare size={16} /> پیست نرخ ({clipboard ? addCommas(clipboard.price!) : '-'})
                    </button>
                </div>
            )}

            {/* --- EDIT MODAL --- */}
            {editState && (
                <div className="absolute inset-0 z-[60] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 border border-white/20">
                        <div className={`px-6 py-5 border-b border-gray-100 flex justify-between items-center ${editState.isRange ? 'bg-indigo-50' : 'bg-gray-50'}`}>
                            <div>
                                <h4 className="font-extrabold text-xl text-gray-800">{editState.isRange ? 'ویرایش گروهی نرخ' : 'ویرایش نرخ'}</h4>
                                <span className={`text-sm font-bold font-vazir mt-1 block ${editState.isRange ? 'text-indigo-600' : 'text-blue-600'}`}>
                                    {editState.jalaliLabel}
                                </span>
                            </div>
                            <button onClick={() => { setEditState(null); setSelectionStart(null); setSelectionEnd(null); }} className="bg-white p-2 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all shadow-sm border border-gray-100"><X size={20}/></button>
                        </div>
                        
                        <div className="p-6 space-y-6">
                            <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100">
                                <InputField label="موجودی اتاق (عدد)" value={editState.stock} icon={Package} color="blue"
                                    onChange={(val: number) => setEditState({...editState, stock: val})} 
                                />
                            </div>
                            <div className="relative py-2">
                                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
                                <div className="relative flex justify-center"><span className="bg-white px-3 text-xs font-bold text-gray-400">قیمت‌گذاری (تومان)</span></div>
                            </div>
                            <InputField label="قیمت پایه" value={editState.price} icon={Coins} color="green"
                                onChange={(val: number) => setEditState({...editState, price: val})} 
                            />
                            <div className="grid grid-cols-2 gap-5">
                                <InputField label="نفر اضافه" value={editState.extra_price} icon={Users} color="gray"
                                    onChange={(val: number) => setEditState({...editState, extra_price: val})} 
                                />
                                <InputField label="کودک" value={editState.child_price} icon={Baby} color="orange"
                                    onChange={(val: number) => setEditState({...editState, child_price: val})} 
                                />
                            </div>
                        </div>

                        <div className="p-5 bg-gray-50 border-t border-gray-100 flex gap-3">
                            <button onClick={handleSaveChanges} disabled={editLoading} className={`flex-1 text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95 disabled:opacity-70 ${editState.isRange ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200'}`}>
                                {editLoading ? <RefreshCw className="animate-spin" size={24}/> : <><SaveIcon size={24}/> ذخیره</>}
                            </button>
                            <button onClick={() => setEditState(null)} className="flex-1 bg-white hover:bg-gray-100 text-gray-700 py-4 rounded-xl font-bold text-lg border border-gray-200 transition-all active:scale-95">انصراف</button>
                        </div>
                    </div>
                </div>
            )}
      </div>
    </>
  );
};
