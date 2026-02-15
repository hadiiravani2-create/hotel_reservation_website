export type BookingSource = 'AGENCY' | 'MEMBER' | 'GUEST';
export type BookingStatus = 'CONFIRMED' | 'PENDING' | 'CHECKED_IN' | 'CHECKED_OUT' | 'CANCELLED';
export type PaymentStatus = 'PAID' | 'PARTIAL' | 'PENDING_APPROVAL' | 'UNPAID';

export interface Guest {
    id: number;
    fullName: string;
    phone: string;
    nationalCode: string;
    avatar?: string;
}

export interface Booking {
    id: string;
    guest: Guest;
    source: BookingSource;
    roomName: string;
    checkIn: string;
    checkOut: string;
    nights: number;
    totalPrice: number;
    paidAmount: number;
    status: BookingStatus;
    paymentStatus: PaymentStatus;
    createdAt: string;
    agencyName?: string;
}
