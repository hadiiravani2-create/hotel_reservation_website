// src/pages/login.tsx
// version: 1.1.0
// CHANGE: Updated label to "Mobile or Email".

import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link'; 
import { useAuth } from '../hooks/useAuth'; 
import { Input } from '../components/ui/Input'; 
import { Button } from '../components/ui/Button'; 

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
      // Backend now accepts mobile or email in the 'username' field
      await login({ username, password });
      router.push((router.query.next as string) || '/');
    } catch (err: unknown) { 
      const axiosError = err as { message?: string, response?: { data?: { error?: string } } };
      const errorMessage = axiosError.response?.data?.error || axiosError.message || 'خطا در ورود به سیستم.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.id === 'username') {
        setUsername(e.target.value);
    } else if (e.target.id === 'password') {
        setPassword(e.target.value);
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
            label="شماره موبایل یا ایمیل" // CHANGED LABEL
            id="username"
            name="username" 
            type="text"
            required
            value={username}
            onChange={handleInputChange} 
            placeholder="مثال: 0912..."
          />
          <Input 
            label="رمز عبور"
            id="password"
            name="password" 
            type="password"
            required
            value={password}
            onChange={handleInputChange} 
          />
          
          <div className="mt-6">
            <Button type="submit" disabled={loading}>
              {loading ? 'در حال ورود...' : 'ورود'}
            </Button>
          </div>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          حساب کاربری ندارید؟ 
          <Link href="/register" legacyBehavior> 
            <a className="font-medium text-primary-brand hover:underline mr-1">
              ثبت نام کنید
            </a>
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
