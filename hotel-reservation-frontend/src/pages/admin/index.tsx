// src/pages/admin/index.tsx
import React from 'react';
import AdminLayout from '@/components/admin/layout/AdminLayout';

const AdminDashboardPage = () => {
  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">داشبورد مدیریت</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* کارت‌های آماری */}
          <div className="bg-white p-6 rounded-xl shadow-sm border">
              <span className="text-gray-500 text-sm">رزروهای امروز</span>
              <p className="text-3xl font-bold mt-2">12</p>
          </div>
          {/* ... سایر کارت‌ها */}
      </div>
    </AdminLayout>
  );
};

export default AdminDashboardPage;
