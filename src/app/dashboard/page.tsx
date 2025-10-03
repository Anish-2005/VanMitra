"use client";

import React, { useMemo, useState, useEffect, useRef } from "react";
import { useTheme } from "@/components/ThemeProvider";
import AnimatedCounter from "@/components/ui/AnimatedCounter";
import { STATES, DEFAULT_STATE, DEFAULT_DISTRICT } from '../../lib/regions';
import { BarChart, Menu, Shield, X } from "lucide-react";
import { motion, AnimatePresence, HTMLMotionProps } from "framer-motion";
const MDiv: React.FC<HTMLMotionProps<"div">> = motion.div;
const MBackdrop: React.FC<HTMLMotionProps<"div">> = motion.div;
const MAside: React.FC<HTMLMotionProps<"aside">> = motion.aside;
import { Leaf, MapPin, Database, Target, Satellite, ArrowRight, TrendingUp, Users, FileText, BarChart3, Activity, Calendar, Download, Filter, Layers, BookOpen, Upload, Server, Eye, Globe } from "lucide-react";
import ThreeBackground from "@/components/ui/ThreeBackground";
import DecorativeElements from "@/components/ui/DecorativeElements";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import Link from "next/link";
import GlassCard from "@/components/ui/GlassCard";
import WebGIS from "../../components/WebGIS";
import LayerManager from "../../components/LayerManager";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuth } from "@/components/AuthProvider";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { GISLayer, GISMarker, WebGISRef } from "../../components/WebGIS";
import { createGeoJSONPoint, exportToGeoJSON } from "../../lib/gis-utils";

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
  useEffect(() => { setMounted(true); }, []);
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
    await signOut(auth);
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

        <main className="relative z-10 max-w-7xl mx-auto px-6 py-8">
          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className={`animate-spin rounded-full h-12 w-12 border-b-2 ${isLight ? 'border-emerald-600' : 'border-emerald-400'} mx-auto mb-4`}></div>
                <p className={isLight ? 'text-emerald-700' : 'text-emerald-200'}>Loading dashboard data...</p>
              </div>
            </div>
          )}

          {!isLoading && (
            <>
              {/* Welcome Section */}
              <div className="mb-8">
                <motion.div initial={{ y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }}>
                  <GlassCard className={`p-6 ${isLight ? 'bg-white/90 border border-slate-200' : ''}`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className={`text-2xl font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>Welcome back, {user?.displayName || 'User'}!</h2>
                        <p className={`mt-1 ${isLight ? 'text-emerald-700' : 'text-emerald-200'}`}>Here is what is happening with FRA claims and village development today.</p>
                      </div>
                      <div className="text-right">
                        <div className={`text-sm ${isLight ? 'text-emerald-700' : 'text-emerald-200'}`}>Last updated</div>
                        <div className={`text-lg font-semibold ${isLight ? 'text-slate-900' : 'text-white'}`}>{new Date().toLocaleDateString()}</div>
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              </div>

              {/* Key Performance Indicators */}
              <div className="mb-8">
                <motion.div
                  initial={{ y: 8, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {kpis.map((kpi, index) => (
                      <GlassCard
                        key={index}
                        className={`p-6 hover:shadow-lg transition-shadow ${isLight ? 'bg-white/90 border border-slate-200' : ''}`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className={`text-sm font-medium ${isLight ? 'text-emerald-700' : 'text-emerald-200'}`}>{kpi.label}</p>
                            <p className={`text-2xl font-bold mt-1 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                              <AnimatedCounter value={Number(kpi.value ?? 0)} />
                            </p>
                            <div className="flex items-center mt-2">
                              <TrendingUp className={`h-4 w-4 mr-1 ${isLight ? 'text-emerald-600' : 'text-emerald-300'}`} />
                              <span className={`text-sm ${isLight ? 'text-emerald-700' : 'text-emerald-200'}`}>{kpi.trend}</span>
                            </div>
                          </div>

                          <div
                            className={`h-12 w-12 rounded-xl flex items-center justify-center 
                          ${isLight ? 'bg-emerald-100 border border-emerald-200' : 'bg-white/5 border border-white/10'} backdrop-blur-sm`}
                          >
                            <kpi.icon
                              className={`h-6 w-6 
                  ${kpi.color === 'emerald' ? (isLight ? 'text-emerald-600' : 'text-emerald-400') :
                                  kpi.color === 'blue' ? (isLight ? 'text-blue-600' : 'text-blue-400') :
                                    kpi.color === 'purple' ? (isLight ? 'text-purple-600' : 'text-purple-400') :
                                      kpi.color === 'orange' ? (isLight ? 'text-orange-600' : 'text-orange-400') :
                                        isLight ? 'text-gray-600' : 'text-gray-400'
                                }`}
                            />
                          </div>
                        </div>

                        <div className="mt-4">
                          {timeSeries && timeSeries.length >= 2 ? (
                            <Sparkline data={timeSeries.slice(-7).map(Number)} />
                          ) : (
                            <div className={`h-10 flex items-center ${isLight ? 'text-emerald-700' : 'text-emerald-200'}`}>
                              <span className="text-sm">No historical series</span>
                            </div>
                          )}
                        </div>
                      </GlassCard>
                    ))}
                  </div>
                </motion.div>
              </div>

              {/* Quick Actions & Recent Activity */}
              <div className="mb-8">
                <motion.div initial={{ y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5, delay: 0.15 }}>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Quick Actions */}
                    <GlassCard className={`p-6 ${isLight ? 'bg-white/90 border border-slate-200' : ''}`}>
                      <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                        <Activity className="h-5 w-5" />
                        Quick Actions
                      </h3>

                      <div className="space-y-3">
                        <button className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left ${isLight ? 'bg-emerald-50 border border-emerald-200 hover:bg-emerald-100' : 'bg-white/5 border border-white/10 hover:bg-white/10'}`}>
                          <FileText className={`h-5 w-5 ${isLight ? 'text-emerald-600' : 'text-emerald-400'}`} />
                          <div>
                            <div className={`font-medium ${isLight ? 'text-slate-900' : 'text-white'}`}>New FRA Claim</div>
                            <div className={`text-sm ${isLight ? 'text-emerald-700' : 'text-emerald-200'}`}>Process a new forest rights claim</div>
                          </div>
                        </button>

                        <button className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left ${isLight ? 'bg-emerald-50 border border-emerald-200 hover:bg-emerald-100' : 'bg-white/5 border border-white/10 hover:bg-white/10'}`}>
                          <MapPin className={`h-5 w-5 ${isLight ? 'text-blue-600' : 'text-blue-400'}`} />
                          <div>
                            <div className={`font-medium ${isLight ? 'text-slate-900' : 'text-white'}`}>Map Analysis</div>
                            <div className={`text-sm ${isLight ? 'text-emerald-700' : 'text-emerald-200'}`}>Analyze village boundaries</div>
                          </div>
                        </button>

                        <button className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left ${isLight ? 'bg-emerald-50 border border-emerald-200 hover:bg-emerald-100' : 'bg-white/5 border border-white/10 hover:bg-white/10'}`}>
                          <Download className={`h-5 w-5 ${isLight ? 'text-purple-600' : 'text-purple-400'}`} />
                          <div>
                            <div className={`font-medium ${isLight ? 'text-slate-900' : 'text-white'}`}>Export Report</div>
                            <div className={`text-sm ${isLight ? 'text-emerald-700' : 'text-emerald-200'}`}>Generate comprehensive report</div>
                          </div>
                        </button>

                        <button className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left ${isLight ? 'bg-emerald-50 border border-emerald-200 hover:bg-emerald-100' : 'bg-white/5 border border-white/10 hover:bg-white/10'}`}>
                          <Users className={`h-5 w-5 ${isLight ? 'text-orange-600' : 'text-orange-400'}`} />
                          <div>
                            <div className={`font-medium ${isLight ? 'text-slate-900' : 'text-white'}`}>Team Assignment</div>
                            <div className={`text-sm ${isLight ? 'text-emerald-700' : 'text-emerald-200'}`}>Assign tasks to field officers</div>
                          </div>
                        </button>
                      </div>
                    </GlassCard>

                    {/* Recent Activity */}
                    <GlassCard className={`p-6 ${isLight ? 'bg-white/90 border border-slate-200' : ''}`}>
                      <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                        <Calendar className="h-5 w-5" />
                        Recent Activity
                      </h3>
                      <div className="space-y-4">
                        <div className="flex items-start gap-3">
                          <div className={`h-2 w-2 rounded-full mt-2 ${isLight ? 'bg-green-600' : 'bg-green-500'}`}></div>
                          <div className="flex-1">
                            <p className={`text-sm font-medium ${isLight ? 'text-slate-900' : 'text-white'}`}>New claim processed</p>
                            <p className={`text-xs ${isLight ? 'text-emerald-700' : 'text-emerald-200'}`}>Village: Chandrapur • 2 hours ago</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className={`h-2 w-2 rounded-full mt-2 ${isLight ? 'bg-blue-600' : 'bg-blue-500'}`}></div>
                          <div className="flex-1">
                            <p className={`text-sm font-medium ${isLight ? 'text-slate-900' : 'text-white'}`}>Boundary survey completed</p>
                            <p className={`text-xs ${isLight ? 'text-emerald-700' : 'text-emerald-200'}`}>District: Raipur • 4 hours ago</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className={`h-2 w-2 rounded-full mt-2 ${isLight ? 'bg-purple-600' : 'bg-purple-500'}`}></div>
                          <div className="flex-1">
                            <p className={`text-sm font-medium ${isLight ? 'text-slate-900' : 'text-white'}`}>Report generated</p>
                            <p className={`text-xs ${isLight ? 'text-emerald-700' : 'text-emerald-200'}`}>Monthly summary • 1 day ago</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className={`h-2 w-2 rounded-full mt-2 ${isLight ? 'bg-orange-600' : 'bg-orange-500'}`}></div>
                          <div className="flex-1">
                            <p className={`text-sm font-medium ${isLight ? 'text-slate-900' : 'text-white'}`}>Officer assigned</p>
                            <p className={`text-xs ${isLight ? 'text-emerald-700' : 'text-emerald-200'}`}>Team Alpha • 2 days ago</p>
                          </div>
                        </div>
                      </div>
                    </GlassCard>

                    {/* System Status */}
                    <GlassCard className={`p-6 ${isLight ? 'bg-white/90 border border-slate-200' : ''}`}>
                      <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                        <Server className="h-5 w-5" />
                        System Status
                      </h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className={`text-sm ${isLight ? 'text-emerald-700' : 'text-emerald-200'}`}>API Services</span>
                          <div className="flex items-center gap-2">
                            <div className={`h-2 w-2 rounded-full ${isLight ? 'bg-green-600' : 'bg-green-500'}`}></div>
                            <span className={`text-xs ${isLight ? 'text-emerald-700' : 'text-emerald-200'}`}>Online</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className={`text-sm ${isLight ? 'text-emerald-700' : 'text-emerald-200'}`}>Database</span>
                          <div className="flex items-center gap-2">
                            <div className={`h-2 w-2 rounded-full ${isLight ? 'bg-green-600' : 'bg-green-500'}`}></div>
                            <span className={`text-xs ${isLight ? 'text-emerald-700' : 'text-emerald-200'}`}>Healthy</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className={`text-sm ${isLight ? 'text-emerald-700' : 'text-emerald-200'}`}>OCR Engine</span>
                          <div className="flex items-center gap-2">
                            <div className={`h-2 w-2 rounded-full ${isLight ? 'bg-green-600' : 'bg-green-500'}`}></div>
                            <span className={`text-xs ${isLight ? 'text-emerald-700' : 'text-emerald-200'}`}>Active</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className={`text-sm ${isLight ? 'text-emerald-700' : 'text-emerald-200'}`}>Map Services</span>
                          <div className="flex items-center gap-2">
                            <div className={`h-2 w-2 rounded-full ${isLight ? 'bg-green-500' : 'bg-green-500'}`}></div>
                            <span className={`text-xs ${isLight ? 'text-green-300' : 'text-green-200'}`}>Active</span>
                          </div>
                        </div>
                      </div>
                      <div className={`mt-4 pt-4 border-t ${isLight ? 'border-emerald-200' : 'border-white/10'}`}>
                        <div className={`text-xs ${isLight ? 'text-emerald-700' : 'text-emerald-200'}`}>
                          Last maintenance: 2 hours ago
                        </div>
                      </div>
                    </GlassCard>
                  </div>
                </motion.div>
              </div>

              {/* Data Visualization Section */}
              <div className="mb-8">
                <motion.div initial={{ y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5, delay: 0.2 }}>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <GlassCard className={`p-6 ${isLight ? 'bg-white/90 border border-slate-200' : ''}`}>
                      <h3 className={`text-lg font-semibold mb-4 ${isLight ? 'text-slate-900' : 'text-white'}`}>Claims Processing Trend</h3>
                      {timeSeries && timeSeries.length >= 2 ? (
                        <>
                          <div className="h-64 flex items-end justify-between gap-2">
                            {timeSeries.slice(-12).map((value: number, index: number) => (
                              <div key={index} className="flex flex-col items-center flex-1">
                                <div
                                  className={`rounded-t w-full transition-all hover:opacity-80 ${isLight ? 'bg-emerald-500' : 'bg-emerald-500'}`}
                                  style={{ height: `${(Number(value) / Math.max(...timeSeries.map(Number))) * 200}px` }}
                                ></div>
                                <span className={`text-xs mt-2 ${isLight ? 'text-emerald-700' : 'text-emerald-200'}`}>{index + 1}</span>
                              </div>
                            ))}
                          </div>
                          <div className={`mt-4 flex justify-between text-sm ${isLight ? 'text-emerald-700' : 'text-emerald-200'}`}>
                            <span>Monthly claims processed</span>
                            <span className="font-medium">{kpis[0]?.trend ?? '\u2014'} this month</span>
                          </div>
                        </>
                      ) : (
                        <div className="h-64 flex items-center justify-center">
                          <div className="text-center">
                            <div className={`text-sm ${isLight ? 'text-emerald-700' : 'text-emerald-200'}`}>No historical series available</div>
                            <div className={`text-2xl font-bold mt-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                              <AnimatedCounter value={totalClaims} />
                            </div>
                            <div className={`text-sm mt-1 ${isLight ? 'text-emerald-700' : 'text-emerald-200'}`}>{kpis[0]?.trend ?? '\u2014'}</div>
                          </div>
                        </div>
                      )}
                    </GlassCard>

                    <GlassCard className={`p-6 ${isLight ? 'bg-white/90 border border-slate-200' : ''}`}>
                      <h3 className={`text-lg font-semibold mb-4 ${isLight ? 'text-slate-900' : 'text-white'}`}>Priority Distribution</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`h-4 w-4 rounded ${isLight ? 'bg-red-500' : 'bg-red-500'}`}></div>
                            <span className={`text-sm ${isLight ? 'text-emerald-700' : 'text-emerald-200'}`}>High Priority</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className={`w-24 h-2 rounded ${isLight ? 'bg-emerald-200' : 'bg-white/10'}`}>
                              <div className={`h-2 rounded ${isLight ? 'bg-red-500' : 'bg-red-500'}`} style={{ width: '35%' }}></div>
                            </div>
                            <span className={`text-sm font-medium ${isLight ? 'text-slate-900' : 'text-white'}`}>35%</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`h-4 w-4 rounded ${isLight ? 'bg-yellow-500' : 'bg-yellow-500'}`}></div>
                            <span className={`text-sm ${isLight ? 'text-emerald-700' : 'text-emerald-200'}`}>Medium Priority</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className={`w-24 h-2 rounded ${isLight ? 'bg-emerald-200' : 'bg-white/10'}`}>
                              <div className={`h-2 rounded ${isLight ? 'bg-yellow-500' : 'bg-yellow-500'}`} style={{ width: '45%' }}></div>
                            </div>
                            <span className={`text-sm font-medium ${isLight ? 'text-slate-900' : 'text-white'}`}>45%</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`h-4 w-4 rounded ${isLight ? 'bg-green-500' : 'bg-green-500'}`}></div>
                            <span className={`text-sm ${isLight ? 'text-emerald-700' : 'text-emerald-200'}`}>Low Priority</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className={`w-24 h-2 rounded ${isLight ? 'bg-emerald-200' : 'bg-white/10'}`}>
                              <div className={`h-2 rounded ${isLight ? 'bg-emerald-500' : 'bg-emerald-500'}`} style={{ width: '20%' }}></div>
                            </div>
                            <span className={`text-sm font-medium ${isLight ? 'text-slate-900' : 'text-white'}`}>20%</span>
                          </div>
                        </div>
                      </div>
                      <div className={`mt-6 pt-4 border-t ${isLight ? 'border-emerald-200' : 'border-white/10'}`}>
                        <div className={`text-sm ${isLight ? 'text-emerald-700' : 'text-emerald-200'}`}>
                          Total villages monitored: <span className={`font-medium ${isLight ? 'text-slate-900' : 'text-white'}`}>{filtered.length}</span>
                        </div>
                      </div>
                    </GlassCard>
                  </div>
                </motion.div>
              </div>

              {/* Interactive Map Preview */}
              <div className="mb-8">
                <motion.div initial={{ y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5, delay: 0.25 }}>
                  <GlassCard className={`p-6 ${isLight ? 'bg-white/90 border border-slate-200' : ''}`}>
                    <div className="flex items-center justify-between mb-6">
                      <h3 className={`text-lg font-semibold ${isLight ? 'text-slate-900' : 'text-white'}`}>Interactive Map Preview</h3>

                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setFiltersCollapsed(!filtersCollapsed)}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm 
                   ${isLight ? 'bg-emerald-100 border border-emerald-200 hover:bg-emerald-200 text-emerald-800' : 'bg-white/5 border border-white/10 hover:bg-white/10 text-white'}`}
                        >
                          <Filter className={`h-4 w-4 ${isLight ? 'text-emerald-600' : 'text-emerald-400'}`} />
                          <span>Filters</span>
                        </button>

                        <button
                          onClick={handleExportMap}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm 
                   ${isLight ? 'bg-emerald-100 border border-emerald-200 hover:bg-emerald-200 text-emerald-800' : 'bg-white/5 border border-white/10 hover:bg-white/10 text-white'}`}
                        >
                          <Download className={`h-4 w-4 ${isLight ? 'text-emerald-600' : 'text-emerald-400'}`} />
                          <span>Export</span>
                        </button>
                      </div>
                    </div>

                    {/* Filters Panel */}
                    {!filtersCollapsed && (
                      <motion.div
                        className={`mb-6 p-6 rounded-3xl ${isLight ? 'bg-emerald-50 border border-emerald-200' : 'border border-emerald-700/50 bg-gradient-to-r from-emerald-900/20 to-green-900/20 backdrop-blur-xl shadow-2xl'}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                      >
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div>
                            <label className={`block text-sm font-medium mb-2 ${isLight ? 'text-emerald-700' : 'text-emerald-200'}`}>State</label>
                            <motion.select
                              value={stateFilter}
                              onChange={(e) => setStateFilter(e.target.value)}
                              className={`w-full px-4 py-2 rounded-2xl focus:outline-none focus:ring-2 ${isLight
                                ? 'bg-white border border-emerald-300 text-slate-900 placeholder-slate-500 focus:ring-emerald-500 focus:border-emerald-500'
                                : 'border border-emerald-700/50 bg-gradient-to-r from-emerald-900/20 to-green-900/20 backdrop-blur-sm text-white placeholder-green-300 focus:ring-emerald-400 focus:border-emerald-400'}`}
                              whileHover={{ scale: 1.02 }}
                              whileFocus={{ scale: 1.02 }}
                              transition={{ type: "spring", stiffness: 300 }}
                            >
                              {STATES.map(state => (
                                <option key={state.name} value={state.name} className={isLight ? 'bg-white text-slate-900' : 'bg-slate-900 text-white'}>{state.name}</option>
                              ))}
                            </motion.select>
                          </div>
                          <div>
                            <label className={`block text-sm font-medium mb-2 ${isLight ? 'text-emerald-700' : 'text-emerald-200'}`}>District</label>
                            <motion.select
                              value={districtFilter}
                              onChange={(e) => setDistrictFilter(e.target.value)}
                              className={`w-full px-4 py-2 rounded-2xl focus:outline-none focus:ring-2 ${isLight
                                ? 'bg-white border border-emerald-300 text-slate-900 placeholder-slate-500 focus:ring-emerald-500 focus:border-emerald-500'
                                : 'border border-emerald-700/50 bg-gradient-to-r from-emerald-900/20 to-green-900/20 backdrop-blur-sm text-white placeholder-green-300 focus:ring-emerald-400 focus:border-emerald-400'}`}
                              whileHover={{ scale: 1.02 }}
                              whileFocus={{ scale: 1.02 }}
                              transition={{ type: "spring", stiffness: 300 }}
                            >
                              <option value="All" className={isLight ? 'bg-white text-slate-900' : 'bg-slate-900 text-white'}>All Districts</option>
                              <option value="Raipur" className={isLight ? 'bg-white text-slate-900' : 'bg-slate-900 text-white'}>Raipur</option>
                              <option value="Bilaspur" className={isLight ? 'bg-white text-slate-900' : 'bg-slate-900 text-white'}>Bilaspur</option>
                              <option value="Durg" className={isLight ? 'bg-white text-slate-900' : 'bg-slate-900 text-white'}>Durg</option>
                            </motion.select>
                          </div>
                          <div>
                            <label className={`block text-sm font-medium mb-2 ${isLight ? 'text-emerald-700' : 'text-emerald-200'}`}>Search Village</label>
                            <motion.input
                              type="text"
                              value={villageQuery}
                              onChange={(e) => setVillageQuery(e.target.value)}
                              placeholder="Enter village name..."
                              className={`w-full px-4 py-2 rounded-2xl focus:outline-none focus:ring-2 ${isLight
                                ? 'bg-white border border-emerald-300 text-slate-900 placeholder-slate-500 focus:ring-emerald-500 focus:border-emerald-500'
                                : 'border border-emerald-700/50 bg-gradient-to-r from-emerald-900/20 to-green-900/20 backdrop-blur-sm text-white placeholder-green-300 focus:ring-emerald-400 focus:border-emerald-400'}`}
                              whileFocus={{ scale: 1.02 }}
                              transition={{ type: "spring", stiffness: 300 }}
                            />
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* Map Container */}
                    <div className="relative h-96 rounded-lg overflow-hidden">
                      <WebGIS
                        ref={webGISRef}
                        center={[stateCenter[0], stateCenter[1]]}
                        zoom={8}
                        layers={layers}
                        markers={markers}
                        onLayerToggle={handleLayerToggle}
                        onFeatureClick={handleFeatureClick}
                        onMapClick={handleMapClick}
                      />
                      <div className="absolute top-4 left-4">
                        <GlassCard className={`p-2 ${isLight ? 'bg-white/90 border border-slate-200' : ''}`}>
                          <div className={`flex items-center gap-2 text-sm ${isLight ? 'text-emerald-700' : 'text-emerald-600'}`}>
                            <MapPin className="h-4 w-4" />
                            <span className={isLight ? 'text-slate-900' : 'text-white'}>{stateFilter}, {districtFilter}</span>
                          </div>
                        </GlassCard>
                      </div>
                      <div className="absolute bottom-4 right-4">
                        <GlassCard className={`p-2 ${isLight ? 'bg-white/90 border border-slate-200' : ''}`}>
                          <div className={`text-xs ${isLight ? 'text-emerald-600' : 'text-emerald-600'}`}>
                            <span className={isLight ? 'text-slate-900' : 'text-white'}>Zoom: 8x</span>
                            <span className={`mx-2 ${isLight ? 'text-emerald-600' : 'text-emerald-600'}`}>•</span>
                            <span className={isLight ? 'text-slate-900' : 'text-white'}>Layers: {layers.filter(l => l.visible).length}/{layers.length}</span>
                          </div>
                        </GlassCard>
                      </div>
                    </div>

                    {/* Map Legend */}
                    <div className="mt-4 flex flex-wrap gap-4">
                      {layers.map(layer => (
                        <div key={layer.id} className="flex items-center gap-2">
                          <div
                            className="h-4 w-4 rounded border-2 border-white shadow-sm"
                            style={{ backgroundColor: layer.style.fillColor }}
                          ></div>
                          <span className={`text-sm ${isLight ? 'text-emerald-700' : 'text-emerald-200'}`}>{layer.name}</span>
                        </div>
                      ))}
                    </div>
                  </GlassCard>
                </motion.div>
              </div>

              {/* Platform Overview Section */}
              <section className="relative mt-20">
                <div className={`absolute inset-0 rounded-3xl blur-3xl ${isLight ? 'bg-emerald-100/20' : 'bg-emerald-900/20'}`} />

                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                  className="relative"
                >
                  {/* Section header */}
                  <div className="text-center mb-14">
                    <span className={`px-3 py-1 text-xs font-medium uppercase tracking-wider rounded-full ${isLight ? 'text-emerald-700 bg-emerald-100' : 'text-emerald-300 bg-emerald-800/30'}`}>
                      Features
                    </span>
                    <h2 className={`text-4xl md:text-5xl font-extrabold mt-4 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                      Explore VanMitra Platform
                    </h2>
                    <p className={`mt-3 max-w-2xl mx-auto ${isLight ? 'text-emerald-700' : 'text-emerald-200'}`}>
                      Discover powerful tools for forest rights management and empower
                      communities with data-driven insights.
                    </p>
                    <div className={`mt-5 h-1 w-28 mx-auto rounded-full shadow-lg ${isLight ? 'bg-gradient-to-r from-emerald-500 to-green-600' : 'bg-gradient-to-r from-emerald-400 to-green-600'}`} />
                  </div>

                  {/* Features Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {[
                      {
                        title: "Interactive Atlas",
                        desc: "Map-based visualization of claims & layers",
                        icon: Layers,
                        color: "emerald",
                        href: "/atlas",
                        strong: true, // highlight
                        preview: (
                          <div className={`h-28 flex items-center justify-center rounded-lg ${isLight ? 'bg-emerald-100' : 'bg-emerald-500/5'}`}>
                            <Globe className={`h-10 w-10 ${isLight ? 'text-emerald-600' : 'text-emerald-400'}`} />
                          </div>
                        ),
                      },
                       {
                        title: "Public Portal",
                        desc: "Community transparency & FRA status",
                        icon: Globe,
                        color: "teal",
                        href: "/public",
                        strong: true, // highlight
                        preview: (
                          <div className={`h-28 grid grid-cols-3 text-center rounded-lg ${isLight ? 'bg-teal-100' : 'bg-teal-500/5'}`}>
                            {[
                              { label: 'Claims', value: totalClaims, loading: claimsLoading, error: claimsError },
                              { label: 'Granted', value: grantedCount, loading: claimsLoading, error: claimsError },
                              { label: 'Villages', value: uniqueVillages, loading: claimsLoading, error: claimsError }
                            ].map((s, si) => (
                              <div key={si}>
                                <p className={`text-lg font-bold ${isLight ? 'text-teal-700' : 'text-teal-300'}`}>
                                  {s.loading ? (
                                    <span className={isLight ? 'text-slate-600' : 'text-teal-300'}>Loading…</span>
                                  ) : s.error ? (
                                    <span className={isLight ? 'text-red-600' : 'text-red-400'}>—</span>
                                  ) : (
                                    <AnimatedCounter value={s.value} />
                                  )}
                                </p>
                                <p className={`text-xs ${isLight ? 'text-teal-700' : 'text-teal-200'}`}>{s.label}</p>
                              </div>
                            ))}
                          </div>
                        ),
                      },
                     
                      {
                        title: "OCR Processing",
                        desc: "Digitize & extract data from documents",
                        icon: Upload,
                        color: "purple",
                        href: "/ocr",
                        strong: true, // highlight
                        preview: (
                          <div className={`h-28 border-2 border-dashed rounded-lg flex items-center justify-center ${isLight ? 'border-purple-400 bg-purple-100' : 'border-purple-400/40 bg-purple-500/5'}`}>
                            <Upload className={`h-8 w-8 ${isLight ? 'text-purple-600' : 'text-purple-400'}`} />
                            <span className={`text-xs ml-2 ${isLight ? 'text-purple-700' : 'text-purple-200'}`}>Drop file</span>
                          </div>
                        ),
                      },
                      {
                        title: "Admin Dashboard",
                        desc: "Manage claims, users & FRA documents",
                        icon: Shield,
                        color: "red",
                        href: "/admin",
                        preview: (
                          <div className={`h-28 flex flex-col justify-center items-center rounded-lg ${isLight ? 'bg-red-100' : 'bg-red-500/5'}`}>
                            <Users className={`h-8 w-8 mb-2 ${isLight ? 'text-red-600' : 'text-red-400'}`} />
                            <span className={`text-xs ${isLight ? 'text-red-700' : 'text-red-200'}`}>Role: Super Admin</span>
                          </div>
                        ),
                      },
                      {
                        title: "Decision Support",
                        desc: "Smart scheme recommendations for your location",
                        icon: BookOpen,
                        color: "blue",
                        href: "/dss",
                        preview: (
                          <div className={`h-28 flex flex-col justify-center items-center gap-2 rounded-lg ${isLight ? 'bg-blue-100' : 'bg-blue-500/5'}`}>
                            <input
                              type="text"
                              placeholder="Latitude"
                              className={`w-32 px-2 py-1 text-xs rounded ${isLight ? 'bg-blue-50 border border-blue-300 text-blue-900' : 'bg-blue-950/20 border border-blue-400/30 text-blue-200'}`}
                              readOnly
                            />
                            <input
                              type="text"
                              placeholder="Longitude"
                              className={`w-32 px-2 py-1 text-xs rounded ${isLight ? 'bg-blue-50 border border-blue-300 text-blue-900' : 'bg-blue-950/20 border border-blue-400/30 text-blue-200'}`}
                              readOnly
                            />
                          </div>
                        ),
                      },
                      {
                        title: "Analytics Hub",
                        desc: "Advanced reports & visual insights",
                        icon: BarChart3,
                        color: "indigo",
                        href: "/analytics",
                        preview: (
                          <div className={`h-28 flex flex-col gap-2 justify-center px-4 rounded-lg ${isLight ? 'bg-indigo-100' : 'bg-indigo-500/5'}`}>
                            <div className={`h-2 w-3/4 rounded ${isLight ? 'bg-indigo-400' : 'bg-indigo-400/60'}`}></div>
                            <div className={`h-2 w-1/2 rounded ${isLight ? 'bg-indigo-400' : 'bg-indigo-400/60'}`}></div>
                            <div className={`h-2 w-5/6 rounded ${isLight ? 'bg-indigo-400' : 'bg-indigo-400/60'}`}></div>
                          </div>
                        ),
                      },
                    ].map((item, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1, duration: 0.5 }}
                        whileHover={{ scale: 1.03, rotateX: 2, rotateY: -2 }}
                        className="transform-gpu"
                      >
                        <GlassCard className={`p-6 flex flex-col h-full backdrop-blur-xl border ${isLight ? 'border-slate-200 hover:shadow-xl hover:shadow-emerald-500/20' : 'border-white/10 hover:shadow-xl hover:shadow-emerald-500/20'} transition-all duration-300`}>
                          {/* Card header */}
                          <div className="flex items-center gap-3 mb-5">
                            <div
                              className={`h-12 w-12 rounded-full flex items-center justify-center shadow-inner ${isLight ? `bg-${item.color}-100` : `bg-${item.color}-500/20`}`}
                            >
                              <item.icon className={`h-6 w-6 ${isLight ? `text-${item.color}-600` : `text-${item.color}-400`}`} />
                            </div>
                            <div>
                              <h3 className={`text-lg font-semibold ${isLight ? 'text-slate-900' : 'text-white'}`}>{item.title}</h3>
                              <p className={`text-sm ${isLight ? 'text-emerald-700' : 'text-emerald-200'}`}>{item.desc}</p>
                            </div>
                          </div>

                          {/* Card preview */}
                          <div className="flex-1">{item.preview}</div>

                          {/* Card CTA */}
                          <Link
                            href={item.href}
                            className={`mt-6 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all
    ${item.strong
                                ? strongBtnClasses[item.color]   // ✅ solid colors now always work
                                : isLight
                                  ? `bg-gradient-to-r from-${item.color}-500 to-${item.color}-600 text-white hover:shadow-lg hover:shadow-${item.color}-500/40`
                                  : `bg-gradient-to-r from-${item.color}-500 to-${item.color}-600 text-white hover:shadow-lg hover:shadow-${item.color}-500/40`
                              }`}
                          >
                            Open {item.title}
                            <ArrowRight size={14} />
                          </Link>

                        </GlassCard>
                      </motion.div>
                    ))}
                  </div>

                </motion.div>
              </section>
            </>
          )}
        </main>
        <Footer />

        {/* Detail modal for recommendation */}
        {selected && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <GlassCard className={`w-11/12 max-w-2xl p-6 ${isLight ? 'bg-white/90 border border-slate-200' : ''}`}>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className={`text-lg font-semibold ${isLight ? 'text-slate-900' : 'text-white'}`}>{selected.village}</h3>
                  <div className={`text-sm ${isLight ? 'text-emerald-700' : 'text-emerald-200'}`}>Recommended: {selected.scheme}</div>
                </div>
                <div>
                  <button
                    onClick={() => setSelected(null)}
                    className={`text-sm px-3 py-1 rounded-md ${isLight ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200' : 'bg-white/10 text-white hover:bg-white/20'}`}
                  >
                    Close
                  </button>
                </div>
              </div>

              <GlassCard className={`mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 ${isLight ? 'bg-white/90 border border-slate-200' : ''}`}>
                <div>
                  <h4 className={`text-sm font-medium ${isLight ? 'text-emerald-700' : 'text-emerald-200'}`}>Priority score</h4>
                  <div className={`text-2xl font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    {(selected.score * 100).toFixed(0)}%
                  </div>
                  <div className={`mt-3 text-sm ${isLight ? 'text-emerald-700' : 'text-emerald-200'}`}>
                    This recommendation is generated by combining rule-based eligibility and
                    AI-derived indicators.
                  </div>
                </div>
                <div>
                  <h4 className={`text-sm font-medium ${isLight ? 'text-emerald-700' : 'text-emerald-200'}`}>Actions</h4>
                  <div className="mt-2 flex flex-col gap-2">
                    <button className={`inline-flex items-center gap-2 px-4 py-2 rounded-md ${isLight ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-emerald-600 hover:bg-emerald-700 text-white'}`}>
                      Create Plan
                    </button>
                    <button className={`inline-flex items-center gap-2 px-4 py-2 rounded-md ${isLight ? 'border border-emerald-300 text-emerald-800 hover:bg-emerald-50' : 'border border-white/10 text-white/90 hover:bg-white/10'}`}>
                      Assign to Officer
                    </button>
                  </div>
                </div>
              </GlassCard>
            </GlassCard>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}