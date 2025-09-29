// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  // ... سایر تنظیمات
  allowedDevOrigins: [
    '2.180.44.137',
    'hotel.mirisafar.com',
    // هر آدرس دیگری که ممکن است از آن برای دسترسی استفاده کنید
  ],
};

module.exports = nextConfig;
