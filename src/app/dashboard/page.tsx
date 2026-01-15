"use client";

import React, { useMemo, useState, useEffect, useRef } from "react";
import { useTheme } from "@/components/ThemeProvider";
import { STATES, DEFAULT_STATE, DEFAULT_DISTRICT } from '../../lib/regions';
import { motion, HTMLMotionProps } from "framer-motion";
import { Database, Target, Satellite, FileText } from "lucide-react";
import dynamic from 'next/dynamic';
import DecorativeElements from "@/components/ui/DecorativeElements";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import Link from "next/link";
import GlassCard from "@/components/ui/GlassCard";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuth } from "@/components/AuthProvider";
// Lazy-load firebase auth to avoid bundling it in initial client JS
import { GISLayer, GISMarker, WebGISRef } from "../../components/WebGIS";
import { createGeoJSONPoint, exportToGeoJSON } from "../../lib/gis-utils";
import KPISection from "../../components/dashboard/KPISection";
import QuickActionsSection from "../../components/dashboard/QuickActionsSection";
import RecentActivitySection from "../../components/dashboard/RecentActivitySection";
import SystemStatusSection from "../../components/dashboard/SystemStatusSection";
import WelcomeSection from "../../components/dashboard/WelcomeSection";

const DataVisualizationSection = dynamic(() => import('../../components/dashboard/DataVisualizationSection'));
const PlatformOverviewSection = dynamic(() => import('../../components/dashboard/PlatformOverviewSection'));
const MapSection = dynamic(() => import('../../components/dashboard/MapSection'), { ssr: false, loading: () => <div className="w-full h-96 bg-gray-100 dark:bg-gray-800 rounded-lg" /> });
import DashboardLoadingState from "../../components/dashboard/DashboardLoadingState";
import RecommendationModal from "../../components/dashboard/RecommendationModal";

// Dynamically import heavy components to reduce initial bundle size
const ThreeBackground = dynamic(() => import('@/components/ui/ThreeBackground'), {
  ssr: false,
  loading: () => null
});
const WebGIS = dynamic(() => import("../../components/WebGIS"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-96 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
      <div className="text-gray-500 dark:text-gray-400">Loading map...</div>
    </div>
  )
});
const LayerManager = dynamic(() => import("../../components/LayerManager"), { ssr: false });

