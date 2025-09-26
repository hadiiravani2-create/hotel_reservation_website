// src/pages/agency/dashboard.tsx
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import { useAuth } from '../../hooks/useAuth'; 
import { getAgencyReport, getAgencySubUsers } from '../../api/agencyService'; 
import { Button } from '../../components/ui/Button'; 
// فرض می‌کنیم MainLayout یک لایه پایه برای صفحه است.
const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => <div className="container mx-auto p-8" dir="rtl">{children}</div>; 

// --- Sub-Component for Financial Report (G4.5) ---
const FinancialReport: React.FC<{ report: any }> = ({ report }) => {
    const formatCurrency = (amount: number) => amount.toLocaleString('fa') + ' تومان';
    const isOverCredit = report.agency.current_balance > report.agency.credit_limit;

    return (
        <div className="mb-8 p-6 bg-white shadow-lg rounded-xl border border-gray-100">
            <h2 className="text-2xl font-bold mb-4 text-primary-brand">گزارش مالی آژانس: {report.agency.name}</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-gray-600">سقف اعتبار</p>
                    <p className="text-xl font-bold">{formatCurrency(report.agency.credit_limit)}</p>
                </div>
                <div className={`p-4 rounded-lg ${isOverCredit ? 'bg-red-100' : 'bg-green-50'}`}>
                    <p className="text-sm text-gray-600">بدهی فعلی</p>
                    <p className="text-xl font-bold text-red-600">{formatCurrency(report.agency.current_balance)}</p>
                    {isOverCredit && <p className="text-xs text-red-500 mt-1">اخطار: سقف اعتبار شما پر شده است!</p>}
                </div>
            </div>

            {/* لیست آخرین تراکنش‌ها */}
            <h3 className="text-xl font-semibold mt-6 mb-3 border-b pb-2">آخرین تراکنش‌ها</h3>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-sm font-medium text-gray-500 tracking-wider text-right">نوع</th>
                            <th className="px-6 py-3 text-sm font-medium text-gray-500 tracking-wider text-right">مبلغ</th>
                            <th className="px-6 py-3 text-sm font-medium text-gray-500 tracking-wider text-right">تاریخ</th>
                            <th className="px-6 py-3 text-sm font-medium text-gray-500 tracking-wider text-right">کد رزرو</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {report.transactions.slice(0, 10).map((tx: any) => (
                            <tr key={tx.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{tx.transaction_type}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{formatCurrency(tx.amount)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{tx.transaction_date}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-primary-brand">{tx.booking?.booking_code || '-'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// --- Sub-Component for User Management (G4.6) ---
const UserManagement: React.FC<{ user: any }> = ({ user }) => {
    // از useAuth فرض می‌کنیم که agency_role کاربر را دارد
    const { data: users } = useQuery({
        queryKey: ['agencySubUsers'],
        queryFn: getAgencySubUsers,
        enabled: user?.agency_role === 'admin', // فقط برای ادمین آژانس فعال شود
    });

    const isAdmin = user?.agency_role === 'admin';
    
    const handleAddUser = () => {
        // اینجا باید فرم ایجاد کاربر را باز کنید
        alert('در اینجا فرم ایجاد/ویرایش کاربر باز می‌شود (G4.6 - CRUD).');
    }

    if (!isAdmin) {
        // این محدودیت توسط بک‌اند هم اعمال می‌شود
        return <div className="p-4 bg-yellow-50 rounded-lg">شما مجوز مدیریت کاربران را ندارید.</div>;
    }

    return (
        <div className="p-6 bg-white shadow-lg rounded-xl border border-gray-100">
            <div className="flex justify-between items-center mb-4 border-b pb-2">
                <h2 className="text-2xl font-bold text-gray-900">مدیریت کاربران زیرمجموعه</h2>
                <Button variant="secondary" className="w-auto" onClick={handleAddUser}>+ افزودن کاربر جدید</Button>
            </div>
            
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-sm font-medium text-gray-500 tracking-wider text-right">نام کاربری</th>
                            <th className="px-6 py-3 text-sm font-medium text-gray-500 tracking-wider text-right">نقش</th>
                            <th className="px-6 py-3 text-sm font-medium text-gray-500 tracking-wider text-right">عملیات</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {users?.map((subUser: any) => (
                            <tr key={subUser.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{subUser.username}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{subUser.agency_role?.name || 'تعریف نشده'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <Button variant="link" className="w-auto me-2">ویرایش</Button>
                                    <Button variant="danger" className="w-auto">حذف</Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// --- Main Dashboard Page ---
const AgencyDashboardPage: React.FC = () => {
    const { isAuthenticated, user, loading: authLoading } = useAuth(); 
    const router = useRouter();
    
    // فرض می‌کنیم اگر کاربر احراز هویت شد، آبجکت user دارای agency_role باشد.
    const isAgencyUser = user && user.agency_role; 

    // Fetch Report Data
    const { data: report, isLoading: isReportLoading, error: reportError } = useQuery({
        queryKey: ['agencyReport'],
        queryFn: getAgencyReport,
        enabled: isAuthenticated && isAgencyUser, // فقط اگر کاربر آژانسی بود، API فراخوانی شود
    });

    if (authLoading || isReportLoading) {
        return <MainLayout>در حال بارگذاری داشبورد...</MainLayout>;
    }
    
    // Authorization Check
    if (!isAuthenticated || !isAgencyUser) {
        // هدایت کاربر غیر آژانسی به صفحه اصلی یا ورود
        router.push('/'); 
        return null;
    }

    if (reportError) {
         return <MainLayout>خطا در دریافت گزارش: {reportError.message}</MainLayout>;
    }

    return (
        <MainLayout>
            <h1 className="text-4xl font-extrabold mb-10 border-b pb-4 text-gray-800">داشبورد آژانس</h1>
            
            {/* بخش گزارش مالی (G4.5) */}
            {report && <FinancialReport report={report} />}
            
            {/* بخش مدیریت کاربران (G4.6) */}
            <div className="mt-10">
                <UserManagement user={user} /> 
            </div>
            
        </MainLayout>
    );
};

export default AgencyDashboardPage;