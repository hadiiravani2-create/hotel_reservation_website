// src/components/admin/layout/AdminSidebar.tsx
import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { 
  LayoutDashboard, 
  Building2, 
  BedDouble, 
  CalendarDays, 
  Users, 
  Wallet, 
  Settings, 
  LogOut,
  ListTodo
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const AdminSidebar = () => {
  const router = useRouter();
  const { logout } = useAuth();

  // لیست منوهای پنل مدیریت
  const menuItems = [
    { 
      title: 'داشبورد', 
      href: '/admin', 
      icon: LayoutDashboard 
    },
    { 
      title: 'مدیریت هتل‌ها', 
      href: '/admin/hotels', 
      icon: Building2 
    },
    { 
      title: 'اتاق‌ها و موجودی', 
      href: '/admin/rooms', 
      icon: BedDouble 
    },
    { 
      title: 'تقویم قیمت‌گذاری', 
      href: '/admin/pricing', 
      icon: CalendarDays 
    },
    { 
      title: 'لیست رزروها', 
      href: '/admin/bookings', 
      icon: ListTodo 
    },
    { 
      title: 'کاربران و میهمانان', 
      href: '/admin/users', 
      icon: Users 
    },
    { 
      title: 'امور مالی', 
      href: '/admin/finance', 
      icon: Wallet 
    },
    { 
      title: 'تنظیمات', 
      href: '/admin/settings', 
      icon: Settings 
    },
  ];

  const isActive = (path: string) => {
    if (path === '/admin' && router.pathname === '/admin') return true;
    if (path !== '/admin' && router.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 text-white shadow-xl">
      {/* 1. Logo Section */}
      <div className="h-16 flex items-center justify-center border-b border-slate-800 bg-slate-950">
        <h1 className="text-xl font-bold text-primary-brand tracking-wider">
          پنل مدیریت
        </h1>
      </div>

      {/* 2. Navigation Menu */}
      <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1 custom-scrollbar">
        {menuItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                active 
                  ? 'bg-primary-brand text-white shadow-lg shadow-primary-brand/20' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <item.icon className={`w-5 h-5 ${active ? 'text-white' : 'text-slate-500 group-hover:text-white'}`} />
              <span className="font-medium text-sm">{item.title}</span>
            </Link>
          );
        })}
      </nav>

      {/* 3. Footer / Logout */}
      <div className="p-4 border-t border-slate-800 bg-slate-950">
        <button 
          onClick={logout}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium text-sm">خروج از سیستم</span>
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;
