// src/components/ClientProviders.tsx
'use client';

import { AuthProvider } from './AuthProvider';
import { ThemeProvider } from './ThemeProvider';

interface ClientProvidersProps {
  children: React.ReactNode;
}

export function ClientProviders({ children }: ClientProvidersProps) {
  return (
    <ThemeProvider>
      <AuthProvider>
        {children}
      </AuthProvider>
    </ThemeProvider>
  );
}
