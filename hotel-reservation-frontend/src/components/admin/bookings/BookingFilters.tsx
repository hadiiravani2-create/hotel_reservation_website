import { Search, Building2, UserCheck, User } from 'lucide-react';
import { BookingSource } from './types';

interface Props {
    selectedSource: BookingSource | 'ALL';
    onSourceChange: (source: BookingSource | 'ALL') => void;
    searchQuery: string;
    onSearchChange: (query: string) => void;
}

export const BookingFilters = ({ selectedSource, onSourceChange, searchQuery, onSearchChange }: Props) => {
    return (
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
            {/* Tabs */}
            <div className="flex bg-gray-100 p-1 rounded-xl">
                <FilterButton active={selectedSource === 'ALL'} onClick={() => onSourceChange('ALL')} label="همه" />
                <FilterButton active={selectedSource === 'AGENCY'} onClick={() => onSourceChange('AGENCY')} label="آژانس" icon={Building2} color="text-purple-700" />
                <FilterButton active={selectedSource === 'MEMBER'} onClick={() => onSourceChange('MEMBER')} label="اعضا" icon={UserCheck} color="text-blue-700" />
                <FilterButton active={selectedSource === 'GUEST'} onClick={() => onSourceChange('GUEST')} label="میهمان" icon={User} color="text-gray-800" />
            </div>

            {/* Search */}
            <div className="relative w-full md:w-80">
                <Search className="absolute right-3 top-3 text-gray-400" size={18} />
                <input 
                    type="text" 
                    placeholder="جستجو (نام، موبایل، شماره رزرو)..." 
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="w-full pl-4 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white transition-all text-sm font-medium"
                />
            </div>
        </div>
    );
};

const FilterButton = ({ active, onClick, label, icon: Icon, color }: any) => (
    <button 
        onClick={onClick} 
        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${active ? `bg-white shadow ${color || 'text-gray-800'}` : 'text-gray-500 hover:text-gray-700'}`}
    >
        {Icon && <Icon size={14}/>} {label}
    </button>
);