function Sparkline({ data, width = 160, height = 40 }: { data: number[]; width?: number; height?: number }) {
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const points = data
    .map((d, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - ((d - min) / (max - min || 1)) * height;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg width={width} height={height} aria-hidden>
      <polyline fill="none" stroke="#16a34a" strokeWidth={2} points={points} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function Dashboard() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const id = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(id);
  }, []);
  const isLight = mounted && theme === 'light';

  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<{
    kpis: any | null;
    recommendations: any[];
    fraData: any | null;
    assetsData: any | null;
    boundariesData: any | null;
  }>({
    kpis: null,
    recommendations: [],
    fraData: null,
    assetsData: null,
    boundariesData: null
  });

  const [stateFilter, setStateFilter] = useState<string>(DEFAULT_STATE);
  const [districtFilter, setDistrictFilter] = useState<string>(DEFAULT_DISTRICT);
  const [villageQuery, setVillageQuery] = useState<string>("");
  const [filtersCollapsed, setFiltersCollapsed] = useState<boolean>(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);

        const [kpisRes, recommendationsRes, fraRes, assetsRes, boundariesRes] = await Promise.allSettled([
          fetch("/api/dashboard/kpis"),
          fetch("/api/dashboard/recommendations"),
          fetch(`/api/atlas/fra?state=${DEFAULT_STATE}&district=${DEFAULT_DISTRICT}`),
          fetch(`/api/atlas/assets?state=${DEFAULT_STATE}&district=${DEFAULT_DISTRICT}`),
          fetch(`/api/atlas/boundaries?state=${DEFAULT_STATE}&district=${DEFAULT_DISTRICT}`)
        ]);

        const kpis = kpisRes.status === 'fulfilled' ? await kpisRes.value.json() : null;
        const recommendations = recommendationsRes.status === 'fulfilled' ? await recommendationsRes.value.json() : [];
        const fraData = fraRes.status === 'fulfilled' ? await fraRes.value.json() : null;
        const assetsData = assetsRes.status === 'fulfilled' ? await assetsRes.value.json() : null;
        const boundariesData = boundariesRes.status === 'fulfilled' ? await boundariesRes.value.json() : null;

        setDashboardData({
          kpis,
          recommendations,
          fraData,
          assetsData,
          boundariesData
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleLogout = async () => {
    try {
      const [{ signOut }, { auth }] = await Promise.all([
        import('firebase/auth'),
        import('@/lib/firebase')
      ]);
      await signOut(auth);
    } catch (err) {
      console.error('Logout failed', err);
    }
  };

  const filtered = useMemo(() => {
    return dashboardData.recommendations.filter((r: any) => r.state === stateFilter && r.district === districtFilter && r.village.toLowerCase().includes(villageQuery.toLowerCase()));
  }, [dashboardData.recommendations, stateFilter, districtFilter, villageQuery]);

  const [layers, setLayers] = useState<GISLayer[]>([
    {
      id: 'fra-claims-dashboard',
      name: 'FRA Claims',
      type: 'geojson',
      url: `/api/atlas/fra?state=${DEFAULT_STATE}&district=${DEFAULT_DISTRICT}`,
      visible: true,
      style: {
        fillColor: '#16a34a',
        strokeColor: '#15803d',
        strokeWidth: 2,
        opacity: 0.7
      }
    },
    {
      id: 'village-boundaries-dashboard',
      name: 'Village Boundaries',
      type: 'geojson',
      url: `/api/atlas/boundaries?state=${DEFAULT_STATE}&district=${DEFAULT_DISTRICT}`,
      visible: true,
      style: {
        fillColor: '#fbbf24',
        strokeColor: '#d97706',
        strokeWidth: 2,
        opacity: 0.5
      }
    },
    {
      id: 'assets-dashboard',
      name: 'Asset Maps',
      type: 'geojson',
      url: `/api/atlas/assets?state=${DEFAULT_STATE}&district=${DEFAULT_DISTRICT}`,
      visible: true,
      style: {
        fillColor: '#3b82f6',
        strokeColor: '#1e40af',
        strokeWidth: 1,
        opacity: 0.8
      }
    }
  ]);

  {/* Define a mapping for strong button classes */ }
  const strongBtnClasses: Record<string, string> = {
    emerald: "bg-emerald-600 text-white shadow-md shadow-emerald-500/50 hover:shadow-lg hover:shadow-emerald-500/70 hover:scale-105",
    purple: "bg-purple-600 text-white shadow-md shadow-purple-500/50 hover:shadow-lg hover:shadow-purple-500/70 hover:scale-105",
    teal: "bg-teal-600 text-white shadow-md shadow-teal-500/50 hover:shadow-lg hover:shadow-teal-500/70 hover:scale-105",
  };


  const defaultCenter = STATES.find(s => s.name === DEFAULT_STATE)?.center ?? [78.9629, 22.9734];
  const [markers, setMarkers] = useState<GISMarker[]>([
    { id: 'marker-1', lng: defaultCenter[0] - 0.5, lat: defaultCenter[1] - 0.4, label: 'A', color: '#dc2626', popup: '<b>High Priority Village</b><br>Population: 1,200<br>FRA Claims: 45' },
    { id: 'marker-2', lng: defaultCenter[0] - 0.2, lat: defaultCenter[1] + 0.1, label: 'B', color: '#f59e0b', popup: '<b>Medium Priority Village</b><br>Population: 800<br>FRA Claims: 23' },
    { id: 'marker-3', lng: defaultCenter[0] + 0.3, lat: defaultCenter[1] - 0.1, label: 'C', color: '#16a34a', popup: '<b>Low Priority Village</b><br>Population: 600<br>FRA Claims: 12' }
  ]);

  const handleLayerToggle = (layerId: string) => {
    setLayers(prev => prev.map(layer =>
      layer.id === layerId ? { ...layer, visible: !layer.visible } : layer
    ));
  };

  const handleLayerAdd = (layer: GISLayer) => {
    setLayers(prev => [...prev, layer]);
  };

  const handleLayerRemove = (layerId: string) => {
    setLayers(prev => prev.filter(layer => layer.id !== layerId));
  };

  const handleLayerUpdate = (layerId: string, updates: Partial<GISLayer>) => {
    setLayers(prev => prev.map(layer =>
      layer.id === layerId ? { ...layer, ...updates } : layer
    ));
  };

  const handleFeatureClick = (featureInfo: any) => {
    console.log('Feature clicked:', featureInfo);
  };

  const handleExportMap = async () => {
    console.log('Starting map export...');
    try {
      if (webGISRef.current) {
        await webGISRef.current.exportMap();
        return;
      }
      alert('Map export initiated. Please use your browser\'s screenshot feature (Ctrl+Shift+S) to capture the map.');
    } catch (error) {
      try {
        console.error('Export failed:', error instanceof Error ? error.message : String(error));
      } catch (logError) {
        console.error('Export failed (could not log error details)');
      }
      alert('Export failed. Please try refreshing the page or taking a manual screenshot.');
    }
  };

  const handleMapClick = (lngLat: any) => {
    console.log('Map clicked at:', lngLat);
  };

  const [selected, setSelected] = useState<any | null>(null);
  const webGISRef = useRef<WebGISRef>(null);
  const stateCenter = STATES.find(s => s.name === stateFilter)?.center ?? STATES.find(s => s.name === DEFAULT_STATE)?.center ?? [78.9629, 22.9734];

  function downloadCSV(rows: any[]) {
    if (!rows || rows.length === 0) return;
    const keys = Object.keys(rows[0]);
    const csv = [keys.join(','), ...rows.map(r => keys.map(k => JSON.stringify(r[k] ?? '')).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'recommendations.csv';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  // dynamic claims stats (same pattern as /public page)
  const [claimsData, setClaimsData] = useState<any | null>(null);
  const [claimsLoading, setClaimsLoading] = useState(false);
  const [claimsError, setClaimsError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const fetchClaims = async () => {
      setClaimsLoading(true);
      setClaimsError(null);
      try {
        const res = await fetch('/api/claims?status=all');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (mounted) setClaimsData(json);
      } catch (err: any) {
        if (mounted) setClaimsError(err?.message || 'Failed to load claims');
      } finally {
        if (mounted) setClaimsLoading(false);
      }
    };
    fetchClaims();
    return () => { mounted = false; };
  }, []);

  const totalClaims = claimsData?.features?.length ?? 0;
  const grantedCount = claimsData?.features?.filter((f: any) => f?.properties?.status === 'granted').length ?? 0;
  const uniqueVillages = claimsData?.features ? new Set(claimsData.features.map((f: any) => f?.properties?.village).filter(Boolean)).size : 0;

  // Use API-provided time series if present. Do not fall back to a static sample to avoid constant trends.
  const timeSeries = dashboardData.kpis?.timeSeries ?? null;

  const kpis = useMemo(() => {
    // Helper to accept numbers or formatted strings like "1,240"
    const parseNumber = (v: any) => {
      if (v == null) return null;
      if (typeof v === 'number') return v;
      if (typeof v === 'string') {
        // strip commas and any non-numeric except dot and minus
        const cleaned = v.replace(/[^0-9.-]+/g, '');
        const n = Number(cleaned);
        return Number.isFinite(n) ? n : null;
      }
      const n = Number(v);
      return Number.isFinite(n) ? n : null;
    };

    const apiKpis = dashboardData.kpis ?? {};
    // Prefer live counts (claimsData / assetsData / computed filtered) to avoid stale constants
    const claimsNum = totalClaims ?? parseNumber(apiKpis.claims) ?? 0;
    const grantsNum = grantedCount ?? parseNumber(apiKpis.grants) ?? 0;
    const assetsNum = dashboardData.assetsData?.features?.length ?? parseNumber(apiKpis.assets) ?? 0;
    const priorityNum = filtered.length ?? parseNumber(apiKpis.priorityVillages) ?? 0;

    // compute percent change helper
    const computePct = (cur: number, prev: number) => {
      if (prev == null || prev === 0) return null;
      return Math.round(((cur - prev) / Math.abs(prev)) * 100);
    };

    const formatTrend = (v: number | string | null | undefined) => {
      if (v == null) return '\u2014';
      if (typeof v === 'string') return v;
      return (v > 0 ? `+${v}%` : `${v}%`);
    };

    // Prefer explicit API-provided trend values; otherwise derive from available time series
    let claimsTrend: string | number | null = apiKpis.claimsTrend ?? apiKpis.claims_change_pct ?? null;
    if (!claimsTrend) {
      // Only compute trend if a real timeSeries is provided by the API
      if (timeSeries && timeSeries.length >= 2) {
        const last = Number(timeSeries[timeSeries.length - 1]) ?? claimsNum;
        const prev = Number(timeSeries[timeSeries.length - 2]) ?? 0;
        const pct = computePct(last, prev);
        claimsTrend = formatTrend(pct);
      } else {
        claimsTrend = '\u2014';
      }
    }

    let grantsTrend: string | number | null = apiKpis.grantsTrend ?? apiKpis.grants_change_pct ?? null;
    if (!grantsTrend) {
      // try to use grants time series if provided by API
      const gSeries = dashboardData.kpis?.grantsTimeSeries ?? dashboardData.kpis?.grants_series ?? null;
      if (gSeries && gSeries.length >= 2) {
        const last = Number(gSeries[gSeries.length - 1]) ?? grantsNum;
        const prev = Number(gSeries[gSeries.length - 2]) ?? 0;
        const pct = computePct(last, prev);
        grantsTrend = formatTrend(pct);
      } else {
        grantsTrend = '\u2014';
      }
    }

    let assetsTrend: string | number | null = apiKpis.assetsTrend ?? apiKpis.assets_change_pct ?? null;
    if (!assetsTrend) {
      const aSeries = dashboardData.kpis?.assetsTimeSeries ?? dashboardData.kpis?.assets_series ?? null;
      if (aSeries && aSeries.length >= 2) {
        const last = Number(aSeries[aSeries.length - 1]) ?? assetsNum;
        const prev = Number(aSeries[aSeries.length - 2]) ?? 0;
        const pct = computePct(last, prev);
        assetsTrend = formatTrend(pct);
      } else {
        assetsTrend = '\u2014';
      }
    }

    let priorityTrend: string | number | null = apiKpis.priorityTrend ?? apiKpis.priority_change_pct ?? null;
    if (!priorityTrend) {
      const pSeries = dashboardData.kpis?.priorityTimeSeries ?? dashboardData.kpis?.priority_series ?? null;
      if (pSeries && pSeries.length >= 2) {
        const last = Number(pSeries[pSeries.length - 1]) ?? priorityNum;
        const prev = Number(pSeries[pSeries.length - 2]) ?? 0;
        const pct = computePct(last, prev);
        priorityTrend = formatTrend(pct);
      } else {
        priorityTrend = '\u2014';
      }
    }

    return [
      { label: "Claims processed", value: claimsNum, icon: FileText, trend: String(claimsTrend), color: "emerald" },
      { label: "Grants issued", value: grantsNum, icon: Database, trend: String(grantsTrend), color: "blue" },
      { label: "AI assets", value: assetsNum, icon: Satellite, trend: String(assetsTrend), color: "purple" },
      { label: "Priority villages", value: priorityNum, icon: Target, trend: String(priorityTrend), color: "orange" },
    ];
  }, [dashboardData.kpis, dashboardData.assetsData, filtered, totalClaims, grantedCount, timeSeries]);

  const [loginOpen, setLoginOpen] = useState(false);


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

        <Navbar />

      <main className={`relative z-10 w-full max-w-full 2xl:max-w-full mx-auto px-2 sm:px-4 md:px-8 lg:px-12 py-16 ${isLight ? 'text-slate-900' : 'text-white'}`}>
          {/* Loading State */}
          {isLoading && <DashboardLoadingState isLight={isLight} />}

          {!isLoading && (
            <>
              {/* Welcome Section */}
              <WelcomeSection isLight={isLight} userName={user?.displayName || 'User'} />

              {/* Key Performance Indicators */}
              <KPISection isLight={isLight} kpis={kpis} timeSeries={timeSeries} />

              {/* Quick Actions & Recent Activity */}
              <div className="mb-8">
                <motion.div initial={{ y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5, delay: 0.15 }}>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <QuickActionsSection isLight={isLight} />
                    <RecentActivitySection isLight={isLight} />
                    <SystemStatusSection isLight={isLight} />
                  </div>
                </motion.div>
              </div>

              {/* Data Visualization Section */}
              <DataVisualizationSection
                isLight={isLight}
                timeSeries={timeSeries}
                totalClaims={totalClaims}
                kpiTrend={kpis[0]?.trend}
                filteredLength={filtered.length}
              />

              {/* Interactive Map Preview */}
              <MapSection
                isLight={isLight}
                filtersCollapsed={filtersCollapsed}
                setFiltersCollapsed={setFiltersCollapsed}
                stateFilter={stateFilter}
                setStateFilter={setStateFilter}
                districtFilter={districtFilter}
                setDistrictFilter={setDistrictFilter}
                villageQuery={villageQuery}
                setVillageQuery={setVillageQuery}
                STATES={STATES}
                webGISRef={webGISRef}
                stateCenter={stateCenter}
                layers={layers}
                markers={markers}
                handleLayerToggle={handleLayerToggle}
                handleFeatureClick={handleFeatureClick}
                handleMapClick={handleMapClick}
                handleExportMap={handleExportMap}
              />

              {/* Platform Overview Section */}
              <PlatformOverviewSection
                isLight={isLight}
                totalClaims={totalClaims}
                grantedCount={grantedCount}
                uniqueVillages={uniqueVillages}
                claimsLoading={claimsLoading}
                claimsError={claimsError}
                strongBtnClasses={strongBtnClasses}
              />
            </>
          )}
        </main>
        <Footer />

        {/* Detail modal for recommendation */}
        {selected && <RecommendationModal isLight={isLight} selected={selected} onClose={() => setSelected(null)} />}
      </div>
    </ProtectedRoute>
  );
}