// src/pages/register.tsx
import { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../hooks/useAuth';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    password: '',
    password2: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { register } = useAuth();
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (formData.password !== formData.password2) {
      setError('رمز عبور و تکرار آن یکسان نیستند.');
      setLoading(false);
      return;
    }

    try {
      await register(formData);
      // هدایت به صفحه اصلی یا ورود پس از موفقیت
      router.push('/login?registered=true');
    } catch (err: any) {
      // نمایش خطاهای اعتبارسنجی از API (مانند username تکراری یا password نامعتبر)
      setError(err.message || 'خطا در ثبت نام. لطفاً اطلاعات را بررسی کنید.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="w-full max-w-lg bg-white p-8 shadow-lg rounded-lg border border-gray-200" dir="rtl">
        <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">ثبت نام کاربر جدید</h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 border border-red-400 rounded-md">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="نام کاربری" name="username" type="text" required onChange={handleChange} />
            <Input label="ایمیل" name="email" type="email" required onChange={handleChange} />
            <Input label="نام" name="first_name" type="text" required onChange={handleChange} />
            <Input label="نام خانوادگی" name="last_name" type="text" required onChange={handleChange} />
            <Input label="رمز عبور" name="password" type="password" required onChange={handleChange} />
            <Input label="تکرار رمز عبور" name="password2" type="password" required onChange={handleChange} />
          </div>
          
          <div className="pt-2">
            <Button type="submit" disabled={loading}>
              {loading ? 'در حال ثبت نام...' : 'ثبت نام'}
            </Button>
          </div>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          قبلاً ثبت نام کرده‌اید؟ 
          <a href="/login" className="font-medium text-primary-brand hover:underline mr-1">
            ورود
          </a>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;