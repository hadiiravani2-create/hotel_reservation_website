// src/pages/admin/index.tsx
import { AdminLayout } from '@/components/admin/layout/AdminLayout';

export default function AdminDashboard() {
  return (
    <AdminLayout>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* کارت نمونه */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-gray-500 text-sm mb-2">رزروهای امروز</h3>
          <p className="text-3xl font-bold text-gray-800">12</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-gray-500 text-sm mb-2">درآمد کل</h3>
          <p className="text-3xl font-bold text-green-600">45,000,000 <span className="text-sm">تومان</span></p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-gray-500 text-sm mb-2">اتاق‌های خالی</h3>
          <p className="text-3xl font-bold text-blue-600">8</p>
        </div>
      </div>
    </AdminLayout>
  );
}
