// src/components/admin/layout/AdminLayout.tsx
import { AdminGuard } from '../AdminGuard';
import { AdminSidebar } from './AdminSidebar';
import { AdminHeader } from './AdminHeader';

export const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <AdminGuard>
      <div className="min-h-screen bg-gray-50 font-vazir" dir="rtl">
        {/* Sidebar (Fixed Right) */}
        <AdminSidebar />

        {/* Main Content Wrapper */}
        <div className="mr-64 transition-all duration-300">
          <AdminHeader />
          
          <main className="p-6">
            {children}
          </main>
        </div>
      </div>
    </AdminGuard>
  );
};
