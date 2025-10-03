// src/components/Header.tsx v0.0.1
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import {
    getSiteSettings,
    getMenu,
    SiteSettings,
    MenuItem,
} from "../api/coreService";
import { useAuth } from "../hooks/useAuth"; // Custom hook for user authentication

// React Query keys
const SITE_SETTINGS_QUERY_KEY = "siteSettings";
const MAIN_MENU_QUERY_KEY = "mainMenu";

// Component for displaying the main navigation menu
const Menu: React.FC<{ items: MenuItem[] }> = ({ items }) => (
    <nav className="hidden lg:flex lg:gap-x-12">
        {/* Iterate over menu items fetched from Django */}
        {items.map((item) => (
            <Link
                key={item.id}
                href={item.url}
                target={item.target}
                className="text-sm font-semibold leading-6 text-gray-900 hover:text-blue-600 transition-colors"
            >
                {item.title}
            </Link>
        ))}
    </nav>
);

// Component for Login/Register buttons or User Status
const AuthStatus: React.FC = () => {
    const { isAuthenticated, user, logout } = useAuth(); // Get auth status and actions

    // Display user profile link and logout button if authenticated
    if (isAuthenticated && user) {
        return (
            <div className="flex items-center space-x-4 space-x-reverse">
                <Link
                    href={
                        user.agency_role ? "/agency/dashboard" : "/my-bookings"
                    }
                    className="text-sm font-semibold leading-6 text-blue-600 hover:text-blue-800"
                >
                    {/* Display username or a general profile link */}
                    {user.username}
                </Link>
                <button
                    onClick={logout}
                    className="rounded-md bg-red-600 px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 transition-colors"
                >
                    Logout
                </button>
            </div>
        );
    }

    // Display Login and Register buttons if not authenticated (CTA buttons)
    return (
        <div className="flex items-center space-x-4 space-x-reverse">
            <Link
                href="/login"
                className="text-sm font-semibold leading-6 text-gray-900 hover:text-blue-600 transition-colors"
            >
                ورود |‌ثبت نام
            </Link>
            <Link
                href="/register"
                className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-colors"
            >
                Register
            </Link>{" "}
        </div>
    );
};

const Header: React.FC = () => {
    // 1. Fetch site settings (Logo URL)
    const { data: settings, isLoading: isSettingsLoading } =
        useQuery<SiteSettings>({
            queryKey: [SITE_SETTINGS_QUERY_KEY],
            queryFn: getSiteSettings,
        });

    // 2. Fetch main menu items (Menu structure)
    const { data: menuItems, isLoading: isMenuLoading } = useQuery<MenuItem[]>({
        queryKey: [MAIN_MENU_QUERY_KEY],
        queryFn: () => getMenu("main-menu"), // Assuming 'main-menu' is the slug used in Django
    });

    // Display a basic skeleton or logo while loading
    if (isSettingsLoading) {
        return (
            <header className="bg-white shadow-md">
                <div
                    className="container mx-auto flex h-16 items-center justify-between p-4 md:p-8"
                    dir="rtl"
                >
                    <div className="h-6 w-24 bg-gray-200 rounded animate-pulse"></div>
                    <div className="flex space-x-4 space-x-reverse">
                        <div className="h-6 w-12 bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-8 w-20 bg-gray-300 rounded animate-pulse"></div>
                    </div>
                </div>
            </header>
        );
    }

    // Fallback for settings if loading failed or data is null
    const logoSrc = settings?.logo_url || "/next.svg";
    const siteName = settings?.site_name || "Hotel Reservation";

    return (
        <header className="bg-white">
            <div
                className="container mx-auto flex h-16 items-center justify-between p-4 md:p-8"
                dir="rtl"
            >
                {/* Logo and Site Name (from Django Settings) */}
                <div className="flex items-center space-x-4 space-x-reverse">
                    <Link href="/" className="-m-1.5 p-1.5">
                        <span className="sr-only">{siteName}</span>
                        <Image
                            className="h-8 w-auto"
                            src={logoSrc}
                            alt={siteName}
                            width={32}
                            height={32}
                            unoptimized={true} // Use unoptimized for external Django media files
                        />
                    </Link>
                    {/* Optional: Display site name next to logo */}
                    <span className="text-xl font-bold text-gray-900">
                        {siteName}
                    </span>
                </div>

                {/* Main Navigation Menu (from Django Menu API) */}
                {isMenuLoading ? (
                    <div className="hidden lg:flex lg:gap-x-12">
                        <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                ) : menuItems && menuItems.length > 0 ? (
                    <Menu items={menuItems} />
                ) : null}

                {/* User Account Status and CTA Buttons (from useAuth) */}
                <div className="hidden lg:flex lg:flex-1 lg:justify-end">
                    <AuthStatus />
                </div>
            </div>
        </header>
    );
};

export default Header;
