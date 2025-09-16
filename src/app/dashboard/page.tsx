"use client";

import React, { useMemo, useState, useEffect, useRef } from "react";
import { STATES, DEFAULT_STATE, DEFAULT_DISTRICT } from '../../lib/regions';
import { Menu, X } from "lucide-react"; // icons
import { motion, AnimatePresence, HTMLMotionProps } from "framer-motion";
// Framer-motion's JSX generics sometimes conflict with the project's TS setup.
// Create lightweight aliases cast to any so we can use className/onClick without type errors.
const MDiv: React.FC<HTMLMotionProps<"div">> = motion.div;
const MBackdrop: React.FC<HTMLMotionProps<"div">> = motion.div;
const MAside: React.FC<HTMLMotionProps<"aside">> = motion.aside;
import { Leaf,MapPin, Database, Target, Satellite, ArrowRight, TrendingUp, Users, FileText, BarChart3, Activity, Calendar, Download, Filter, Layers, BookOpen, Upload, Server, Eye, Globe } from "lucide-react";
import DecorativeBackground from "@/components/ui/DecorativeBackground";
import Link from "next/link";
import Button from "@/components/ui/button";
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
  // UI: collapse filters & layer manager by default
  const [filtersCollapsed, setFiltersCollapsed] = useState<boolean>(true);

  // Fetch all dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);

        // Fetch all data in parallel
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

  // Default sample markers placed around the DEFAULT_STATE center (Madhya Pradesh) rather than Sundarbans
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
      // Try the WebGIS export first
      if (webGISRef.current) {
        await webGISRef.current.exportMap();
        return;
      }

      // Fallback: Simple screenshot approach
      alert('Map export initiated. Please use your browser\'s screenshot feature (Ctrl+Shift+S) to capture the map.');
    } catch (error) {
      // Safe error logging to avoid call stack issues
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

  const kpis = useMemo(() => {
    const claims = dashboardData.kpis?.claims ?? 0;
    const grants = dashboardData.kpis?.grants ?? 0;
    const assets = dashboardData.kpis?.assets ?? 0;
    const priorityVillages = filtered.length || 0;
    return [
      { label: "Claims processed", value: claims.toLocaleString(), icon: FileText, trend: "+12%", color: "emerald" },
      { label: "Grants issued", value: grants.toLocaleString(), icon: Database, trend: "+8%", color: "blue" },
      { label: "AI assets", value: assets.toLocaleString(), icon: Satellite, trend: "+15%", color: "purple" },
      { label: "Priority villages", value: priorityVillages.toString(), icon: Target, trend: "+5%", color: "orange" },
    ];
  }, [dashboardData.kpis, filtered]);

  const timeSeries = dashboardData.kpis?.timeSeries || [120, 180, 240, 300, 220, 260, 310, 380, 420, 480];

  const [loginOpen, setLoginOpen] = useState(false);

  function seeded(i: number, arg1: number) {
    throw new Error("Function not implemented.");
  }

  return (
       <ProtectedRoute>
      <div className="min-h-screen bg-page-gradient text-green-900 relative overflow-hidden">
        <DecorativeBackground count={8} />

        {/* Floating leaves - Add this section */}
        {[...Array(8)].map((_, i) => {
          // Seeded randomness for deterministic positioning
          const seeded = (i: number, salt = 1) =>
            Math.abs(Math.sin(i * 12.9898 + salt * 78.233) * 43758.5453) % 1;

          const r1 = seeded(i, 1);
          const r2 = seeded(i, 2);
          const duration = 5 + r1 * 5;
          const top = `${(r2 * 80 + 10).toFixed(6)}%`;
          const left = `${(r1 * 90 + 5).toFixed(6)}%`;

          return (
            <motion.div
              key={i}
              animate={{
                y: [0, -20, 0],
                x: [0, 15, 0],
                rotate: [0, 10, 0],
              }}
              transition={{
                duration,
                repeat: Infinity,
              }}
              style={{
                position: "absolute",
                top,
                left,
              }}
              aria-hidden
            >
              <div className="absolute text-green-500 opacity-40">
                <Leaf size={24} />
              </div>
            </motion.div>
          );
        })}

        <header className="relative z-50 max-w-7xl mx-auto px-6 pt-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-lg bg-green-600 flex items-center justify-center border border-green-700 shadow-md">
              <Leaf className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-green-900">VanMitra</h1>
              <p className="text-xs text-green-700">Forest Rights & Asset Mapping Platform</p>
            </div>
          </div>
          
          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-4">
            <Link href="/atlas" className="nav-link">Atlas</Link>
            <Link href="/ocr" className="nav-link">OCR</Link>
            <Link href="/dss" className="nav-link">DSS</Link>
            <Link href="/public" className="nav-link">Public Data</Link>
            <Link href="/dashboard" className="nav-link font-semibold text-green-700">Dashboard</Link>
            {user ? (
              <button onClick={handleLogout} className="ml-4">Sign out</button>
            ) : (
              <button onClick={() => setLoginOpen(true)} className="ml-4">Sign in</button>
            )}
          </nav>

          {/* Mobile nav toggle */}
          <div className="md:hidden">
            <button onClick={() => setIsOpen((s) => !s)} aria-label="Toggle menu" className="p-2 rounded-md bg-white/10">
              {isOpen ? <X className="text-green-800" /> : <Menu className="text-green-800" />}
            </button>
          </div>
        </header>

        {/* Mobile menu panel with animation */}
        <AnimatePresence>
          {isOpen && (
            <MDiv {...({ className: "md:hidden fixed inset-0 z-40", initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } } as any)}>
              {/* backdrop */}
              <MBackdrop {...({ className: "absolute inset-0 bg-black/30", onClick: () => setIsOpen(false), initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } } as any)} />

              {/* sliding panel */}
              <MAside
                {...({
                  className: "absolute top-0 right-0 w-11/12 max-w-sm bg-white h-full shadow-xl p-6",
                  initial: { x: '100%' },
                  animate: { x: 0 },
                  exit: { x: '100%' },
                  transition: { type: 'spring', stiffness: 300, damping: 30 }
                } as any)}
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-md bg-green-600 flex items-center justify-center"><Leaf className="text-white" /></div>
                    <div>
                      <div className="font-semibold text-green-900">VanMitra</div>
                      <div className="text-xs text-green-700">Forest Rights Platform</div>
                    </div>
                  </div>
                  <button onClick={() => setIsOpen(false)} aria-label="Close menu" className="p-2 rounded-md"><X /></button>
                </div>

                <nav className="flex flex-col gap-4 text-green-800">
                  <Link href="/atlas" onClick={() => setIsOpen(false)} className="font-medium">Atlas</Link>
                  <Link href="/ocr" onClick={() => setIsOpen(false)} className="font-medium">OCR</Link>
                  <Link href="/dss" onClick={() => setIsOpen(false)} className="font-medium">DSS</Link>
                  <Link href="/public" onClick={() => setIsOpen(false)} className="font-medium">Public Data</Link>
                  <Link href="/dashboard" onClick={() => setIsOpen(false)} className="font-medium text-green-700">Dashboard</Link>
                  <div className="mt-4">
                    {user ? (
                      <button onClick={() => { handleLogout(); setIsOpen(false); }} className="w-full inline-flex items-center justify-center gap-2 bg-green-700 text-white px-4 py-2 rounded-md">Sign out</button>
                    ) : (
                      <button onClick={() => { setLoginOpen(true); setIsOpen(false); }} className="w-full inline-flex items-center justify-center gap-2 bg-green-700 text-white px-4 py-2 rounded-md">Sign in</button>
                    )}
                  </div>
                </nav>
              </MAside>
            </MDiv>
          )}
        </AnimatePresence>

        <main className="relative z-10 max-w-7xl mx-auto px-6 py-8">
          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                <p className="text-green-700">Loading dashboard data...</p>
              </div>
            </div>
          )}

          {!isLoading && (
            <>
              {/* Welcome Section */}
              <div className="mb-8">
                <motion.div initial={{ y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }}>
                  <div className="bg-white rounded-2xl shadow-lg border border-green-200 p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-2xl font-bold text-green-900">Welcome back, {user?.displayName || 'User'}!</h2>
                        <p className="text-green-700 mt-1">Here is what is happening with FRA claims and village development today.</p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-green-600">Last updated</div>
                        <div className="text-lg font-semibold text-green-900">{new Date().toLocaleDateString()}</div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Key Performance Indicators */}
              <div className="mb-8">
                <motion.div initial={{ y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5, delay: 0.1 }}>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {kpis.map((kpi, index) => (
                      <div key={index} className="bg-white rounded-xl shadow-md border border-green-200 p-6 hover:shadow-lg transition-shadow">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-green-600">{kpi.label}</p>
                            <p className="text-2xl font-bold text-green-900 mt-1">{kpi.value}</p>
                            <div className="flex items-center mt-2">
                              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                              <span className="text-sm text-green-600">{kpi.trend}</span>
                            </div>
                          </div>
                          <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${kpi.color === 'emerald' ? 'bg-emerald-100' :
                            kpi.color === 'blue' ? 'bg-blue-100' :
                              kpi.color === 'purple' ? 'bg-purple-100' :
                                kpi.color === 'orange' ? 'bg-orange-100' :
                                  'bg-gray-100'
                            }`}>
                            <kpi.icon className={`h-6 w-6 ${kpi.color === 'emerald' ? 'text-emerald-600' :
                              kpi.color === 'blue' ? 'text-blue-600' :
                                kpi.color === 'purple' ? 'text-purple-600' :
                                  kpi.color === 'orange' ? 'text-orange-600' :
                                    'text-gray-600'
                              }`} />
                          </div>
                        </div>
                        <div className="mt-4">
                          <Sparkline data={timeSeries.slice(-7)} />
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </div>

              {/* Quick Actions & Recent Activity */}
              <div className="mb-8">
                <motion.div initial={{ y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5, delay: 0.15 }}>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Quick Actions */}
                    <div className="bg-white rounded-xl shadow-md border border-green-200 p-6">
                      <h3 className="text-lg font-semibold text-green-900 mb-4 flex items-center gap-2">
                        <Activity className="h-5 w-5" />
                        Quick Actions
                      </h3>
                      <div className="space-y-3">
                        <button className="w-full flex items-center gap-3 p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors text-left">
                          <FileText className="h-5 w-5 text-green-600" />
                          <div>
                            <div className="font-medium text-green-900">New FRA Claim</div>
                            <div className="text-sm text-green-600">Process a new forest rights claim</div>
                          </div>
                        </button>
                        <button className="w-full flex items-center gap-3 p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors text-left">
                          <MapPin className="h-5 w-5 text-blue-600" />
                          <div>
                            <div className="font-medium text-green-900">Map Analysis</div>
                            <div className="text-sm text-green-600">Analyze village boundaries</div>
                          </div>
                        </button>
                        <button className="w-full flex items-center gap-3 p-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors text-left">
                          <Download className="h-5 w-5 text-purple-600" />
                          <div>
                            <div className="font-medium text-green-900">Export Report</div>
                            <div className="text-sm text-green-600">Generate comprehensive report</div>
                          </div>
                        </button>
                        <button className="w-full flex items-center gap-3 p-3 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors text-left">
                          <Users className="h-5 w-5 text-orange-600" />
                          <div>
                            <div className="font-medium text-green-900">Team Assignment</div>
                            <div className="text-sm text-green-600">Assign tasks to field officers</div>
                          </div>
                        </button>
                      </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="bg-white rounded-xl shadow-md border border-green-200 p-6">
                      <h3 className="text-lg font-semibold text-green-900 mb-4 flex items-center gap-2">
                        <Calendar className="h-5 w-5" />
                        Recent Activity
                      </h3>
                      <div className="space-y-4">
                        <div className="flex items-start gap-3">
                          <div className="h-2 w-2 bg-green-500 rounded-full mt-2"></div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-green-900">New claim processed</p>
                            <p className="text-xs text-green-600">Village: Chandrapur • 2 hours ago</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="h-2 w-2 bg-blue-500 rounded-full mt-2"></div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-green-900">Boundary survey completed</p>
                            <p className="text-xs text-green-600">District: Raipur • 4 hours ago</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="h-2 w-2 bg-purple-500 rounded-full mt-2"></div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-green-900">Report generated</p>
                            <p className="text-xs text-green-600">Monthly summary • 1 day ago</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="h-2 w-2 bg-orange-500 rounded-full mt-2"></div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-green-900">Officer assigned</p>
                            <p className="text-xs text-green-600">Team Alpha • 2 days ago</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* System Status */}
                    <div className="bg-white rounded-xl shadow-md border border-green-200 p-6">
                      <h3 className="text-lg font-semibold text-green-900 mb-4 flex items-center gap-2">
                        <Server className="h-5 w-5" />
                        System Status
                      </h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-green-700">API Services</span>
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                            <span className="text-xs text-green-600">Online</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-green-700">Database</span>
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                            <span className="text-xs text-green-600">Healthy</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-green-700">OCR Engine</span>
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                            <span className="text-xs text-green-600">Active</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-green-700">Map Services</span>
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 bg-yellow-500 rounded-full"></div>
                            <span className="text-xs text-yellow-600">Maintenance</span>
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 pt-4 border-t border-green-100">
                        <div className="text-xs text-green-600">
                          Last maintenance: 2 hours ago
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Data Visualization Section */}
              <div className="mb-8">
                <motion.div initial={{ y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5, delay: 0.2 }}>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Claims Trend Chart */}
                    <div className="bg-white rounded-xl shadow-md border border-green-200 p-6">
                      <h3 className="text-lg font-semibold text-green-900 mb-4">Claims Processing Trend</h3>
                      <div className="h-64 flex items-end justify-between gap-2">
                        {timeSeries.slice(-12).map((value: number, index: number) => (
                          <div key={index} className="flex flex-col items-center flex-1">
                            <div
                              className="bg-green-500 rounded-t w-full transition-all hover:bg-green-600"
                              style={{ height: `${(value / Math.max(...timeSeries)) * 200}px` }}
                            ></div>
                            <span className="text-xs text-green-600 mt-2">{index + 1}</span>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 flex justify-between text-sm text-green-600">
                        <span>Monthly claims processed</span>
                        <span className="font-medium">+{Math.round((timeSeries[timeSeries.length - 1] - timeSeries[timeSeries.length - 2]) / timeSeries[timeSeries.length - 2] * 100)}% this month</span>
                      </div>
                    </div>

                    {/* Priority Distribution */}
                    <div className="bg-white rounded-xl shadow-md border border-green-200 p-6">
                      <h3 className="text-lg font-semibold text-green-900 mb-4">Priority Distribution</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="h-4 w-4 bg-red-500 rounded"></div>
                            <span className="text-sm text-green-700">High Priority</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-24 h-2 bg-gray-200 rounded">
                              <div className="h-2 bg-red-500 rounded" style={{ width: '35%' }}></div>
                            </div>
                            <span className="text-sm font-medium text-green-900">35%</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="h-4 w-4 bg-yellow-500 rounded"></div>
                            <span className="text-sm text-green-700">Medium Priority</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-24 h-2 bg-gray-200 rounded">
                              <div className="h-2 bg-yellow-500 rounded" style={{ width: '45%' }}></div>
                            </div>
                            <span className="text-sm font-medium text-green-900">45%</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="h-4 w-4 bg-green-500 rounded"></div>
                            <span className="text-sm text-green-700">Low Priority</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-24 h-2 bg-gray-200 rounded">
                              <div className="h-2 bg-green-500 rounded" style={{ width: '20%' }}></div>
                            </div>
                            <span className="text-sm font-medium text-green-900">20%</span>
                          </div>
                        </div>
                      </div>
                      <div className="mt-6 pt-4 border-t border-green-100">
                        <div className="text-sm text-green-600">
                          Total villages monitored: <span className="font-medium">{filtered.length}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Interactive Map Preview */}
              <div className="mb-8">
                <motion.div initial={{ y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5, delay: 0.25 }}>
                  <div className="bg-white rounded-xl shadow-md border border-green-200 p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-semibold text-green-900">Interactive Map Preview</h3>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setFiltersCollapsed(!filtersCollapsed)}
                          className="flex items-center gap-2 px-3 py-2 bg-green-100 hover:bg-green-200 rounded-lg transition-colors text-sm"
                        >
                          <Filter className="h-4 w-4" />
                          Filters
                        </button>
                        <button
                          onClick={handleExportMap}
                          className="flex items-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm"
                        >
                          <Download className="h-4 w-4" />
                          Export
                        </button>
                      </div>
                    </div>

                    {/* Filters Panel */}
                    {!filtersCollapsed && (
                      <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-green-700 mb-2">State</label>
                            <select
                              value={stateFilter}
                              onChange={(e) => setStateFilter(e.target.value)}
                              className="w-full px-3 py-2 border border-green-200 rounded-lg bg-white text-green-900"
                            >
                              {STATES.map(state => (
                                <option key={state.name} value={state.name}>{state.name}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-green-700 mb-2">District</label>
                            <select
                              value={districtFilter}
                              onChange={(e) => setDistrictFilter(e.target.value)}
                              className="w-full px-3 py-2 border border-green-200 rounded-lg bg-white text-green-900"
                            >
                              <option value="All">All Districts</option>
                              <option value="Raipur">Raipur</option>
                              <option value="Bilaspur">Bilaspur</option>
                              <option value="Durg">Durg</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-green-700 mb-2">Search Village</label>
                            <input
                              type="text"
                              value={villageQuery}
                              onChange={(e) => setVillageQuery(e.target.value)}
                              placeholder="Enter village name..."
                              className="w-full px-3 py-2 border border-green-200 rounded-lg bg-white text-green-900"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Map Container */}
                    <div className="relative h-96 bg-green-50 rounded-lg border border-green-200 overflow-hidden">
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
                      <div className="absolute top-4 left-4 bg-white rounded-lg shadow-md p-3">
                        <div className="flex items-center gap-2 text-sm text-green-700">
                          <MapPin className="h-4 w-4" />
                          <span>{stateFilter}, {districtFilter}</span>
                        </div>
                      </div>
                      <div className="absolute bottom-4 right-4 bg-white rounded-lg shadow-md p-3">
                        <div className="text-xs text-green-600">
                          Zoom: 8x • Layers: {layers.filter(l => l.visible).length}/{layers.length}
                        </div>
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
                          <span className="text-sm text-green-700">{layer.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Platform Overview Section */}
              <div className="mt-12">
                <motion.div initial={{ y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5, delay: 0.2 }}>
                  <div className="bg-white rounded-2xl shadow-lg border border-green-200 p-8">
                    <div className="text-center mb-8">
                      <h2 className="text-3xl font-bold text-green-900 mb-2">Explore VanMitra Platform</h2>
                      <p className="text-green-700">Discover all the powerful features available in our FRA management system</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {/* Atlas Mini Preview */}
                      <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl p-6 border border-green-200 hover:shadow-lg transition-shadow">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="h-10 w-10 rounded-lg bg-green-600 flex items-center justify-center">
                            <Layers className="text-white" size={20} />
                          </div>
                          <div>
                            <h3 className="font-semibold text-green-900">Interactive Atlas</h3>
                            <p className="text-sm text-green-700">Map-based visualization</p>
                          </div>
                        </div>

                        <div className="bg-white rounded-lg p-4 mb-4 border border-green-100">
                          <div className="text-xs text-green-600 mb-2">Map Preview</div>
                          <div className="h-20 bg-green-50 rounded border border-dashed border-green-200 flex items-center justify-center">
                            <div className="text-center">
                              <Globe className="mx-auto text-green-400 mb-1" size={16} />
                              <div className="text-xs text-green-600">Interactive Map</div>
                            </div>
                          </div>
                          <div className="mt-2 flex justify-between text-xs text-green-700">
                            <span>Claims: {dashboardData.kpis?.claims || 0}</span>
                            <span>Layers: 5+</span>
                          </div>
                        </div>

                        <Link href="/atlas" className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm w-full justify-center">
                          Open Atlas <ArrowRight size={14} />
                        </Link>
                      </div>

                      {/* DSS Mini Preview */}
                      <div className="bg-gradient-to-br from-blue-50 to-cyan-100 rounded-xl p-6 border border-blue-200 hover:shadow-lg transition-shadow">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="h-10 w-10 rounded-lg bg-blue-600 flex items-center justify-center">
                            <BookOpen className="text-white" size={20} />
                          </div>
                          <div>
                            <h3 className="font-semibold text-green-900">Decision Support</h3>
                            <p className="text-sm text-green-700">Scheme recommendations</p>
                          </div>
                        </div>

                        <div className="bg-white rounded-lg p-4 mb-4 border border-blue-100">
                          <div className="text-xs text-blue-600 mb-2">Location Input</div>
                          <div className="space-y-2">
                            <input
                              type="number"
                              placeholder="Latitude"
                              className="w-full px-2 py-1 text-xs border border-blue-200 rounded bg-blue-50"
                              readOnly
                            />
                            <input
                              type="number"
                              placeholder="Longitude"
                              className="w-full px-2 py-1 text-xs border border-blue-200 rounded bg-blue-50"
                              readOnly
                            />
                          </div>
                          <div className="mt-2 text-xs text-blue-700">
                            Get personalized scheme recommendations
                          </div>
                        </div>

                        <Link href="/dss" className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm w-full justify-center">
                          Get Recommendations <ArrowRight size={14} />
                        </Link>
                      </div>

                      {/* OCR Mini Preview */}
                      <div className="bg-gradient-to-br from-purple-50 to-violet-100 rounded-xl p-6 border border-purple-200 hover:shadow-lg transition-shadow">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="h-10 w-10 rounded-lg bg-purple-600 flex items-center justify-center">
                            <Upload className="text-white" size={20} />
                          </div>
                          <div>
                            <h3 className="font-semibold text-green-900">OCR Processing</h3>
                            <p className="text-sm text-green-700">Document digitization</p>
                          </div>
                        </div>

                        <div className="bg-white rounded-lg p-4 mb-4 border border-purple-100">
                          <div className="text-xs text-purple-600 mb-2">Upload Document</div>
                          <div className="h-16 border-2 border-dashed border-purple-200 rounded flex items-center justify-center bg-purple-50">
                            <div className="text-center">
                              <Upload className="mx-auto text-purple-400 mb-1" size={16} />
                              <div className="text-xs text-purple-600">Drop image here</div>
                            </div>
                          </div>
                          <div className="mt-2 text-xs text-purple-700">
                            Extract text & create claims automatically
                          </div>
                        </div>

                        <Link href="/ocr" className="inline-flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors text-sm w-full justify-center">
                          Process Document <ArrowRight size={14} />
                        </Link>
                      </div>

                      {/* Admin Mini Preview */}
                      <div className="bg-gradient-to-br from-orange-50 to-amber-100 rounded-xl p-6 border border-orange-200 hover:shadow-lg transition-shadow">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="h-10 w-10 rounded-lg bg-orange-600 flex items-center justify-center">
                            <Server className="text-white" size={20} />
                          </div>
                          <div>
                            <h3 className="font-semibold text-green-900">Admin Panel</h3>
                            <p className="text-sm text-green-700">Document management</p>
                          </div>
                        </div>

                        <div className="bg-white rounded-lg p-4 mb-4 border border-orange-100">
                          <div className="text-xs text-orange-600 mb-2">Document Upload</div>
                          <div className="space-y-2">
                            <div className="h-8 bg-orange-50 rounded border border-orange-200 flex items-center px-2">
                              <span className="text-xs text-orange-600">Select PDF/TIFF file...</span>
                            </div>
                            <div className="flex gap-2">
                              <button className="flex-1 bg-orange-600 text-white px-2 py-1 rounded text-xs" disabled>Upload</button>
                              <button className="flex-1 border border-orange-200 px-2 py-1 rounded text-xs" disabled>Verify</button>
                            </div>
                          </div>
                          <div className="mt-2 text-xs text-orange-700">
                            Upload & verify FRA documents
                          </div>
                        </div>

                        <Link href="/admin" className="inline-flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors text-sm w-full justify-center">
                          Admin Panel <ArrowRight size={14} />
                        </Link>
                      </div>

                      {/* Public Mini Preview */}
                      <div className="bg-gradient-to-br from-teal-50 to-cyan-100 rounded-xl p-6 border border-teal-200 hover:shadow-lg transition-shadow">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="h-10 w-10 rounded-lg bg-teal-600 flex items-center justify-center">
                            <Eye className="text-white" size={20} />
                          </div>
                          <div>
                            <h3 className="font-semibold text-green-900">Public View</h3>
                            <p className="text-sm text-green-700">Aggregated insights</p>
                          </div>
                        </div>

                        <div className="bg-white rounded-lg p-4 mb-4 border border-teal-100">
                          <div className="text-xs text-teal-600 mb-2">Public Statistics</div>
                          <div className="grid grid-cols-3 gap-2">
                            <div className="text-center">
                              <div className="text-lg font-bold text-teal-800">{dashboardData.kpis?.claims || 0}</div>
                              <div className="text-xs text-teal-600">Claims</div>
                            </div>
                            <div className="text-center">
                              <div className="text-lg font-bold text-teal-800">{dashboardData.kpis?.grants || 0}</div>
                              <div className="text-xs text-teal-600">Granted</div>
                            </div>
                            <div className="text-center">
                              <div className="text-lg font-bold text-teal-800">{filtered.length || 0}</div>
                              <div className="text-xs text-teal-600">Villages</div>
                            </div>
                          </div>
                          <div className="mt-2 text-xs text-teal-700">
                            Public FRA progress overview
                          </div>
                        </div>

                        <Link href="/public" className="inline-flex items-center gap-2 bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors text-sm w-full justify-center">
                          View Public Data <ArrowRight size={14} />
                        </Link>
                      </div>

                      {/* Analytics Mini Preview */}
                      <div className="bg-gradient-to-br from-indigo-50 to-blue-100 rounded-xl p-6 border border-indigo-200 hover:shadow-lg transition-shadow">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="h-10 w-10 rounded-lg bg-indigo-600 flex items-center justify-center">
                            <BarChart3 className="text-white" size={20} />
                          </div>
                          <div>
                            <h3 className="font-semibold text-green-900">Analytics Hub</h3>
                            <p className="text-sm text-green-700">Advanced insights</p>
                          </div>
                        </div>

                        <div className="bg-white rounded-lg p-4 mb-4 border border-indigo-100">
                          <div className="text-xs text-indigo-600 mb-2">Analytics Dashboard</div>
                          <div className="space-y-2">
                            <div className="h-6 bg-indigo-100 rounded flex items-center px-2">
                              <div className="w-3/4 h-2 bg-indigo-400 rounded"></div>
                            </div>
                            <div className="h-6 bg-indigo-100 rounded flex items-center px-2">
                              <div className="w-1/2 h-2 bg-indigo-400 rounded"></div>
                            </div>
                            <div className="h-6 bg-indigo-100 rounded flex items-center px-2">
                              <div className="w-5/6 h-2 bg-indigo-400 rounded"></div>
                            </div>
                          </div>
                          <div className="mt-2 text-xs text-indigo-700">
                            Detailed analytics & reporting
                          </div>
                        </div>

                        <button className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors text-sm w-full justify-center">
                          Coming Soon <ArrowRight size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </>
          )}
        </main>

        {/* Detail modal for recommendation */}
        {selected && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-lg shadow-lg w-11/12 max-w-2xl p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-green-900">{selected.village}</h3>
                  <div className="text-sm text-green-700">Recommended: {selected.scheme}</div>
                </div>
                <div>
                  <button onClick={() => setSelected(null)} className="text-sm px-3 py-1 bg-slate-100 rounded-md">Close</button>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-green-800">Priority score</h4>
                  <div className="text-2xl font-bold text-green-900">{(selected.score * 100).toFixed(0)}%</div>
                  <div className="mt-3 text-sm text-green-700">This recommendation is generated by combining rule-based eligibility and AI-derived indicators.</div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-green-800">Actions</h4>
                  <div className="mt-2 flex flex-col gap-2">
                    <button className="inline-flex items-center gap-2 bg-green-700 text-white px-4 py-2 rounded-md">Create Plan</button>
                    <button className="inline-flex items-center gap-2 border border-green-200 px-4 py-2 rounded-md">Assign to Officer</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
