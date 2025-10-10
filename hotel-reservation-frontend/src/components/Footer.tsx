// hotel-reservation-frontend/src/components/Footer.tsx
// version: 1.0.0

import React from "react";

// Define the structure for a link item
interface FooterLink {
    name: string;
    href: string;
}

// Define the structure for a section of links
interface FooterSection {
    title: string;
    links: FooterLink[];
}

// Footer component
const Footer: React.FC = () => {
    // Data for the footer sections
    const sections: FooterSection[] = [
        {
            title: "محصولات",
            links: [
                { name: "رزرو هتل", href: "#" },
                { name: "رزرو تور", href: "#" },
                { name: "بلیط هواپیما", href: "#" },
                { name: "بیمه مسافرتی", href: "#" },
            ],
        },
        {
            title: "پشتیبانی",
            links: [
                { name: "سوالات متداول", href: "#" },
                { name: "تماس با ما", href: "#" },
                { name: "قوانین و مقررات", href: "#" },
                { name: "راهنمای سایت", href: "#" },
            ],
        },
        {
            title: "شرکت",
            links: [
                { name: "درباره ما", href: "#" },
                { name: "فرصت‌های شغلی", href: "#" },
                { name: "وبلاگ", href: "#" },
                { name: "همکاری با ما", href: "#" },
            ],
        },
    ];

    return (
        <footer className="bg-gray-800 text-white" dir="rtl">
            <div className="mx-auto max-w-7xl px-6 pb-8 pt-16 sm:pt-24 lg:px-8 lg:pt-32">
                <div className="xl:grid xl:grid-cols-3 xl:gap-8">
                    {/* Logo and description section */}
                    <div className="space-y-8">
                        <h2 className="text-2xl font-bold">سامانه رزرو هتل</h2>
                        <p className="text-sm leading-6 text-gray-300">
                            ما بهترین هتل‌ها را برای اقامتی به‌یادماندنی به شما
                            پیشنهاد می‌دهیم. سفری راحت و با اطمینان را با ما
                            تجربه کنید.
                        </p>
                        {/* Social media icons can be added here */}
                    </div>
                    {/* Links section */}
                    <div className="mt-16 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
                        <div className="md:grid md:grid-cols-3 md:gap-8">
                            {sections.map((section) => (
                                <div key={section.title}>
                                    <h3 className="text-sm font-semibold leading-6">
                                        {section.title}
                                    </h3>
                                    <ul role="list" className="mt-6 space-y-4">
                                        {section.links.map((item) => (
                                            <li key={item.name}>
                                                <a
                                                    href={item.href}
                                                    className="text-sm leading-6 text-gray-300 hover:text-white"
                                                >
                                                    {item.name}
                                                </a>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                        {/* Newsletter subscription form */}
                        <div className="md:col-span-1">
                            <h3 className="text-sm font-semibold leading-6">
                                عضویت در خبرنامه
                            </h3>
                            <p className="mt-2 text-sm leading-6 text-gray-300">
                                جدیدترین تخفیف‌ها و پیشنهادها را مستقیم در ایمیل
                                خود دریافت کنید.
                            </p>
                            <form className="mt-6 sm:flex sm:max-w-md">
                                <label
                                    htmlFor="email-address"
                                    className="sr-only"
                                >
                                    آدرس ایمیل
                                </label>
                                <input
                                    type="email"
                                    name="email-address"
                                    id="email-address"
                                    autoComplete="email"
                                    required
                                    className="w-full min-w-0 appearance-none rounded-md border-0 bg-white/5 px-3 py-1.5 text-base text-white shadow-sm ring-1 ring-inset ring-white/10 placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:w-64 sm:text-sm sm:leading-6 xl:w-full"
                                    placeholder="ایمیل خود را وارد کنید"
                                />
                                <div className="mt-4 sm:ml-4 sm:mt-0 sm:flex-shrink-0">
                                    <button
                                        type="submit"
                                        className="flex w-full items-center justify-center rounded-md bg-indigo-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                                    >
                                        ثبت‌نام
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
                {/* Bottom border and copyright */}
                <div className="mt-16 border-t border-white/10 pt-8 sm:mt-20 lg:mt-24">
                    <p className="text-xs leading-5 text-gray-400">
                        &copy; {new Date().getFullYear()} تمام حقوق این سایت
                        محفوظ است.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
