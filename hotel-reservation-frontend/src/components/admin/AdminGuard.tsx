// src/components/admin/AdminGuard.tsx
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

export const AdminGuard = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading, user } = useAuth(); // فرض بر این است که user نقش را هم دارد
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        // اگر لاگین نیست، بروت به صفحه ورود ادمین
        router.push('/admin/login');
      } else {
        // اینجا می‌توانید چک کنید که آیا user.is_staff یا user.role === 'admin' است
        // فعلاً فرض می‌کنیم هر کس لاگین کرد دسترسی دارد (برای تست)
        setAuthorized(true);
      }
    }
  }, [isAuthenticated, isLoading, router, user]);

  if (isLoading || !authorized) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return <>{children}</>;
};
