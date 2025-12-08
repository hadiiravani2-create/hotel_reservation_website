// src/components/admin/layout/AdminLayout.tsx
import React from 'react';
import AdminGuard from './AdminGuard';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  return (
    <AdminGuard>
      <div className="flex min-h-screen bg-gray-50 font-sans" dir="rtl">
        
        {/* Sidebar Fixed on Right */}
        <aside className="w-64 fixed top-0 bottom-0 right-0 z-20 hidden md:block">
            <AdminSidebar />
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col md:mr-64 min-h-screen transition-all duration-300">
            {/* Sticky Header */}
            <AdminHeader />
            
            {/* Dynamic Page Content */}
            <main className="p-6 md:p-8 overflow-x-hidden">
                <div className="mx-auto max-w-7xl">
                    {children}
                </div>
            </main>
        </div>
      </div>
    </AdminGuard>
  );
};

export default AdminLayout;
