// src/pages/login.tsx
import { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../hooks/useAuth'; // فرض می‌کنیم این هوک پیاده‌سازی شده
import { Input } from '../components/ui/Input'; // کامپوننت ورودی پایه
import { Button } from '../components/ui/Button'; // کامپوننت دکمه پایه

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login({ username, password });
      // هدایت به صفحه اصلی پس از موفقیت
      router.push('/');
    } catch (err: any) {
      // نمایش خطا از API (مانند 'نام کاربری یا رمز عبور اشتباه است')
      setError(err.message || 'خطا در ورود به سیستم.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md bg-white p-8 shadow-lg rounded-lg border border-gray-200" dir="rtl">
        <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">ورود به سامانه</h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 border border-red-400 rounded-md">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <Input 
            label="نام کاربری"
            id="username"
            type="text"
            required
            value={username}
            onChange={(e:any) => setUsername(e.target.value)}
          />
          <Input 
            label="رمز عبور"
            id="password"
            type="password"
            required
            value={password}
            onChange={(e:any) => setPassword(e.target.value)}
          />
          
          <div className="mt-6">
            <Button type="submit" disabled={loading}>
              {loading ? 'در حال ورود...' : 'ورود'}
            </Button>
          </div>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          حساب کاربری ندارید؟ 
          <a href="/register" className="font-medium text-primary-brand hover:underline mr-1">
            ثبت نام کنید
          </a>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;