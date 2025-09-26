// src/components/ui/Input.tsx (Placeholder)
// از کلاس ms-* (margin-start) و me-* (margin-end) برای RTL استفاده می‌کند.
export const Input = ({ label, ...props }) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <input
      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-brand focus:border-primary-brand"
      dir="rtl"
      {...props}
    />
  </div>
);

// src/components/ui/Button.tsx (Placeholder)
// از رنگ تعریف شده primary-brand استفاده می‌کند.
export const Button = ({ children, ...props }) => (
  <button
    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-brand hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-brand"
    {...props}
  >
    {children}
  </button>
);

// src/hooks/useAuth.ts (Placeholder برای استفاده در صفحات)
export const useAuth = () => {
    // توابع authService.login و authService.register را فراخوانی می‌کند.
    const login = (data: any) => { /* منطق فراخوانی login و ذخیره توکن */ console.log("Login Attempt:", data); return Promise.resolve(true); };
    const register = (data: any) => { /* منطق فراخوانی register و ذخیره توکن */ console.log("Register Attempt:", data); return Promise.resolve(true); };
    return { login, register, isAuthenticated: false };
};