// src/utils/format.ts
// version: 1.0.1
// FIX: Enforced 'en-US' locale in formatPrice to guarantee comma separators.

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

export const formatPrice = (price: number): string => {
    // 'en-US' ensures that the separator is always a comma (e.g., 1,000,000)
    // Then toPersianDigits converts digits to Farsi (۱,۰۰۰,۰۰۰)
    return toPersianDigits(price.toLocaleString('en-US'));
};
