import { MoreVertical } from 'lucide-react';
import { Booking } from './types';
import { StatusBadge, PaymentBadge, SourceIcon } from './BookingBadges';

interface Props {
    bookings: Booking[];
    onSelect: (booking: Booking) => void;
}

export const BookingTable = ({ bookings, onSelect }: Props) => {
    const addCommas = (num: number) => num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

    return (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full text-right">
                <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                        <th className="px-6 py-4 text-xs font-bold text-gray-500">شناسه</th>
                        <th className="px-6 py-4 text-xs font-bold text-gray-500">میهمان / منبع</th>
                        <th className="px-6 py-4 text-xs font-bold text-gray-500">اتاق / تاریخ</th>
                        <th className="px-6 py-4 text-xs font-bold text-gray-500">وضعیت</th>
                        <th className="px-6 py-4 text-xs font-bold text-gray-500">مالی</th>
                        <th className="px-6 py-4 text-xs font-bold text-gray-500">مبلغ کل (تومان)</th>
                        <th className="px-6 py-4 text-xs font-bold text-gray-500 text-left">عملیات</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                    {bookings.map((booking) => (
                        <tr 
                            key={booking.id} 
                            onClick={() => onSelect(booking)}
                            className={`group hover:bg-blue-50/40 transition-colors cursor-pointer ${booking.paymentStatus === 'PENDING_APPROVAL' ? 'bg-orange-50/30' : ''}`}
                        >
                            <td className="px-6 py-4">
                                <span className="font-mono font-bold text-gray-700 bg-gray-100 px-2 py-1 rounded text-xs select-all">{booking.id}</span>
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-bold">
                                        {booking.guest.fullName.charAt(0)}
                                    </div>
                                    <div>
                                        <div className="font-bold text-gray-800 text-sm flex items-center gap-2">
                                            {booking.guest.fullName}
                                            <SourceIcon source={booking.source} />
                                        </div>
                                        <div className="text-xs text-gray-400 mt-0.5 font-mono">{booking.guest.phone}</div>
                                        {booking.source === 'AGENCY' && <div className="text-[10px] text-purple-600 font-bold mt-0.5">{booking.agencyName}</div>}
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <div className="text-sm font-bold text-gray-700">{booking.roomName}</div>
                                <div className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                                    <span>{booking.nights} شب</span> | <span className="font-mono text-gray-500">{booking.checkIn}</span>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <StatusBadge status={booking.status} />
                            </td>
                            <td className="px-6 py-4">
                                <PaymentBadge status={booking.paymentStatus} />
                            </td>
                            <td className="px-6 py-4">
                                <div className="font-extrabold text-gray-800">{addCommas(booking.totalPrice)}</div>
                                {booking.paidAmount < booking.totalPrice && (
                                    <div className="text-[10px] text-red-500 mt-0.5">مانده: {addCommas(booking.totalPrice - booking.paidAmount)}</div>
                                )}
                            </td>
                            <td className="px-6 py-4 text-left">
                                <button className="p-2 hover:bg-white rounded-lg text-gray-400 hover:text-blue-600 transition-all border border-transparent hover:border-gray-200 hover:shadow-sm">
                                    <MoreVertical size={16} />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {bookings.length === 0 && (
                <div className="p-10 text-center text-gray-400"><p>موردی یافت نشد.</p></div>
            )}
        </div>
    );
};
