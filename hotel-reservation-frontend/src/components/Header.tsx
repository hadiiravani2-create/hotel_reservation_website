// src/components/Header.tsx
// version: 2.0.0
// REFACTOR: Fully responsive design with Hamburger menu for mobile and improved desktop layout.
// UX: Displays full name if available, falls back to mobile number.

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import { useQuery } from "@tanstack/react-query";
import { User, ChevronDown, ClipboardList, Wallet, Settings, LogOut, Menu as MenuIcon, X } from "lucide-react";
import { getSiteSettings, getMenu, SiteSettings, MenuItem } from "../api/coreService";
import { useAuth } from "../hooks/useAuth";

const SITE_SETTINGS_QUERY_KEY = "siteSettings";
const MAIN_MENU_QUERY_KEY = "mainMenu";

// --- Helper: Get Display Name ---
const getDisplayName = (user: any) => {
    if (user.first_name && user.last_name) {
        return `${user.first_name} ${user.last_name}`;
    }
    return user.username; // This is the mobile number based on backend logic
};

// --- Component: Desktop Menu ---
const DesktopMenu: React.FC<{ items: MenuItem[] }> = ({ items }) => {
    const router = useRouter();
    
    return (
        <nav className="hidden md:flex items-center gap-6 mx-6">
            <ul className="flex items-center gap-1 text-[15px] font-medium text-gray-700">
                {items.map((item) => {
                    const isActive = router.asPath === item.url;
                    return (
                        <li key={item.id}>
                            <Link 
                                href={item.url} 
                                target={item.target} 
                                className={`transition-all duration-200 py-2 px-3 rounded-lg hover:bg-gray-50 hover:text-blue-600 ${
                                    isActive ? "text-blue-700 font-bold bg-blue-50" : "text-gray-600"
                                }`}
                            >
                                {item.title}
                            </Link>
                        </li>
                    );
                })}
            </ul>
        </nav>
    );
};

