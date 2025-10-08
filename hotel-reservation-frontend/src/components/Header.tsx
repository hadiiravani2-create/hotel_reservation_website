// src/components/Header.tsx v0.0.3
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { User } from "lucide-react";
import {
    getSiteSettings,
    getMenu,
    SiteSettings,
    MenuItem,
} from "../api/coreService";
import { useAuth } from "../hooks/useAuth";

const SITE_SETTINGS_QUERY_KEY = "siteSettings";
const MAIN_MENU_QUERY_KEY = "mainMenu";

// --- Menu component ---
const Menu: React.FC<{ items: MenuItem[] }> = ({ items }) => (
    <nav className="absolute inset-x-0 flex justify-center">
        <ul className="flex items-center gap-8 text-[15px] font-medium text-gray-700">
            {items.map((item) => (
                <li key={item.id}>
                    <Link
                        href={item.url}
                        target={item.target}
                        className="transition-colors duration-200 hover:text-blue-700"
                    >
                        {item.title}
                    </Link>
                </li>
            ))}
        </ul>
    </nav>
);

// --- Auth status ---
const AuthStatus: React.FC = () => {
    const { isAuthenticated, user, logout } = useAuth();

    if (isAuthenticated && user) {
        return (
            <div className="flex items-center space-x-4 space-x-reverse">
                <Link
                    href={
                        user.agency_role ? "/agency/dashboard" : "/my-bookings"
                    }
                    className="text-sm font-semibold leading-6 text-blue-700 hover:text-blue-900"
                >
                    {user.username}
                </Link>
                <button
                    onClick={logout}
                    className="rounded-md bg-red-600 px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-red-500 transition-colors"
                >
                    خروج
                </button>
            </div>
        );
    }

    return (
        <div className="flex items-center space-x-2 space-x-reverse">
            <Link
                href="/login"
                className="flex items-center gap-1 text-sm font-semibold rounded-md leading-6 bg-blue-700 text-white py-2 px-3 transition-colors hover:bg-blue-800"
            >
                <User size={16} />
                <span>ورود | ثبت‌نام</span>
            </Link>
        </div>
    );
};

// --- Header ---
const Header: React.FC = () => {
    const { data: settings, isLoading: isSettingsLoading } =
        useQuery<SiteSettings>({
            queryKey: [SITE_SETTINGS_QUERY_KEY],
            queryFn: getSiteSettings,
        });

    const { data: menuItems, isLoading: isMenuLoading } = useQuery<MenuItem[]>({
        queryKey: [MAIN_MENU_QUERY_KEY],
        queryFn: () => getMenu("main-menu"),
    });

    if (isSettingsLoading) {
        return (
            <header className="bg-white/80 backdrop-blur-md">
                <div
                    className="container mx-auto flex h-16 items-center justify-between p-4 md:p-8"
                    dir="rtl"
                >
                    <div className="h-8 w-24 bg-gray-200 rounded animate-pulse"></div>
                    <div className="flex space-x-4 space-x-reverse">
                        <div className="h-6 w-12 bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-8 w-20 bg-gray-300 rounded animate-pulse"></div>
                    </div>
                </div>
            </header>
        );
    }

    const logoSrc = settings?.logo_url || "/next.svg";

    return (
        <header className="bg-white/80 backdrop-blur-md">
            <div
                className="container relative mx-auto flex h-20 items-center px-6"
                dir="rtl"
            >
                {/* لوگو */}
                <Link href="/" className="flex items-center gap-2">
                    <Image
                        className="object-contain"
                        src={logoSrc}
                        alt="لوگو"
                        width={100} // 👈 بزرگ‌تر شد
                        height={80}
                        unoptimized
                    />
                </Link>

                {/* منوی وسط */}
                {!isMenuLoading && menuItems && menuItems.length > 0 && (
                    <Menu items={menuItems} />
                )}

                {/* وضعیت کاربر */}
                <div className="hidden lg:flex lg:flex-1 lg:justify-end">
                    <AuthStatus />
                </div>
            </div>
        </header>
    );
};

export default Header;
