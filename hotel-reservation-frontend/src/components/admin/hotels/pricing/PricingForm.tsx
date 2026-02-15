// FILE: src/components/admin/hotels/pricing/PricingForm.tsx
import { Package } from 'lucide-react';
import { BoardType } from '@/types/hotel'; // فرض بر وجود این تایپ در پروژه

interface Props {
  activeTab: 'inventory' | 'pricing';
  
  // Inventory State
  quantity: string;
  setQuantity: (v: string) => void;
  
  // Pricing State
  price: string; setPrice: (v: string) => void;
  extraPrice: string; setExtraPrice: (v: string) => void;
  childPrice: string; setChildPrice: (v: string) => void;
  
  // Board State
  boardType: number; 
  setBoardType: (v: number) => void;
  boardTypes: BoardType[]; // لیست بردها از والد پاس داده می‌شود
}

export const PricingForm = ({ 
    activeTab, 
    quantity, setQuantity, 
    price, setPrice, 
    extraPrice, setExtraPrice, 
    childPrice, setChildPrice, 
    boardType, setBoardType,
    boardTypes 
}: Props) => {

  // Helper: اضافه کردن کاما برای نمایش
  const formatNumber = (num: string | number) => {
    if (!num) return '';
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  // Helper: حذف کاما برای ذخیره در State
  const handleNumberChange = (val: string, setter: (v: string) => void) => {
    const raw = val.replace(/,/g, '');
    if (raw === '' || /^\d+$/.test(raw)) {
      setter(raw);
    }
  };

  return (
    <section className={`p-5 rounded-2xl border shadow-sm transition-all duration-300 ${
        activeTab === 'inventory' 
          ? 'bg-blue-50/50 border-blue-200' 
          : 'bg-green-50/50 border-green-200'
    }`}>
        <h3 className="text-gray-800 font-bold mb-6 flex items-center gap-2 border-b border-gray-200/50 pb-3">
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs text-white shadow-sm ${
                activeTab === 'inventory' ? 'bg-blue-500' : 'bg-green-500'
            }`}>
                {activeTab === 'inventory' ? 'A' : 'B'}
            </span>
            {activeTab === 'inventory' ? 'تنظیمات موجودی (Inventory)' : 'تنظیمات قیمت (Pricing)'}
        </h3>

        {activeTab === 'inventory' ? (
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6 animate-in fade-in slide-in-from-bottom-2">
                <div className="w-full md:w-1/2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        تعداد موجودی قابل فروش
                    </label>
                    <div className="relative group">
                        <input 
                            type="text" 
                            required 
                            value={quantity} 
                            onChange={e => handleNumberChange(e.target.value, setQuantity)}
                            className="w-full p-4 pl-12 rounded-xl border border-blue-200 text-center text-2xl font-bold text-blue-700 outline-none bg-white focus:ring-4 focus:ring-blue-100 transition-all shadow-sm"
                            placeholder="0"
                        />
                         <Package className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-300 group-focus-within:text-blue-500 transition-colors" size={24} />
                    </div>
                </div>
                <div className="flex-1 text-sm text-gray-500 bg-white/80 p-4 rounded-xl border border-blue-100 shadow-sm leading-relaxed">
                    <strong className="text-blue-700 block mb-1">نکته مهم:</strong>
                    موجودی وارد شده به صورت <strong>شناور</strong> اعمال می‌شود. تغییر این عدد بر روی تمام پلن‌های قیمتی (صبحانه، هاف‌برد و...) تاثیر می‌گذارد.
                </div>
            </div>
        ) : (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                {/* Board Type Selector */}
                <div>
                    <label className="block text-xs font-bold text-gray-500 mb-3 uppercase tracking-wide">
                        انتخاب نوع سرویس (Board Type)
                    </label>
                    <div className="flex flex-wrap gap-2">
                        {boardTypes.map(b => (
                            <button
                                key={b.id} 
                                type="button" 
                                onClick={() => setBoardType(b.id)}
                                className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all border-2 ${
                                    boardType === b.id 
                                        ? 'border-green-500 bg-green-500 text-white shadow-md transform scale-105' 
                                        : 'border-gray-200 bg-white text-gray-600 hover:border-green-200 hover:bg-green-50'
                                }`}
                            >
                                {b.name}
                            </button>
                        ))}
                    </div>
                    {boardType === 0 && (
                        <p className="text-red-500 text-xs mt-2 font-medium">لطفا یک نوع سرویس را انتخاب کنید.</p>
                    )}
                </div>

                {/* Price Inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    {[
                        { label: 'قیمت پایه (هر شب)', val: price, set: setPrice, required: true },
                        { label: 'قیمت نفر اضافه', val: extraPrice, set: setExtraPrice, required: false },
                        { label: 'قیمت کودک', val: childPrice, set: setChildPrice, required: false },
                    ].map((field, idx) => (
                        <div key={idx} className="relative">
                            <label className="block text-xs font-bold text-gray-500 mb-2">
                                {field.label} <span className="text-gray-300 font-normal">(تومان)</span>
                            </label>
                            <input 
                                type="text" 
                                value={formatNumber(field.val)} 
                                onChange={e => handleNumberChange(e.target.value, field.set)}
                                className={`w-full p-3 rounded-lg border outline-none ltr text-center font-bold text-lg focus:ring-4 transition-all ${
                                    field.required && !field.val 
                                        ? 'border-red-200 bg-red-50 focus:border-red-500 focus:ring-red-100' 
                                        : 'border-gray-300 bg-white focus:border-green-500 focus:ring-green-100'
                                }`} 
                                placeholder="0"
                            />
                        </div>
                    ))}
                </div>
            </div>
        )}
    </section>
  );
};
