// src/utils/format.ts
// version: 1.0.2
// FIX: Cast input to Number() in formatPrice to ensure comma separation works even if input is a string string.

export const toPersianDigits = (n: number | string): string => {
    const farsiDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    return n
        .toString()
        .replace(/\d/g, (x) => farsiDigits[parseInt(x)]);
};

export const toEnglishDigits = (n: number | string): string => {
    const farsiDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    return n.toString().replace(/[۰-۹]/g, (w) => {
        return farsiDigits.indexOf(w).toString();
    });
};

export const formatPrice = (price: number | string): string => {
    // FIX: Convert to Number first. 'toLocaleString' on a string usually does nothing.
    const numericPrice = Number(price);
    
    if (isNaN(numericPrice)) {
        return "۰";
    }

    // 'en-US' guarantees comma separator (e.g. 1,000,000)
    return toPersianDigits(numericPrice.toLocaleString('en-US'));
};
