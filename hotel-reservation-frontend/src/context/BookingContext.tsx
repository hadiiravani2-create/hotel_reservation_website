// FILE: src/context/BookingContext.tsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { CartItem } from '@/types/hotel';
import { DateObject } from 'react-multi-date-picker';
import { DATE_CONFIG } from '@/config/date';

// تعریف نوع داده‌های وضعیت
interface BookingState {
    cart: CartItem[];
    checkIn: string | null; // Format: YYYY-MM-DD
    checkOut: string | null; // Format: YYYY-MM-DD
    duration: number;
}

// تعریف توابع و متدهای کانتکست
interface BookingContextType extends BookingState {
    addToCart: (item: CartItem) => void;
    removeFromCart: (itemId: string) => void;
    clearCart: () => void;
    setBookingDates: (checkIn: string, duration: number) => void;
    setBookingData: (cart: CartItem[], checkIn: string, duration: number) => void;
    isLoading: boolean; // برای هندل کردن Hydration اولیه
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export const BookingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // وضعیت‌های اصلی
    const [cart, setCart] = useState<CartItem[]>([]);
    const [checkIn, setCheckInDate] = useState<string | null>(null);
    const [duration, setDurationVal] = useState<number>(1);
    const [isLoading, setIsLoading] = useState(true);

    // محاسبه خودکار تاریخ خروج بر اساس ورود و مدت
    const checkOut = React.useMemo(() => {
        if (!checkIn) return null;
        try {
            const date = new DateObject({ date: checkIn, ...DATE_CONFIG });
            return date.add(duration, 'days').format('YYYY-MM-DD');
        } catch (e) {
            console.error("Date calculation error", e);
            return null;
        }
    }, [checkIn, duration]);

    // 1. بارگذاری اولیه از LocalStorage (فقط برای جلوگیری از پاک شدن هنگام رفرش)
    useEffect(() => {
        const loadFromStorage = () => {
            try {
                const storedCart = localStorage.getItem('bookingCart');
                const storedCheckIn = localStorage.getItem('checkInDate');
                const storedDuration = localStorage.getItem('duration');

                if (storedCart) setCart(JSON.parse(storedCart));
                if (storedCheckIn) setCheckInDate(storedCheckIn);
                if (storedDuration) setDurationVal(parseInt(storedDuration, 10));
            } catch (error) {
                console.error("Error loading booking context", error);
            } finally {
                setIsLoading(false);
            }
        };
        loadFromStorage();
    }, []);

    // 2. ذخیره‌سازی تغییرات در LocalStorage (همگام‌سازی یک‌طرفه)
    useEffect(() => {
        if (!isLoading) {
            localStorage.setItem('bookingCart', JSON.stringify(cart));
            if (checkIn) localStorage.setItem('checkInDate', checkIn);
            localStorage.setItem('duration', duration.toString());
            // checkOut is derived, no need to store ideally, but kept for legacy compat if needed
            if (checkOut) localStorage.setItem('checkOutDate', checkOut); 
        }
    }, [cart, checkIn, duration, checkOut, isLoading]);

    // Actions
    const addToCart = useCallback((item: CartItem) => {
        setCart(prev => [...prev, item]);
    }, []);

    const removeFromCart = useCallback((itemId: string) => {
        setCart(prev => prev.filter(i => i.id !== itemId));
    }, []);

    const clearCart = useCallback(() => {
        setCart([]);
        localStorage.removeItem('bookingCart');
    }, []);

    const setBookingDates = useCallback((newCheckIn: string, newDuration: number) => {
        setCheckInDate(newCheckIn);
        setDurationVal(newDuration);
    }, []);

    // تابع برای تنظیم یکباره (مثلاً هنگام زدن دکمه رزرو در ویجت)
    const setBookingData = useCallback((newCart: CartItem[], newCheckIn: string, newDuration: number) => {
        setCart(newCart);
        setCheckInDate(newCheckIn);
        setDurationVal(newDuration);
    }, []);

    const value = {
        cart,
        checkIn,
        checkOut,
        duration,
        addToCart,
        removeFromCart,
        clearCart,
        setBookingDates,
        setBookingData,
        isLoading
    };

    return (
        <BookingContext.Provider value={value}>
            {children}
        </BookingContext.Provider>
    );
};

// Custom Hook
export const useBooking = () => {
    const context = useContext(BookingContext);
    if (context === undefined) {
        throw new Error('useBooking must be used within a BookingProvider');
    }
    return context;
};
