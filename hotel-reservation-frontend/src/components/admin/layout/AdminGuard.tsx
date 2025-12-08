// src/components/admin/layout/AdminGuard.tsx
import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/hooks/useAuth'; // فرض بر این است که این هوک وجود دارد

interface AdminGuardProps {
  children: React.ReactNode;
}

const AdminGuard: React.FC<AdminGuardProps> = ({ children }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // صبر می‌کنیم تا وضعیت لودینگ تمام شود
    if (!isLoading) {
      // ۱. اگر لاگین نیست -> برود به لاگین
      if (!isAuthenticated || !user) {
        router.replace(`/auth/login?next=${router.asPath}`);
      } 
      // ۲. اگر لاگین است اما ادمین نیست -> برود به صفحه اصلی (یا صفحه ۴۰۳)
      else if (!user.is_staff) {
        // می‌توانید یک صفحه "دسترسی غیرمجاز" بسازید
        router.replace('/'); 
      }
    }
  }, [user, isAuthenticated, isLoading, router]);

  // تا زمانی که وضعیت مشخص نیست، لودینگ نشان بده (تا صفحه نپرد)
  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-50">
        <div className="animate-spin w-10 h-10 border-4 border-primary-brand border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // اگر همه چیز اوکی بود (لاگین + ادمین)، محتوا را نشان بده
  if (isAuthenticated && user?.is_staff) {
    return <>{children}</>;
  }

  // در حالت‌های در حال ریدایرکت، چیزی نشان نده
  return null;
};

export default AdminGuard;
