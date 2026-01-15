// src/components/ClientProviders.tsx
'use client';

import { AuthProvider } from './AuthProvider';
import { ThemeProvider } from './ThemeProvider';
import { useEffect } from 'react';
import { collectAndSendNavTiming } from '@/lib/telemetry';

interface ClientProvidersProps {
  children: React.ReactNode;
}

export function ClientProviders({ children }: ClientProvidersProps) {
  useEffect(() => {
    // Register service worker for caching
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('Service Worker registered successfully:', registration);
        })
        .catch((error) => {
          console.log('Service Worker registration failed:', error);
        });
    }

    // Collect and send navigation timing telemetry (non-blocking)
    if ('performance' in window) {
      try {
        collectAndSendNavTiming();
      } catch (err) {
        console.warn('Telemetry collection failed', err);
      }
    }
  }, []);

  return (
    <ThemeProvider>
      <AuthProvider>
        {children}
      </AuthProvider>
    </ThemeProvider>
  );
}
