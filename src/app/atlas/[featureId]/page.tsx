"use client";

import React from 'react';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/ProtectedRoute';

export default function FeaturePage({ params }: { params: { featureId: string } }) {
  // in a real app we'd fetch feature details by id; here we render placeholder
  const { featureId } = params;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-green-100 p-8">
        <div className="max-w-3xl mx-auto bg-white p-6 rounded-lg shadow">
          <h1 className="text-2xl font-bold text-green-900">Feature details — {featureId}</h1>
          <p className="mt-2 text-sm text-green-700">This is a placeholder detail page for feature <strong>{featureId}</strong>. Replace with real fetch/SSR as needed.</p>
          <div className="mt-4">
            <Link href="/atlas" className="text-sm text-green-600">← Back to Atlas</Link>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
