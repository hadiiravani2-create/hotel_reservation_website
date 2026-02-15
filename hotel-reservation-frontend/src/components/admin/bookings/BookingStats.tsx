import { Calendar, Clock, UserCheck, Banknote } from 'lucide-react';

export const BookingStats = () => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <StatCard icon={Calendar} color="blue" title="ورودی‌های امروز" value="12" />
            <StatCard icon={Clock} color="orange" title="در انتظار تایید مالی" value="5" />
            <StatCard icon={UserCheck} color="green" title="مقیم در هتل" value="45" />
            <StatCard icon={Banknote} color="purple" title="فروش امروز" value="12,500" unit="م" />
        </div>
    );
};

const StatCard = ({ icon: Icon, color, title, value, unit }: any) => (
    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
        <div className={`bg-${color}-100 p-3 rounded-xl text-${color}-600`}><Icon size={24}/></div>
        <div>
            <p className="text-gray-500 text-xs font-bold">{title}</p>
            <h3 className="text-2xl font-black text-gray-800">{value} {unit && <span className="text-xs font-light">{unit}</span>}</h3>
        </div>
    </div>
);
