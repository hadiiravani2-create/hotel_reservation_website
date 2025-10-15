// src/components/profile/ProfileSidebar.tsx
// version: 1.0.0
// NEW: Sidebar navigation component for the user profile section.

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  UserCircleIcon,
  CreditCardIcon,
  ClipboardDocumentListIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '@/hooks/useAuth';

const navItems = [
  { href: '/profile/bookings', label: 'رزروهای من', icon: ClipboardDocumentListIcon },
  { href: '/profile/wallet', label: 'کیف پول من', icon: CreditCardIcon },
  { href: '/profile/settings', label: 'تنظیمات حساب', icon: UserCircleIcon },
];

const ProfileSidebar: React.FC = () => {
  const router = useRouter();
  const { logout } = useAuth();

  return (
    <aside className="w-full md:w-64 bg-white p-4 rounded-lg shadow-md">
      <nav>
        <ul>
          {navItems.map((item) => {
            const isActive = router.asPath === item.href;
            return (
              <li key={item.href} className="mb-2">
                <Link href={item.href}>
                  <div
                    className={`flex items-center p-3 rounded-md transition-colors duration-200 cursor-pointer ${
                      isActive
                        ? 'bg-primary-brand text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <item.icon className="w-6 h-6 ml-3" />
                    <span className="font-medium">{item.label}</span>
                  </div>
                </Link>
              </li>
            );
          })}
          {/* Logout Button */}
          <li className="mt-4 border-t pt-4">
            <button
              onClick={logout}
              className="flex items-center w-full p-3 text-red-600 hover:bg-red-50 rounded-md transition-colors duration-200"
            >
              <ArrowRightOnRectangleIcon className="w-6 h-6 ml-3" />
              <span className="font-medium">خروج از حساب</span>
            </button>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default ProfileSidebar;