// --- Component: Mobile Menu (Drawer) ---
const MobileMenu: React.FC<{ 
    items: MenuItem[]; 
    isOpen: boolean; 
    onClose: () => void; 
    logoSrc: string;
}> = ({ items, isOpen, onClose, logoSrc }) => {
    const { isAuthenticated, user, logout } = useAuth();
    
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] md:hidden">
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose} />
            
            {/* Drawer */}
            <div className="fixed inset-y-0 right-0 w-3/4 max-w-xs bg-white shadow-2xl p-6 flex flex-col animate-in slide-in-from-right duration-300">
                <div className="flex items-center justify-between mb-8">
                    <Image src={logoSrc} alt="Logo" width={80} height={60} className="object-contain" unoptimized />
                    <button onClick={onClose} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">
                        <X size={20} className="text-gray-600" />
                    </button>
                </div>

                <nav className="flex-1 overflow-y-auto">
                    <ul className="space-y-2">
                        {items.map((item) => (
                            <li key={item.id}>
                                <Link 
                                    href={item.url} 
                                    onClick={onClose}
                                    className="block p-3 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-700 font-medium transition-colors"
                                >
                                    {item.title}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>

                <div className="mt-auto border-t pt-6">
                    {isAuthenticated && user ? (
                        <div className="space-y-3">
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                <div className="bg-blue-100 p-2 rounded-full text-blue-600">
                                    <User size={20} />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-bold text-gray-800">{getDisplayName(user)}</span>
                                    <span className="text-xs text-gray-500">خوش آمدید</span>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <Link href="/profile/bookings" onClick={onClose} className="flex flex-col items-center justify-center p-3 bg-gray-50 rounded-lg hover:bg-blue-50 text-xs text-gray-600 gap-2">
                                    <ClipboardList size={18} />
                                    رزروها
                                </Link>
                                <Link href="/profile/wallet" onClick={onClose} className="flex flex-col items-center justify-center p-3 bg-gray-50 rounded-lg hover:bg-blue-50 text-xs text-gray-600 gap-2">
                                    <Wallet size={18} />
                                    کیف پول
                                </Link>
                            </div>
                            <button 
                                onClick={() => { logout(); onClose(); }} 
                                className="w-full flex items-center justify-center gap-2 p-3 text-red-600 bg-red-50 rounded-lg font-medium text-sm mt-2"
                            >
                                <LogOut size={18} />
                                خروج از حساب
                            </button>
                        </div>
                    ) : (
                        <Link 
                            href="/login" 
                            onClick={onClose}
                            className="flex items-center justify-center w-full gap-2 bg-blue-600 text-white p-3 rounded-xl font-bold shadow-lg shadow-blue-200"
                        >
                            <User size={18} />
                            ورود یا ثبت‌نام
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
};

// --- Component: Desktop Auth Dropdown ---
const DesktopAuthStatus: React.FC = () => {
    const { isAuthenticated, user, logout } = useAuth();
    const [isDropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

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
            <div className="relative hidden md:block" ref={dropdownRef}>
                <button
                    onClick={() => setDropdownOpen(!isDropdownOpen)}
                    className={`flex items-center gap-2 text-sm font-medium rounded-full py-2 px-4 transition-all border ${
                        isDropdownOpen ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                >
                    <div className="bg-gray-100 p-1 rounded-full">
                        <User size={16} />
                    </div>
                    <span>{getDisplayName(user)}</span>
                    <ChevronDown size={14} className={`transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {isDropdownOpen && (
                    <div className="absolute left-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-4 bg-gray-50 border-b">
                            <p className="text-xs text-gray-500">حساب کاربری</p>
                            <p className="text-sm font-bold text-gray-800 truncate">{getDisplayName(user)}</p>
                        </div>
                        <ul className="p-2 space-y-1">
                            <li>
                                <Link href="/profile/bookings" className="flex items-center px-3 py-2 text-sm text-gray-700 rounded-lg hover:bg-blue-50 hover:text-blue-700 transition-colors">
                                    <ClipboardList size={18} className="ml-2 opacity-70" />
                                    رزروهای من
                                </Link>
                            </li>
                            <li>
                                <Link href="/profile/wallet" className="flex items-center px-3 py-2 text-sm text-gray-700 rounded-lg hover:bg-blue-50 hover:text-blue-700 transition-colors">
                                    <Wallet size={18} className="ml-2 opacity-70" />
                                    کیف پول من
                                </Link>
                            </li>
                            <li>
                                <Link href="/profile/settings" className="flex items-center px-3 py-2 text-sm text-gray-700 rounded-lg hover:bg-blue-50 hover:text-blue-700 transition-colors">
                                    <Settings size={18} className="ml-2 opacity-70" />
                                    تنظیمات حساب
                                </Link>
                            </li>
                            <li className="border-t my-1 border-gray-100"></li>
                            <li>
                                <button
                                    onClick={logout}
                                    className="flex items-center w-full text-left px-3 py-2 text-sm text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                                >
                                    <LogOut size={18} className="ml-2 opacity-70" />
                                    خروج
                                </button>
                            </li>
                        </ul>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="hidden md:flex items-center">
            <Link href="/login" className="flex items-center gap-2 text-sm font-bold rounded-lg bg-blue-600 text-white py-2.5 px-5 shadow-lg shadow-blue-200 hover:bg-blue-700 hover:shadow-blue-300 transition-all active:scale-95">
                <User size={18} />
                <span>ورود | ثبت‌نام</span>
            </Link>
        </div>
    );
};

// --- Main Header Component ---
const Header: React.FC = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    
    const { data: settings, isLoading: isSettingsLoading } = useQuery<SiteSettings>({
        queryKey: [SITE_SETTINGS_QUERY_KEY],
        queryFn: getSiteSettings,
    });

    const { data: menuItems, isLoading: isMenuLoading } = useQuery<MenuItem[]>({
        queryKey: [MAIN_MENU_QUERY_KEY],
        queryFn: () => getMenu("main-menu"),
    });

    // Skeleton Loading State
    if (isSettingsLoading) {
        return (
            <header className="bg-white/90 backdrop-blur-md border-b border-gray-100">
                <div className="container mx-auto flex h-20 items-center justify-between px-6" dir="rtl">
                    <div className="h-10 w-28 bg-gray-200 rounded-md animate-pulse"></div>
                    <div className="hidden md:block h-4 w-64 bg-gray-100 rounded animate-pulse"></div>
                    <div className="h-10 w-24 bg-gray-200 rounded-full animate-pulse ml-auto md:ml-0"></div>
                </div>
            </header>
        );
    }

    const logoSrc = settings?.logo_url || "/next.svg";

    return (
        <>
            <header className="bg-white/90 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100 transition-all supports-[backdrop-filter]:bg-white/60">
                <div className="container relative mx-auto flex h-20 items-center justify-between px-4 md:px-8" dir="rtl">
                    
                    {/* Logo Section */}
                    <div className="flex-shrink-0 flex items-center gap-2">
                        <Link href="/" className="relative block w-[100px] h-[50px]">
                            <Image
                                className="object-contain"
                                src={logoSrc}
                                alt={settings?.site_name || "Logo"}
                                fill
                                sizes="100px"
                                priority
                                unoptimized // Keep unoptimized if loading from external Django media without Next.js Image Optimization setup
                            />
                        </Link>
                    </div>

                    {/* Desktop Menu - Centered */}
                    <div className="flex-1 flex justify-center">
                        {!isMenuLoading && menuItems && menuItems.length > 0 && (
                            <DesktopMenu items={menuItems} />
                        )}
                    </div>

                    {/* Right Section: Auth (Desktop) & Hamburger (Mobile) */}
                    <div className="flex-shrink-0 flex items-center gap-3">
                        <DesktopAuthStatus />
                        
                        {/* Mobile Menu Button */}
                        <button 
                            onClick={() => setIsMobileMenuOpen(true)}
                            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 active:bg-gray-200 transition-colors"
                        >
                            <MenuIcon size={24} />
                        </button>
                    </div>
                </div>
            </header>

            {/* Mobile Menu Overlay */}
            {!isMenuLoading && menuItems && (
                <MobileMenu 
                    items={menuItems} 
                    isOpen={isMobileMenuOpen} 
                    onClose={() => setIsMobileMenuOpen(false)}
                    logoSrc={logoSrc}
                />
            )}
        </>
    );
};

export default Header;
