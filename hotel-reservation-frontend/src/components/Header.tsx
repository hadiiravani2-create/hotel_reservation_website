// src/components/Header.tsx
import { useQuery } from '@tanstack/react-query';
import { getSiteSettings } from '../api/coreService';

function Header() {
  // واکشی داده با React Query. کلید 'siteSettings' برای caching استفاده می شود.
  const { data: settings, isLoading, error } = useQuery({
    queryKey: ['siteSettings'],
    queryFn: getSiteSettings,
  });

  if (isLoading) return <div>در حال بارگذاری...</div>;
  if (error) return <div>خطا: {error.message}</div>;

  return (
    <header>
      <h1>{settings.site_name}</h1>
      {/* از داده ها برای نمایش UI استفاده کنید */}
    </header>
  );
}
export default Header;