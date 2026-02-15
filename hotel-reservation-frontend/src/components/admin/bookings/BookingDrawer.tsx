import { XCircle, Phone, FileText, CreditCard, UserCheck, CheckCircle, ShieldAlert } from 'lucide-react';
import { Booking } from './types';
import { StatusBadge } from './BookingBadges';

interface Props {
    booking: Booking | null;
    onClose: () => void;
}

export const BookingDrawer = ({ booking, onClose }: Props) => {
    if (!booking) return null;

    const addCommas = (num: number) => num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

    return (
        <>
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 transition-opacity" onClick={onClose} />
            <div className="fixed top-0 left-0 h-full w-full md:w-[480px] bg-white z-50 shadow-2xl flex flex-col animate-in slide-in-from-left duration-300">
                
                {/* Header */}
                <div className="bg-gray-50 px-6 py-5 border-b border-gray-100 flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <h2 className="text-lg font-black text-gray-800">{booking.guest.fullName}</h2>
                            <StatusBadge status={booking.status} />
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                            <span className="font-mono bg-white px-1.5 py-0.5 border rounded">{booking.id}</span>
                            <span className="flex items-center gap-1"><Phone size={12}/> {booking.guest.phone}</span>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-red-500"><XCircle size={24}/></button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    
                    {/* Payment Alert */}
                    {booking.paymentStatus === 'PENDING_APPROVAL' && (
                        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex gap-3 items-start">
                            <ShieldAlert className="text-orange-500 shrink-0" size={20} />
                            <div className="flex-1">
                                <h4 className="font-bold text-orange-800 text-sm mb-1">تاییدیه پرداخت لازم است</h4>
                                <p className="text-xs text-orange-700 mb-3 leading-5">کاربر یک فیش بانکی برای این رزرو آپلود کرده است. لطفا بررسی و تایید کنید.</p>
                                <div className="flex gap-2">
                                    <button className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors">مشاهده و تایید</button>
                                    <button className="bg-white border border-orange-200 text-orange-700 hover:bg-orange-100 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors">رد پرداخت</button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Info Card */}
                    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4">
                        <h3 className="font-bold text-gray-800 text-sm mb-4 border-b border-gray-50 pb-2 flex items-center gap-2">
                            <FileText size={16} className="text-blue-500"/> اطلاعات اقامت
                        </h3>
                        <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-sm">
                            <div><span className="text-gray-400 text-xs block mb-1">اتاق</span><span className="font-bold text-gray-700">{booking.roomName}</span></div>
                            <div><span className="text-gray-400 text-xs block mb-1">مدت</span><span className="font-bold text-gray-700">{booking.nights} شب</span></div>
                            <div><span className="text-gray-400 text-xs block mb-1">ورود</span><span className="font-bold text-gray-700 font-mono">{booking.checkIn}</span><span className="text-[10px] text-green-600 block">ساعت ۱۴:۰۰</span></div>
                            <div><span className="text-gray-400 text-xs block mb-1">خروج</span><span className="font-bold text-gray-700 font-mono">{booking.checkOut}</span><span className="text-[10px] text-red-500 block">ساعت ۱۲:۰۰</span></div>
                        </div>
                    </div>

                    {/* Financial */}
                    <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4">
                        <h3 className="font-bold text-gray-800 text-sm mb-4 flex items-center gap-2"><CreditCard size={16} className="text-green-600"/> وضعیت مالی</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between text-sm"><span className="text-gray-500">مبلغ کل اقامت</span><span className="font-bold text-gray-800">{addCommas(booking.totalPrice)} <span className="text-[10px] text-gray-400">تومان</span></span></div>
                            <div className="flex justify-between text-sm"><span className="text-green-600">پرداخت شده</span><span className="font-bold text-green-600">{addCommas(booking.paidAmount)} <span className="text-[10px]">تومان</span></span></div>
                            <div className="border-t border-gray-200 pt-2 flex justify-between items-center"><span className="font-bold text-sm text-gray-800">مانده قابل پرداخت</span><span className="font-black text-lg text-red-500">{addCommas(booking.totalPrice - booking.paidAmount)}</span></div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-200 bg-gray-50 flex gap-3">
                    {booking.status === 'CONFIRMED' && (
                        <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-200"><UserCheck size={18} /> ثبت ورود (Check-in)</button>
                    )}
                    {booking.status === 'PENDING' && (
                        <button className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-green-200"><CheckCircle size={18} /> تایید نهایی رزرو</button>
                    )}
                    <button className="px-4 bg-white hover:bg-red-50 text-gray-500 hover:text-red-500 border border-gray-200 rounded-xl font-bold transition-colors">لغو</button>
                </div>
            </div>
        </>
    );
};
