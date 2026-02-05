// src/pages/register.tsx
// version: 2.0.0
// FEATURE: Replaced Username with Mobile Number.
// FEATURE: Implemented Auto-Login after successful registration.

import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link'; 
import { useAuth } from '../hooks/useAuth';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

// Updated interface: username removed, mobile added
interface RegisterFormData {
  mobile: string;
  email: string;
  first_name: string;
  last_name: string;
  password: string;
  password2: string;
}

const RegisterPage = () => {
  const [formData, setFormData] = useState<RegisterFormData>({
    mobile: '',
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
      const finalPayload = {
        ...formData,
        agency: null,      
        agency_role: null, 
      };
      
      // Call register API
      const response = await register(finalPayload); 
      
      // --- AUTO LOGIN LOGIC ---
      if (response && response.token) {
          // Assuming useAuth or the app handles token storage via context if we call a login success method.
          // Since useAuth implementation isn't fully visible here (it was imported), 
          // we act based on standard practices: Store token manually or rely on context.
          // If you are using Context/Cookies in useAuth, ensure it picks this up.
          // Here, we simulate a successful login redirection.
          
          // If your useAuth handles storage automatically upon login but not register, 
          // you might need to manually set it here or trigger a login action.
          // For now, we assume the user needs to be redirected to home.
          localStorage.setItem('token', response.token); // Fallback storage
          window.dispatchEvent(new Event("storage")); // Notify listeners if any
          
          router.push('/'); 
      } else {
          // Fallback to login page if no token returned
          router.push('/login?registered=true');
      }

    } catch (err: unknown) { 
      const axiosError = err as { 
          message?: string, 
          response?: { data?: { error?: string } | { [key: string]: unknown } } 
      };
      const apiErrors = axiosError.response?.data;
      
      let errorMessage = 'خطا در ثبت نام. لطفاً اطلاعات را بررسی کنید.';
      
      if (typeof apiErrors === 'object' && apiErrors !== null && !Array.isArray(apiErrors)) {
          const isValidationError = !('error' in apiErrors) && Object.keys(apiErrors).length > 0;
          
          if (isValidationError) {
              // Handle field errors (e.g., mobile already exists)
              const detail = Object.values(apiErrors).flat().join(' | ');
              if (detail) {
                  errorMessage = detail;
              }
          } 
          else if (typeof (apiErrors as { error?: string }).error === 'string') {
              errorMessage = (apiErrors as { error: string }).error;
          }
      } else {
          errorMessage = axiosError.message || errorMessage;
      }

      setError(errorMessage);
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
            {/* Changed from Username to Mobile */}
            <Input 
                label="شماره موبایل" 
                name="mobile" 
                type="text" 
                placeholder="09..."
                required 
                onChange={handleChange} 
                value={formData.mobile} 
            />
            <Input label="ایمیل" name="email" type="email" required onChange={handleChange} value={formData.email} />
            <Input label="نام" name="first_name" type="text" required onChange={handleChange} value={formData.first_name} />
            <Input label="نام خانوادگی" name="last_name" type="text" required onChange={handleChange} value={formData.last_name} />
            <Input label="رمز عبور" name="password" type="password" required onChange={handleChange} value={formData.password} />
            <Input label="تکرار رمز عبور" name="password2" type="password" required onChange={handleChange} value={formData.password2} />
          </div>
          
          <div className="pt-2">
            <Button type="submit" disabled={loading}>
              {loading ? 'در حال ثبت نام...' : 'ثبت نام'}
            </Button>
          </div>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          قبلاً ثبت نام کرده‌اید؟ 
          <Link href="/login" legacyBehavior>
            <a className="font-medium text-primary-brand hover:underline mr-1">
              ورود
            </a>
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
