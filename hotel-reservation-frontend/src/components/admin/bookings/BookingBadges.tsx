import { CheckCircle, Clock, UserCheck, XCircle, Building2, User } from 'lucide-react';
import { BookingStatus, PaymentStatus, BookingSource } from './types';

export const StatusBadge = ({ status }: { status: BookingStatus }) => {
    switch(status) {
        case 'CONFIRMED': return <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-md text-xs font-bold flex items-center gap-1 w-fit"><CheckCircle size={12}/> قطعی</span>;
        case 'PENDING': return <span className="bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-md text-xs font-bold flex items-center gap-1 w-fit"><Clock size={12}/> در انتظار</span>;
        case 'CHECKED_IN': return <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-md text-xs font-bold flex items-center gap-1 w-fit"><UserCheck size={12}/> مقیم</span>;
        case 'CANCELLED': return <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded-md text-xs font-bold flex items-center gap-1 w-fit"><XCircle size={12}/> لغو شده</span>;
        default: return null;
    }
};

export const PaymentBadge = ({ status }: { status: PaymentStatus }) => {
    switch(status) {
        case 'PAID': return <span className="text-green-600 bg-green-50 border border-green-200 px-2 py-0.5 rounded text-[10px] font-bold w-fit">تسویه شده</span>;
        case 'PARTIAL': return <span className="text-blue-600 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded text-[10px] font-bold w-fit">بیعانه</span>;
        case 'PENDING_APPROVAL': return <span className="text-orange-600 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded text-[10px] font-bold w-fit animate-pulse">در انتظار تایید</span>;
        case 'UNPAID': return <span className="text-red-500 bg-red-50 border border-red-200 px-2 py-0.5 rounded text-[10px] font-bold w-fit">پرداخت نشده</span>;
        default: return null;
    }
};

export const SourceIcon = ({ source }: { source: BookingSource }) => {
    switch(source) {
        case 'AGENCY': return <span className="text-purple-600 bg-purple-50 p-1 rounded" title="رزرو آژانس"><Building2 size={14}/></span>;
        case 'MEMBER': return <span className="text-blue-600 bg-blue-50 p-1 rounded" title="کاربر عضو"><UserCheck size={14}/></span>;
        case 'GUEST': return <span className="text-gray-500 bg-gray-100 p-1 rounded" title="میهمان آزاد"><User size={14}/></span>;
        default: return null;
    }
};
