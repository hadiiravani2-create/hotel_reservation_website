// src/components/admin/layout/AdminHeader.tsx
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Bell, Search, UserCircle } from 'lucide-react';

const AdminHeader = () => {
  const { user } = useAuth();

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-10 shadow-sm">
      
      {/* Left Side: Search (Optional) */}
      <div className="flex items-center bg-gray-100 px-3 py-2 rounded-lg w-64 md:w-96">
        <Search className="w-4 h-4 text-gray-500 ml-2" />
        <input 
            type="text" 
            placeholder="جستجو در رزروها، هتل‌ها..." 
            className="bg-transparent border-none outline-none text-sm w-full text-gray-700 placeholder-gray-400"
        />
      </div>

      {/* Right Side: User Profile & Actions */}
      <div className="flex items-center gap-4">
        
        {/* Notifications */}
        <button className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
        </button>

        {/* Vertical Separator */}
        <div className="h-8 w-px bg-gray-200 mx-1"></div>

        {/* User Info */}
        <div className="flex items-center gap-3 pl-2">
            <div className="text-left hidden md:block">
                <p className="text-sm font-bold text-gray-800">
                    {user?.first_name} {user?.last_name}
                </p>
                <p className="text-xs text-gray-500">مدیر سیستم</p>
            </div>
            <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 border border-slate-200">
                <UserCircle className="w-6 h-6" />
            </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
