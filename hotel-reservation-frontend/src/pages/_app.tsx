// FILE: src/pages/_app.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { AppProps } from 'next/app';
import { AuthProvider } from '../hooks/useAuth';
import { BookingProvider } from '../context/BookingContext'; // IMPORT ADDED

import '../styles/globals.css';

const queryClient = new QueryClient();

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <QueryClientProvider client={queryClient}>
        <AuthProvider>
            {/* WRAPPER ADDED: BookingProvider handles global cart state */}
            <BookingProvider>
                <Component {...pageProps} />
            </BookingProvider>
        </AuthProvider>
    </QueryClientProvider>
  );
}

export default MyApp;
