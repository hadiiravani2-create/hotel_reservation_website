// src/components/admin/layout/AdminHeader.tsx
import { useAuth } from '@/hooks/useAuth';
import { LogOut, Bell, Menu } from 'lucide-react';

export const AdminHeader = () => {
  const { logout, user } = useAuth();

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-40 mr-64">
      {/* Right Side (Title or Breadcrumb) */}
      <div className="flex items-center gap-4">
        <button className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-md">
           <Menu size={20} />
        </button>
        <h2 className="text-lg font-semibold text-gray-700">پنل مدیریت</h2>
      </div>

      {/* Left Side (Actions) */}
      <div className="flex items-center gap-4">
        <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full relative">
          <Bell size={20} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
        
        <div className="h-6 w-px bg-gray-300 mx-2"></div>

        <button 
          onClick={logout}
          className="flex items-center gap-2 text-sm text-red-600 hover:bg-red-50 px-3 py-2 rounded-md transition-colors"
        >
          <LogOut size={18} />
          <span>خروج</span>
        </button>
      </div>
    </header>
  );
};
