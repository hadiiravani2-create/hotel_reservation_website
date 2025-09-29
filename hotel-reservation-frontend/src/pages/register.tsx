// src/pages/register.tsx v1.0.4
import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link'; // Import Link for internal routing
import { useAuth } from '../hooks/useAuth';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

// Define the required interface for form data (excluding password2 for API call if separate)
interface RegisterFormData {
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  password: string;
  password2: string;
}

const RegisterPage = () => {
  const [formData, setFormData] = useState<RegisterFormData>({
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => { // Explicitly typed the event
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
      // FIX FOR 400 ERROR (Backend requires agency/agency_role even if null)
      const finalPayload = {
        ...formData,
        agency: null,      // Explicitly set null for normal users
        agency_role: null, // Explicitly set null for normal users
      };
      
      // API expects all fields, including password2 for validation in the backend (e.g., Django)
      await register(finalPayload); 
      // Redirect to login page after successful registration
      router.push('/login?registered=true');
    } catch (err: unknown) { 
      // FIX for TypeScript compiler error and 400 details
      const axiosError = err as { 
          message?: string, 
          response?: { data?: { error?: string } | { [key: string]: unknown } } 
      };
      const apiErrors = axiosError.response?.data;
      
      let errorMessage = 'خطا در ثبت نام. لطفاً اطلاعات را بررسی کنید.';
      
      if (typeof apiErrors === 'object' && apiErrors !== null && !Array.isArray(apiErrors)) {
          // Case 1: DRF Validation error ({field: ["error"]})
          // Check if it looks like a validation error map (e.g., has keys that aren't just 'error')
          const isValidationError = !('error' in apiErrors) && Object.keys(apiErrors).length > 0;
          
          if (isValidationError) {
              // Extract and display detailed validation error
              const detail = Object.values(apiErrors).flat().join(' | ');
              if (detail) {
                  errorMessage = 'اعتبارسنجی ناموفق: ' + detail;
              }
          } 
          // Case 2: Simple error object that might contain { "error": "..." } (FIXED COMPILE ERROR HERE)
          else if (typeof (apiErrors as { error?: string }).error === 'string') {
              errorMessage = (apiErrors as { error: string }).error;
          }
          
      } else {
          // Fallback: Axios message or generic error message
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
            <Input label="نام کاربری" name="username" type="text" required onChange={handleChange} value={formData.username} />
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
