// src/components/admin/layout/AdminSidebar.tsx
import Link from 'next/link';
import { useRouter } from 'next/router';
import { 
  LayoutDashboard, 
  CalendarDays, 
  BedDouble, 
  Wallet, 
  Users, 
  Settings, 
  LogOut 
} from 'lucide-react';

const menuItems = [
  { name: 'داشبورد', icon: LayoutDashboard, href: '/admin' },
  { name: 'مدیریت رزروها', icon: CalendarDays, href: '/admin/bookings' },
  { name: 'مدیریت اتاق‌ها', icon: BedDouble, href: '/admin/rooms' },
  { name: 'امور مالی', icon: Wallet, href: '/admin/finance' },
  { name: 'کاربران', icon: Users, href: '/admin/users' },
  { name: 'تنظیمات', icon: Settings, href: '/admin/settings' },
];

export const AdminSidebar = () => {
  const router = useRouter();

  return (
    <aside className="w-64 bg-slate-900 text-white min-h-screen flex flex-col shadow-xl fixed right-0 top-0 bottom-0 z-50">
      {/* Logo Area */}
      <div className="h-16 flex items-center justify-center border-b border-slate-700">
        <h1 className="text-xl font-bold text-blue-400">میری سفر <span className="text-xs text-slate-400">Admin</span></h1>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 py-6 px-3 space-y-1">
        {menuItems.map((item) => {
          const isActive = router.pathname === item.href;
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' 
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <item.icon size={20} />
              <span className="font-medium text-sm">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer / User Info */}
      <div className="p-4 border-t border-slate-700 bg-slate-950">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center font-bold">
            AD
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-medium truncate">مدیر سیستم</p>
            <p className="text-xs text-slate-400 truncate">admin@mirisafar.com</p>
          </div>
        </div>
      </div>
    </aside>
  );
};
