"use client";

import React, { useState, useEffect } from 'react';
import { useTheme } from '@/components/ThemeProvider';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import ThreeBackground from '@/components/ui/ThreeBackground';
import DecorativeElements from '@/components/ui/DecorativeElements';
import Footer from '@/components/ui/Footer';
import AdminHeader from '@/components/admin/AdminHeader';
import AdminMetrics from '@/components/admin/AdminMetrics';
import UploadManager from '@/components/admin/UploadManager';
import VerificationQueue from '@/components/admin/VerificationQueue';
import RecentUploads from '@/components/admin/RecentUploads';
import AuditLogPanel from '@/components/admin/AuditLogPanel';
import SystemStatus from '@/components/admin/SystemStatus';
import UserManagement from '@/components/admin/UserManagement';
import GlassCard from '@/components/ui/GlassCard';
import { DEFAULT_STATE, DEFAULT_DISTRICT } from '@/lib/regions';

export default function AdminPage() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  const isLight = mounted && theme === 'light';
  // sample metrics (will be replaced by live API data in future iterations)
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<any>({ kpis: null, assetsData: null });

  useEffect(() => {
    let mounted = true;
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [kpisRes, claimsRes, assetsRes] = await Promise.allSettled([
          fetch('/api/dashboard/kpis'),
          fetch('/api/claims?status=all'),
          fetch(`/api/atlas/assets?state=${DEFAULT_STATE}&district=${DEFAULT_DISTRICT}`)
        ]);

        const kpis = kpisRes.status === 'fulfilled' ? await kpisRes.value.json() : null;
        const claims = claimsRes.status === 'fulfilled' ? await claimsRes.value.json() : null;
        const assetsData = assetsRes.status === 'fulfilled' ? await assetsRes.value.json() : null;

        if (mounted) setDashboardData({ kpis, claims, assetsData });
      } catch (err: any) {
        if (mounted) setError(err?.message || 'Failed to load admin metrics');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchData();
    return () => { mounted = false; };
  }, []);

  // derive metrics from live data
  const metrics = React.useMemo(() => {
    const apiKpis = dashboardData.kpis ?? {};
    const claimsData = dashboardData.claims;
    const assetsData = dashboardData.assetsData;

    const totalClaims = claimsData?.features?.length ?? 0;
    const grantedCount = claimsData?.features?.filter((f: any) => f?.properties?.status === 'granted').length ?? 0;
    const uniqueVillages = claimsData?.features ? new Set(claimsData.features.map((f: any) => f?.properties?.village).filter(Boolean)).size : 0;
    const assetsCount = assetsData?.features?.length ?? apiKpis.assets ?? 0;

    const parseNumber = (v: any) => {
      if (v == null) return null;
      if (typeof v === 'number') return v;
      if (typeof v === 'string') return Number(v.replace(/[^0-9.-]+/g, '')) || null;
      const n = Number(v);
      return Number.isFinite(n) ? n : null;
    };

    const claimsNum = parseNumber(apiKpis.claims) ?? totalClaims;
    const grantsNum = parseNumber(apiKpis.grants) ?? grantedCount;
    const assetsNum = parseNumber(apiKpis.assets) ?? assetsCount;
    const priorityNum = parseNumber(apiKpis.priorityVillages) ?? uniqueVillages;

    const formatTrend = (v: any) => v == null ? '\u2014' : (typeof v === 'string' ? v : (v > 0 ? `+${v}%` : `${v}%`));

    const claimsTrend = apiKpis.claimsTrend ?? apiKpis.claims_change_pct ?? '\u2014';
    const grantsTrend = apiKpis.grantsTrend ?? apiKpis.grants_change_pct ?? '\u2014';
    const assetsTrend = apiKpis.assetsTrend ?? apiKpis.assets_change_pct ?? '\u2014';
    const priorityTrend = apiKpis.priorityTrend ?? apiKpis.priority_change_pct ?? '\u2014';

    return [
      { label: 'Claims processed', value: claimsNum, trend: formatTrend(claimsTrend) },
      { label: 'Grants issued', value: grantsNum, trend: formatTrend(grantsTrend) },
      { label: 'AI assets', value: assetsNum, trend: formatTrend(assetsTrend) },
      { label: 'Priority villages', value: priorityNum, trend: formatTrend(priorityTrend) },
    ];
  }, [dashboardData]);

  const displayedMetrics = loading ? [
    { label: 'Claims processed', value: 'Loading…', trend: '\u2014' },
    { label: 'Grants issued', value: 'Loading…', trend: '\u2014' },
    { label: 'AI assets', value: 'Loading…', trend: '\u2014' },
    { label: 'Priority villages', value: 'Loading…', trend: '\u2014' },
  ] : metrics;

  return (
    <ProtectedRoute>
      <div className={
        `min-h-screen relative overflow-hidden ${isLight ?
          'bg-gradient-to-br from-emerald-50 via-green-100 to-teal-100 text-slate-900' :
          'bg-gradient-to-br from-slate-900 via-green-900 to-emerald-900 text-white'}`
      }>
        <ThreeBackground />
        <DecorativeElements />

        {/* Mesh Gradient Overlay */}
        <div className={isLight ? "fixed inset-0 bg-gradient-to-br from-white/40 via-transparent to-emerald-100/20 pointer-events-none z-1" : "fixed inset-0 bg-gradient-to-br from-green-900/20 via-transparent to-emerald-900/20 pointer-events-none z-1"} />

        {/* Animated Grid */}
        <div className={isLight ? "fixed inset-0 opacity-10 pointer-events-none z-1" : "fixed inset-0 opacity-10 pointer-events-none z-1"}>
          <div className="absolute inset-0" style={{
            backgroundImage: isLight ? `linear-gradient(rgba(16, 185, 129, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(16, 185, 129, 0.05) 1px, transparent 1px)` : `linear-gradient(rgba(34, 197, 94, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(34, 197, 94, 0.1) 1px, transparent 1px)`,
            backgroundSize: '50px 50px'
          }} />
        </div>


        <AdminHeader title="Admin Dashboard" subtitle="Manage uploads, verification, users & system status" isLight={isLight} />


        <main className={`relative z-10 w-full max-w-full 2xl:max-w-full mx-auto px-2 sm:px-4 md:px-8 lg:px-12  ${isLight ? 'text-slate-900' : 'text-white'}`}>

          <section className="mb-8">
            {error && (
              <div className={`mb-4 p-4 rounded-md ${isLight ? 'bg-red-50 border border-red-200 text-red-800' : 'bg-red-900/30 border-red-700 text-red-200'}`}>
                Failed to load metrics: {error}
              </div>
            )}
            <AdminMetrics metrics={displayedMetrics} isLight={isLight} />
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 space-y-6">
              <UploadManager isLight={isLight} />
              <VerificationQueue isLight={isLight} />
              <RecentUploads isLight={isLight} />
            </div>

            <aside className="lg:col-span-4 space-y-6">
              <SystemStatus isLight={isLight} />
              <AuditLogPanel isLight={isLight} />
              <UserManagement isLight={isLight} />
            </aside>
          </div>
        </main>

        <Footer />
      </div>
    </ProtectedRoute>
  );
}
