// src/components/ProtectedRoute.tsx
'use client';

import { useAuth } from './AuthProvider';
import { useRouter } from 'next/navigation';
import { useEffect, ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      // Redirect after a short delay to show the warning
      const timer = setTimeout(() => {
        router.push('/');
      }, 3200);
      return () => clearTimeout(timer);
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-green-900 to-emerald-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400 mx-auto mb-4"></div>
          <p className="text-white">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-green-900 to-emerald-900 flex items-center justify-center">
        <div className="bg-emerald-900/95 border border-emerald-700/50 rounded-3xl shadow-2xl p-8 max-w-md mx-4 text-center backdrop-blur-sm">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-4 h-4 bg-green-400 rounded-full animate-pulse"></div>
            <div className="text-6xl">🔒</div>
            <div className="w-4 h-4 bg-green-400 rounded-full animate-pulse"></div>
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Authentication Required</h2>
          <p className="text-emerald-300 mb-6">
            You need to log in to access this page. Please sign in to continue.
          </p>
          <button
            onClick={() => router.push('/')}
            className="bg-emerald-600 text-white px-6 py-3 rounded-2xl hover:bg-emerald-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
          >
            Sign-In
          </button>
          <p className="text-sm text-emerald-400 mt-4">Redirecting in a moment...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
