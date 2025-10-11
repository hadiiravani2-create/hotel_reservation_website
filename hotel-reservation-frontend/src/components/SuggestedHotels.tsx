// src/components/SuggestedHotels.tsx

import Link from "next/link";
// نیازی به Image نیست، از تگ <img> با آدرس‌های موقت استفاده می‌کنیم.

// داده‌های ساختگی (Mock Data) برای نمایش استاتیک (۴ هتل)
const staticHotels = [
    {
        id: 1,
        name: "هتل مجلل آریانا",
        city: "تهران",
        slug: "ariana-grand-hotel", // برای لینک به صفحه جزئیات هتل
        price: "4500000",
        rating: 4.8,
        reviews: 210,
        imageUrl: "/images/hotel-mock-1.jpg",
    },
    {
        id: 2,
        name: "هتل ساحلی پردیس",
        city: "کیش",
        slug: "pardis-beach-hotel",
        price: "3100000",
        rating: 4.5,
        reviews: 155,
        imageUrl: "/images/hotel-mock-2.jpg",
    },
    {
        id: 3,
        name: "اقامتگاه سنتی فردوسی",
        city: "اصفهان",
        slug: "ferdowsi-traditional-house",
        price: "2200000",
        rating: 4.9,
        reviews: 98,
        imageUrl: "/images/hotel-mock-3.jpg",
    },
    {
        id: 4,
        name: "هتل الیت وستا",
        city: "مشهد",
        slug: "vesta-elite-hotel",
        price: "6000000",
        rating: 4.7,
        reviews: 350,
        imageUrl: "/images/hotel-mock-4.jpg", // هتل جدید اضافه شده
    },
];

// کامپوننت فرعی برای نمایش کارت یک هتل (بدون تغییر استایل کارت)
const HotelCard = ({ hotel }: { hotel: (typeof staticHotels)[0] }) => {
    // تابع کمکی برای فرمت قیمت (افزودن کاما)
    const formatPrice = (price: string) => {
        return new Intl.NumberFormat("fa-IR").format(parseInt(price));
    };

    return (
        <Link
            href={`/hotels/${hotel.slug}`}
            className="block border border-gray-200 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition duration-300 bg-white group"
        >
            {/* تصویر هتل (Placeholder) */}
            <div className="relative h-48 w-full">
                <img
                    src={hotel.imageUrl}
                    alt={hotel.name}
                    className="object-cover w-full h-full transition duration-500 group-hover:scale-105"
                />
            </div>

            {/* محتوای کارت */}
            <div className="p-4 text-right">
                <h3 className="text-xl font-bold text-gray-800 mb-1 group-hover:text-blue-600 transition duration-300">
                    {hotel.name}
                </h3>
                <p className="text-sm text-gray-500 mb-3">{hotel.city}</p>

                {/* بخش امتیاز و نظرات */}
                <div className="flex items-center justify-end mb-4">
                    <span className="text-sm font-semibold text-yellow-500 mr-2">
                        {/* آیکون ستاره */}
                        <span className="ml-1">★</span>
                        {hotel.rating}
                    </span>
                    <span className="text-xs text-gray-400">
                        ({hotel.reviews} نظر)
                    </span>
                </div>

                {/* بخش قیمت */}
                <div className="text-left mt-3 pt-3 border-t border-gray-100">
                    <p className="text-xs text-gray-600">شروع قیمت از:</p>
                    <p className="text-2xl font-extrabold text-indigo-600">
                        {formatPrice(hotel.price)}
                        <span className="text-sm font-normal mr-1">تومان</span>
                    </p>
                </div>
            </div>
        </Link>
    );
};

const SuggestedHotels = () => {
    return (
        <section className="mt-12 mb-12">
            {/* سکشن تیتر و دکمه "مشاهده همه" */}
            <div className="flex justify-between items-center mb-6 px-1">
                {/* تیتر (کوچک‌تر و راست‌چین) */}
                <h2 className="text-xl font-bold text-gray-800">
                    هتل‌های برتر و پر بازدید
                </h2>

                {/* لینک "مشاهده همه هتل‌ها" (انتقال به بالا سمت چپ، بدون بک‌گراند) */}
                <Link
                    href="/search"
                    className="text-indigo-600 hover:text-indigo-800 font-semibold transition duration-300 text-sm"
                >
                    مشاهده همه هتل‌ها &larr;
                </Link>
            </div>

            {/* گرید ۴ ستونه برای نمایش هتل‌ها */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {staticHotels.map((hotel) => (
                    <HotelCard key={hotel.id} hotel={hotel} />
                ))}
            </div>
        </section>
    );
};

export default SuggestedHotels;
