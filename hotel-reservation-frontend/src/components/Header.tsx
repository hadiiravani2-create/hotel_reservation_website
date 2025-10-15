// src/components/Header.tsx
// version: 1.0.0
// REFACTOR: Overhauled AuthStatus component to a functional user dropdown menu linking to the new profile sections.

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { User, ChevronDown, ClipboardList, Wallet, Settings, LogOut } from "lucide-react";
import { getSiteSettings, getMenu, SiteSettings, MenuItem } from "../api/coreService";
import { useAuth } from "../hooks/useAuth";

const SITE_SETTINGS_QUERY_KEY = "siteSettings";
const MAIN_MENU_QUERY_KEY = "mainMenu";

// --- Menu component (Unchanged) ---
const Menu: React.FC<{ items: MenuItem[] }> = ({ items }) => (
    <nav className="absolute inset-x-0 flex justify-center">
        <ul className="flex items-center gap-5 text-[15px] font-medium text-gray-700">
            {items.map((item) => (
                <li key={item.id}>
                    <Link href={item.url} target={item.target} className="transition-colors duration-200 hover:bg-gray-100 py-2 px-3 rounded-md">
                        {item.title}
                    </Link>
                </li>
            ))}
        </ul>
    </nav>
);

// --- REFACTORED: Auth status with Dropdown Menu ---
const AuthStatus: React.FC = () => {
    const { isAuthenticated, user, logout } = useAuth();
    const [isDropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    if (isAuthenticated && user) {
        return (
            <div className="relative" ref={dropdownRef}>
                <button
                    onClick={() => setDropdownOpen(!isDropdownOpen)}
                    className="flex items-center gap-2 text-sm font-semibold rounded-md leading-6 bg-gray-100 text-gray-800 py-2 px-4 transition-colors hover:bg-gray-200"
                >
                    <User size={16} />
                    <span>{user.username}</span>
                    <ChevronDown size={16} className={`transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {isDropdownOpen && (
                    <div className="absolute left-0 mt-2 w-56 bg-white rounded-md shadow-lg border z-10">
                        <ul className="py-1">
                            <li>
                                <Link href="/profile/bookings" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                    <ClipboardList size={16} className="ml-3" />
                                    رزروهای من
                                </Link>
                            </li>
                            <li>
                                <Link href="/profile/wallet" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                    <Wallet size={16} className="ml-3" />
                                    کیف پول من
                                </Link>
                            </li>
                            <li>
                                <Link href="/profile/settings" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                    <Settings size={16} className="ml-3" />
                                    تنظیمات حساب
                                </Link>
                            </li>
                            <li className="border-t my-1"></li>
                            <li>
                                <button
                                    onClick={logout}
                                    className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                >
                                    <LogOut size={16} className="ml-3" />
                                    خروج از حساب
                                </button>
                            </li>
                        </ul>
                    </div>
                )}
            </div>
        );
    }

    // Unauthenticated user view (Unchanged)
    return (
        <div className="flex items-center space-x-2 space-x-reverse">
            <Link href="/login" className="flex items-center gap-1 text-sm font-semibold rounded-md leading-6 bg-blue-700 text-white py-2 px-3 transition-colors hover:bg-blue-800">
                <User size={16} />
                <span>ورود | ثبت‌نام</span>
            </Link>
        </div>
    );
};

// --- Header (Main component structure unchanged) ---
const Header: React.FC = () => {
    const { data: settings, isLoading: isSettingsLoading } = useQuery<SiteSettings>({
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
                <div className="container mx-auto flex h-16 items-center justify-between p-4 md:p-8" dir="rtl">
                    <div className="h-8 w-24 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-8 w-20 bg-gray-300 rounded animate-pulse ml-auto"></div>
                </div>
            </header>
        );
    }

    const logoSrc = settings?.logo_url || "/next.svg";

    return (
        <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50">
            <div className="container relative mx-auto flex h-20 items-center px-6" dir="rtl">
                <Link href="/" className="flex items-center gap-2">
                    <Image
                        className="object-contain"
                        src={logoSrc}
                        alt="لوگو"
                        width={100}
                        height={80}
                        unoptimized
                    />
                </Link>

                {!isMenuLoading && menuItems && menuItems.length > 0 && (
                    <Menu items={menuItems} />
                )}

                <div className="flex-1 flex justify-end">
                    <AuthStatus />
                </div>
            </div>
        </header>
    );
};

export default Header;
