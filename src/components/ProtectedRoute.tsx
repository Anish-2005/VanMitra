// src/components/ProtectedRoute.tsx
'use client';

import { useAuth } from './AuthProvider';
import { useRouter } from 'next/navigation';
import { useEffect, ReactNode, useState } from 'react';
import { useTheme } from './ThemeProvider';

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const id = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(id);
  }, []);
  const isLight = mounted && theme === 'light';
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      // Redirect after a short delay to show the warning
      const timer = setTimeout(() => {
        router.push('/');
      }, 3200);
      return () => clearTimeout(timer);
    } else {
      return;
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        isLight 
          ? 'bg-gradient-to-br from-white via-emerald-50 to-green-50' 
          : 'bg-gradient-to-br from-emerald-900 via-green-900 to-emerald-900'
      }`}>
        <div className="text-center">
          <div className={`animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4 ${
            isLight ? 'border-green-600' : 'border-green-400'
          }`}></div>
          <p className={isLight ? 'text-slate-700' : 'text-white'}>Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        isLight 
          ? 'bg-gradient-to-br from-white via-emerald-50 to-green-50' 
          : 'bg-gradient-to-br from-emerald-900 via-green-900 to-emerald-900'
      }`}>
        <div className={`rounded-3xl shadow-2xl p-8 max-w-md mx-4 text-center backdrop-blur-sm ${
          isLight 
            ? 'bg-white/95 border border-green-200/80' 
            : 'bg-emerald-900/95 border border-emerald-700/50'
        }`}>
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className={`w-4 h-4 rounded-full animate-pulse ${
              isLight ? 'bg-green-600' : 'bg-green-400'
            }`}></div>
            <div className="text-6xl">🔒</div>
            <div className={`w-4 h-4 rounded-full animate-pulse ${
              isLight ? 'bg-green-600' : 'bg-green-400'
            }`}></div>
          </div>
          <h2 className={`text-2xl font-bold mb-4 ${
            isLight ? 'text-slate-800' : 'text-white'
          }`}>Authentication Required</h2>
          <p className={`mb-6 ${
            isLight ? 'text-slate-600' : 'text-emerald-300'
          }`}>
            You need to log in to access this page. Please sign in to continue.
          </p>
          <button
            onClick={() => router.push('/')}
            className={`px-6 py-3 rounded-2xl transition-all duration-200 font-medium shadow-lg hover:shadow-xl ${
              isLight 
                ? 'bg-green-600 text-white hover:bg-green-700' 
                : 'bg-emerald-600 text-white hover:bg-emerald-700'
            }`}
          >
            Sign-In
          </button>
          <p className={`text-sm mt-4 ${
            isLight ? 'text-green-600' : 'text-emerald-400'
          }`}>Redirecting in a moment...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}