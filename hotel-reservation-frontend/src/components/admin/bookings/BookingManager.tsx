import { useState, useMemo } from 'react';
import { Booking, BookingSource } from './types';
import { BookingStats } from './BookingStats';
import { BookingFilters } from './BookingFilters';
import { BookingTable } from './BookingTable';
import { BookingDrawer } from './BookingDrawer';

// --- MOCK DATA ---
const MOCK_BOOKINGS: Booking[] = [
    {
        id: "RES-1024",
        guest: { id: 1, fullName: "علی محمدی", phone: "09123456789", nationalCode: "0012345678" },
        source: 'MEMBER', roomName: "دوتخته دبل (ویو دریا)", checkIn: "1403/11/25", checkOut: "1403/11/28",
        nights: 3, totalPrice: 4500000, paidAmount: 4500000, status: 'CONFIRMED', paymentStatus: 'PAID', createdAt: "1403/11/20"
    },
    {
        id: "RES-1025",
        guest: { id: 2, fullName: "سارا جلالی", phone: "09351112233", nationalCode: "1234567890" },
        source: 'GUEST', roomName: "سوئیت رویال", checkIn: "1403/11/26", checkOut: "1403/11/27",
        nights: 1, totalPrice: 2800000, paidAmount: 0, status: 'PENDING', paymentStatus: 'PENDING_APPROVAL', createdAt: "1403/11/24"
    },
    {
        id: "RES-1026",
        guest: { id: 3, fullName: "رضا کاظمی", phone: "09187778899", nationalCode: "3216549870" },
        source: 'AGENCY', agencyName: "سفر طلایی", roomName: "سه تخته استاندارد", checkIn: "1403/11/25", checkOut: "1403/11/30",
        nights: 5, totalPrice: 7500000, paidAmount: 2000000, status: 'CHECKED_IN', paymentStatus: 'PARTIAL', createdAt: "1403/11/15"
    },
    {
        id: "RES-1027",
        guest: { id: 4, fullName: "مریم حسینی", phone: "09120001122", nationalCode: "0022334455" },
        source: 'MEMBER', roomName: "دوتخته توئین", checkIn: "1403/12/01", checkOut: "1403/12/03",
        nights: 2, totalPrice: 3000000, paidAmount: 0, status: 'CANCELLED', paymentStatus: 'UNPAID', createdAt: "1403/11/22"
    },
];

export const BookingManager = () => {
    // State
    const [selectedSource, setSelectedSource] = useState<BookingSource | 'ALL'>('ALL');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

    // Filter Logic
    const filteredData = useMemo(() => {
        return MOCK_BOOKINGS.filter(booking => {
            const matchesSource = selectedSource === 'ALL' || booking.source === selectedSource;
            const matchesSearch = 
                booking.guest.fullName.includes(searchQuery) || 
                booking.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                booking.guest.phone.includes(searchQuery);
            return matchesSource && matchesSearch;
        });
    }, [selectedSource, searchQuery]);

    return (
        <div className="p-6 bg-gray-50 min-h-screen font-vazir">
            <BookingStats />
            
            <BookingFilters 
                selectedSource={selectedSource} 
                onSourceChange={setSelectedSource}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
            />

            <BookingTable 
                bookings={filteredData} 
                onSelect={setSelectedBooking} 
            />

            <BookingDrawer 
                booking={selectedBooking} 
                onClose={() => setSelectedBooking(null)} 
            />
        </div>
    );
};;
