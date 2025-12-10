// src/pages/booking-rules.tsx
// version: 1.0.0
// FEATURE: Static Booking Rules & Terms page with categorized sections.

import React from 'react';
import Head from 'next/head';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { 
    Scale, FileText, AlertTriangle, Clock, 
    Users, CreditCard, CheckCircle, Hotel 
} from 'lucide-react';

const RuleSection: React.FC<{ title: string; icon: React.ElementType; children: React.ReactNode }> = ({ title, icon: Icon, children }) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6 hover:shadow-md transition-shadow">
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center border-b pb-3">
            <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600 ml-3">
                <Icon className="w-6 h-6" />
            </div>
            {title}
        </h2>
        <div className="text-gray-600 leading-8 text-justify space-y-2">
            {children}
        </div>
    </div>
);

const BookingRulesPage: React.FC = () => {
    return (
        <div className="min-h-screen flex flex-col bg-gray-50" dir="rtl">
            <Head>
                <title>قوانین و مقررات رزرو | سامانه رزرو هتل</title>
                <meta name="description" content="مطالعه قوانین و مقررات رزرو هتل، شرایط کنسلی و مدارک مورد نیاز برای پذیرش." />
            </Head>

            <Header />

            <main className="flex-grow container mx-auto max-w-4xl px-4 py-10">
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-extrabold text-gray-900 mb-4">قوانین و مقررات رزرو</h1>
                    <p className="text-gray-500 max-w-2xl mx-auto">
                        لطفاً پیش از نهایی‌سازی رزرو، قوانین زیر را به دقت مطالعه فرمایید. ثبت رزرو به منزله پذیرش تمامی شرایط و قوانین این سامانه می‌باشد.
                    </p>
                </div>

                {/* 1. General Rules */}
                <RuleSection title="قوانین عمومی و پذیرش" icon={Scale}>
                    <ul className="list-disc list-inside space-y-2 marker:text-indigo-400">
                        <li>همراه داشتن کارت ملی و شناسنامه (برای مسافران ایرانی) و پاسپورت (برای مسافران خارجی) هنگام پذیرش الزامی است.</li>
                        <li>پذیرش زوجین تنها با ارائه شناسنامه یا صیغه‌نامه معتبر با مهر برجسته امکان‌پذیر است.</li>
                        <li>رعایت شئونات اسلامی و قوانین جمهوری اسلامی ایران در تمامی بخش‌های هتل الزامی است.</li>
                        <li>استعمال دخانیات در فضاهای عمومی و اتاق‌ها (مگر در اتاق‌های مخصوص سیگار) ممنوع می‌باشد.</li>
                    </ul>
                </RuleSection>

                {/* 2. Check-in / Check-out */}
                <RuleSection title="زمان ورود و خروج" icon={Clock}>
                    <div className="flex flex-col sm:flex-row gap-4 mb-4">
                        <div className="flex-1 bg-green-50 p-4 rounded-lg border border-green-100 flex items-center">
                            <CheckCircle className="w-5 h-5 text-green-600 ml-2" />
                            <span className="font-bold text-gray-700">ساعت تحویل اتاق: ۱۴:۰۰</span>
                        </div>
                        <div className="flex-1 bg-red-50 p-4 rounded-lg border border-red-100 flex items-center">
                            <Clock className="w-5 h-5 text-red-600 ml-2" />
                            <span className="font-bold text-gray-700">ساعت تخلیه اتاق: ۱۲:۰۰</span>
                        </div>
                    </div>
                    <p>
                        در صورت ورود زودتر از ساعت ۱۴:۰۰ یا خروج دیرتر از ساعت ۱۲:۰۰، ممکن است هزینه نیم‌شارژ طبق تعرفه هتل دریافت گردد. این موضوع منوط به تایید هتل و وجود ظرفیت خالی است.
                    </p>
                </RuleSection>

                {/* 3. Cancellation Policy */}
                <RuleSection title="قوانین لغو و استرداد وجه" icon={AlertTriangle}>
                    <p className="mb-3">
                        جریمه کنسلی رزرو بسته به زمان اعلام کنسلی و قوانین خاص هر هتل متفاوت است. قوانین کلی به شرح زیر می‌باشد:
                    </p>
                    <ul className="list-disc list-inside space-y-2 marker:text-orange-400">
                        <li>تا ۷۲ ساعت قبل از ورود: کسر ۱۰٪ تا ۲۰٪ از مبلغ شب اول.</li>
                        <li>بین ۷۲ تا ۲۴ ساعت قبل از ورود: کسر ۵۰٪ از مبلغ شب اول.</li>
                        <li>کمتر از ۲۴ ساعت قبل از ورود: کسر کامل هزینه شب اول (No-Show).</li>
                        <li>در ایام پیک (تعطیلات نوروز و ...)، ممکن است رزروها "غیرقابل استرداد" (Non-Refundable) باشند.</li>
                    </ul>
                    <div className="mt-4 p-3 bg-orange-50 text-orange-800 rounded-lg text-sm flex items-start">
                        <AlertTriangle className="w-5 h-5 ml-2 flex-shrink-0" />
                        <span>مبلغ قابل استرداد پس از کسر جریمه، ظرف مدت ۳ تا ۷ روز کاری به شماره شبای اعلام شده توسط کاربر واریز می‌گردد.</span>
                    </div>
                </RuleSection>

                {/* 4. Children Policy */}
                <RuleSection title="قوانین خردسالان" icon={Users}>
                    <ul className="list-disc list-inside space-y-2 marker:text-indigo-400">
                        <li>اقامت کودکان زیر ۲ سال (در صورت عدم استفاده از سرویس خواب اضافه) رایگان است.</li>
                        <li>هزینه اقامت کودکان بین ۲ تا ۱۲ سال طبق قوانین هتل (معمولاً نیم‌بها) محاسبه می‌شود.</li>
                        <li>کودکان بالای ۱۲ سال به عنوان بزرگسال محسوب می‌شوند و نیاز به تخت کامل دارند.</li>
                    </ul>
                </RuleSection>

                {/* 5. Payment Rules */}
                <RuleSection title="قوانین پرداخت" icon={CreditCard}>
                    <p>
                        صدور واچر (تاییدیه رزرو) منوط به پرداخت کامل مبلغ رزرو می‌باشد. در صورت پرداخت آفلاین (کارت به کارت)، رزرو تا زمان تایید تراکنش توسط بخش مالی، قطعی نخواهد بود.
                    </p>
                </RuleSection>

            </main>

            <Footer />
        </div>
    );
};

export default BookingRulesPage;
