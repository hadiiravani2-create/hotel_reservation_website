// src/pages/admin/login.tsx
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/router';
import { Lock, User, AlertCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function AdminLogin() {
  const { login, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // اگر کاربر از قبل لاگین است، هدایت شود به داشبورد
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace('/admin');
    }
  }, [isAuthenticated, isLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      // فراخوانی متد لاگین از هوک useAuth
      await login(formData);
      // ریدایرکت پس از موفقیت
      router.push('/admin');
    } catch (err: any) {
      console.error(err);
      setError('نام کاربری یا رمز عبور اشتباه است.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || isAuthenticated) {
    return null; // جلوگیری از پرش صفحه
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 font-vazir relative overflow-hidden">
      
      {/* Background Shapes (Optional for styling) */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-600/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-purple-600/20 rounded-full blur-3xl"></div>

      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden z-10 mx-4">
        
        {/* Header */}
        <div className="bg-slate-50 p-8 text-center border-b border-slate-100">
          <div className="w-16 h-16 bg-blue-600 rounded-xl mx-auto flex items-center justify-center mb-4 shadow-lg shadow-blue-500/30">
            <Lock className="text-white" size={32} />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">ورود به پنل مدیریت</h1>
          <p className="text-slate-500 text-sm mt-2">سامانه رزرو هتل میری سفر</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-center gap-2 border border-red-100">
              <AlertCircle size={18} />
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 block text-right">نام کاربری</label>
            <div className="relative">
              <input 
                type="text"
                required
                className="w-full pl-4 pr-10 py-3 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-right dir-rtl"
                placeholder="نام کاربری خود را وارد کنید"
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value})}
              />
              <User className="absolute right-3 top-3.5 text-slate-400" size={20} />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 block text-right">رمز عبور</label>
            <div className="relative">
              <input 
                type="password"
                required
                className="w-full pl-4 pr-10 py-3 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-right dir-rtl"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
              <Lock className="absolute right-3 top-3.5 text-slate-400" size={20} />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-lg transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>در حال بررسی...</span>
              </>
            ) : (
              <>
                <span>ورود امن</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div className="bg-slate-50 p-4 text-center border-t border-slate-100">
          <Link href="/" className="text-sm text-slate-500 hover:text-blue-600 transition-colors">
            بازگشت به صفحه اصلی سایت
          </Link>
        </div>
      </div>
    </div>
  );
}
