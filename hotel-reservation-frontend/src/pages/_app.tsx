// src/pages/_app.tsx

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { AppProps } from 'next/app';
// *اطمینان حاصل کنید که مسیر و نام فایل صحیح است.*
// اگر از Pages Router استفاده می‌کنید، مسیر نسبی باید درست باشد
import { AuthProvider } from '../hooks/useAuth'; // (یا '.. /hooks/useAuth.tsx' اگر پسوند ضروری باشد)

// فرض می‌کنیم globals.css و QueryClientProvider درست تنظیم شده‌اند
import '../app/globals.css'; 

const queryClient = new QueryClient();

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <QueryClientProvider client={queryClient}>
        {/* AuthProvider باید Component را در بر بگیرد */}
        <AuthProvider> 
            <Component {...pageProps} />
        </AuthProvider>
    </QueryClientProvider>
  );
}

export default MyApp;