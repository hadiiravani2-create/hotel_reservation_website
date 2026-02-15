// FILE: front/src/types/pricing.ts
// ایجاد فایل جدید برای تجمیع تایپ‌های مربوط به قیمت‌گذاری

export interface PricingCalendarData {
    date: string;
    stock: number;
    price: number | null;
    extra_price: number | null; // قیمت نفر اضافه
    child_price: number | null;
}

export interface BulkUpdatePricePayload {
    room: number;
    start_date: string;
    end_date: string;
    board_type: number; // این فیلد حیاتی است
    price: number;
    extra_price?: number;
    child_price?: number;
}
