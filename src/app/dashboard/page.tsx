"use client";

import React, { useMemo, useState, useEffect, useRef } from "react";
import { STATES, DEFAULT_STATE, DEFAULT_DISTRICT } from '../../lib/regions';
import { BarChart, Menu, Shield, X } from "lucide-react"; // icons
import { motion, AnimatePresence, HTMLMotionProps } from "framer-motion";
// Framer-motion's JSX generics sometimes conflict with the project's TS setup.
// Create lightweight aliases cast to any so we can use className/onClick without type errors.
const MDiv: React.FC<HTMLMotionProps<"div">> = motion.div;
const MBackdrop: React.FC<HTMLMotionProps<"div">> = motion.div;
const MAside: React.FC<HTMLMotionProps<"aside">> = motion.aside;
import { Leaf, MapPin, Database, Target, Satellite, ArrowRight, TrendingUp, Users, FileText, BarChart3, Activity, Calendar, Download, Filter, Layers, BookOpen, Upload, Server, Eye, Globe } from "lucide-react";
import ThreeBackground from "@/components/ui/ThreeBackground";
import DecorativeElements from "@/components/ui/DecorativeElements";
import FloatingOrbs from "@/components/ui/FloatingOrbs";
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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-green-900 to-emerald-900 text-white relative overflow-hidden">
        <ThreeBackground />
        <DecorativeElements />
        <FloatingOrbs />

        <Navbar />

        <main className="relative z-10 max-w-7xl mx-auto px-6 py-8">
          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400 mx-auto mb-4"></div>
                <p className="text-emerald-200">Loading dashboard data...</p>
              </div>
            </div>
          )}

          {!isLoading && (
            <>
              {/* Welcome Section */}
              <div className="mb-8">
                <motion.div initial={{ y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }}>
                  <GlassCard className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-2xl font-bold text-white">Welcome back, {user?.displayName || 'User'}!</h2>
                        <p className="text-emerald-200 mt-1">Here is what is happening with FRA claims and village development today.</p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-emerald-200">Last updated</div>
                        <div className="text-lg font-semibold text-white">{new Date().toLocaleDateString()}</div>
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
                        className="p-6 hover:shadow-lg transition-shadow"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-emerald-200">{kpi.label}</p>
                            <p className="text-2xl font-bold text-white mt-1">{kpi.value}</p>
                            <div className="flex items-center mt-2">
                              <TrendingUp className="h-4 w-4 text-emerald-300 mr-1" />
                              <span className="text-sm text-emerald-200">{kpi.trend}</span>
                            </div>
                          </div>

                          {/* Glassy icon container instead of solid pastel */}
                          <div
                            className={`h-12 w-12 rounded-xl flex items-center justify-center 
                          bg-white/5 border border-white/10 backdrop-blur-sm`}
                          >
                            <kpi.icon
                              className={`h-6 w-6 
                  ${kpi.color === 'emerald' ? 'text-emerald-400' :
                                  kpi.color === 'blue' ? 'text-blue-400' :
                                    kpi.color === 'purple' ? 'text-purple-400' :
                                      kpi.color === 'orange' ? 'text-orange-400' :
                                        'text-gray-400'
                                }`}
                            />
                          </div>
                        </div>

                        <div className="mt-4">
                          <Sparkline data={timeSeries.slice(-7)} />
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
                    <GlassCard className="p-6">
                      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <Activity className="h-5 w-5" />
                        Quick Actions
                      </h3>

                      <div className="space-y-3">
                        <button className="w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left bg-white/5 border border-white/10 hover:bg-white/10">
                          <FileText className="h-5 w-5 text-emerald-400" />
                          <div>
                            <div className="font-medium text-white">New FRA Claim</div>
                            <div className="text-sm text-emerald-200">Process a new forest rights claim</div>
                          </div>
                        </button>

                        <button className="w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left bg-white/5 border border-white/10 hover:bg-white/10">
                          <MapPin className="h-5 w-5 text-blue-400" />
                          <div>
                            <div className="font-medium text-white">Map Analysis</div>
                            <div className="text-sm text-emerald-200">Analyze village boundaries</div>
                          </div>
                        </button>

                        <button className="w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left bg-white/5 border border-white/10 hover:bg-white/10">
                          <Download className="h-5 w-5 text-purple-400" />
                          <div>
                            <div className="font-medium text-white">Export Report</div>
                            <div className="text-sm text-emerald-200">Generate comprehensive report</div>
                          </div>
                        </button>

                        <button className="w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left bg-white/5 border border-white/10 hover:bg-white/10">
                          <Users className="h-5 w-5 text-orange-400" />
                          <div>
                            <div className="font-medium text-white">Team Assignment</div>
                            <div className="text-sm text-emerald-200">Assign tasks to field officers</div>
                          </div>
                        </button>
                      </div>
                    </GlassCard>


                    {/* Recent Activity */}
                    <GlassCard className="p-6">
                      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <Calendar className="h-5 w-5" />
                        Recent Activity
                      </h3>
                      <div className="space-y-4">
                        <div className="flex items-start gap-3">
                          <div className="h-2 w-2 bg-green-500 rounded-full mt-2"></div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-white">New claim processed</p>
                            <p className="text-xs text-emerald-200">Village: Chandrapur • 2 hours ago</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="h-2 w-2 bg-blue-500 rounded-full mt-2"></div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-white">Boundary survey completed</p>
                            <p className="text-xs text-emerald-200">District: Raipur • 4 hours ago</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="h-2 w-2 bg-purple-500 rounded-full mt-2"></div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-white">Report generated</p>
                            <p className="text-xs text-emerald-200">Monthly summary • 1 day ago</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="h-2 w-2 bg-orange-500 rounded-full mt-2"></div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-white">Officer assigned</p>
                            <p className="text-xs text-emerald-200">Team Alpha • 2 days ago</p>
                          </div>
                        </div>
                      </div>
                    </GlassCard>

                    {/* System Status */}
                    <GlassCard className="p-6">
                      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <Server className="h-5 w-5" />
                        System Status
                      </h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-emerald-200">API Services</span>
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                            <span className="text-xs text-emerald-200">Online</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-emerald-200">Database</span>
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                            <span className="text-xs text-emerald-200">Healthy</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-emerald-200">OCR Engine</span>
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                            <span className="text-xs text-emerald-200">Active</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-emerald-200">Map Services</span>
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 bg-yellow-500 rounded-full"></div>
                            <span className="text-xs text-yellow-600">Maintenance</span>
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 pt-4 border-t border-white/10">
                        <div className="text-xs text-emerald-200">
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
                    <GlassCard className="p-6">
                      <h3 className="text-lg font-semibold text-white mb-4">Claims Processing Trend</h3>
                      <div className="h-64 flex items-end justify-between gap-2">
                        {timeSeries.slice(-12).map((value: number, index: number) => (
                          <div key={index} className="flex flex-col items-center flex-1">
                            <div
                              className="bg-emerald-500 rounded-t w-full transition-all hover:bg-emerald-600"
                              style={{ height: `${(value / Math.max(...timeSeries)) * 200}px` }}
                            ></div>
                            <span className="text-xs text-emerald-200 mt-2">{index + 1}</span>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 flex justify-between text-sm text-emerald-200">
                        <span>Monthly claims processed</span>
                        <span className="font-medium">+{Math.round((timeSeries[timeSeries.length - 1] - timeSeries[timeSeries.length - 2]) / timeSeries[timeSeries.length - 2] * 100)}% this month</span>
                      </div>
                    </GlassCard>

                    <GlassCard className="p-6">
                      <h3 className="text-lg font-semibold text-white mb-4">Priority Distribution</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="h-4 w-4 bg-red-500 rounded"></div>
                            <span className="text-sm text-emerald-200">High Priority</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-24 h-2 bg-white/10 rounded">
                              <div className="h-2 bg-red-500 rounded" style={{ width: '35%' }}></div>
                            </div>
                            <span className="text-sm font-medium text-white">35%</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="h-4 w-4 bg-yellow-500 rounded"></div>
                            <span className="text-sm text-emerald-200">Medium Priority</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-24 h-2 bg-white/10 rounded">
                              <div className="h-2 bg-yellow-500 rounded" style={{ width: '45%' }}></div>
                            </div>
                            <span className="text-sm font-medium text-white">45%</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="h-4 w-4 bg-green-500 rounded"></div>
                            <span className="text-sm text-emerald-200">Low Priority</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-24 h-2 bg-white/10 rounded">
                              <div className="h-2 bg-emerald-500 rounded" style={{ width: '20%' }}></div>
                            </div>
                            <span className="text-sm font-medium text-white">20%</span>
                          </div>
                        </div>
                      </div>
                      <div className="mt-6 pt-4 border-t border-white/10">
                        <div className="text-sm text-emerald-200">
                          Total villages monitored: <span className="font-medium text-white">{filtered.length}</span>
                        </div>
                      </div>
                    </GlassCard>
                  </div>
                </motion.div>
              </div>

              {/* Interactive Map Preview */}
              <div className="mb-8">
                <motion.div initial={{ y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5, delay: 0.25 }}>
                  <GlassCard className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-semibold text-white">Interactive Map Preview</h3>

                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setFiltersCollapsed(!filtersCollapsed)}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm 
                   bg-white/5 border border-white/10 hover:bg-white/10"
                        >
                          <Filter className="h-4 w-4 text-emerald-400" />
                          <span className="text-white">Filters</span>
                        </button>

                        <button
                          onClick={handleExportMap}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm 
                   bg-white/5 border border-white/10 hover:bg-white/10"
                        >
                          <Download className="h-4 w-4 text-green-400" />
                          <span className="text-white">Export</span>
                        </button>
                      </div>
                    </div>

                    {/* Filters Panel */}
                    {!filtersCollapsed && (
                      <motion.div
                        className="mb-6 p-6 rounded-3xl border border-emerald-700/50 bg-gradient-to-r from-emerald-900/20 to-green-900/20 backdrop-blur-xl shadow-2xl"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                      >
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-emerald-200 mb-2">State</label>
                            <motion.select
                              value={stateFilter}
                              onChange={(e) => setStateFilter(e.target.value)}
                              className="w-full px-4 py-2 rounded-2xl border border-emerald-700/50 bg-gradient-to-r from-emerald-900/20 to-green-900/20 backdrop-blur-sm text-white placeholder-green-300 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 hover:bg-gradient-to-r hover:from-emerald-900/30 hover:to-green-900/30 transition-all duration-300 cursor-pointer"
                              whileHover={{ scale: 1.02 }}
                              whileFocus={{ scale: 1.02 }}
                              transition={{ type: "spring", stiffness: 300 }}
                            >
                              {STATES.map(state => (
                                <option key={state.name} value={state.name} className="bg-slate-900 text-white">{state.name}</option>
                              ))}
                            </motion.select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-emerald-200 mb-2">District</label>
                            <motion.select
                              value={districtFilter}
                              onChange={(e) => setDistrictFilter(e.target.value)}
                              className="w-full px-4 py-2 rounded-2xl border border-emerald-700/50 bg-gradient-to-r from-emerald-900/20 to-green-900/20 backdrop-blur-sm text-white placeholder-green-300 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 hover:bg-gradient-to-r hover:from-emerald-900/30 hover:to-green-900/30 transition-all duration-300 cursor-pointer"
                              whileHover={{ scale: 1.02 }}
                              whileFocus={{ scale: 1.02 }}
                              transition={{ type: "spring", stiffness: 300 }}
                            >
                              <option value="All" className="bg-slate-900 text-white">All Districts</option>
                              <option value="Raipur" className="bg-slate-900 text-white">Raipur</option>
                              <option value="Bilaspur" className="bg-slate-900 text-white">Bilaspur</option>
                              <option value="Durg" className="bg-slate-900 text-white">Durg</option>
                            </motion.select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-emerald-200 mb-2">Search Village</label>
                            <motion.input
                              type="text"
                              value={villageQuery}
                              onChange={(e) => setVillageQuery(e.target.value)}
                              placeholder="Enter village name..."
                              className="w-full px-4 py-2 rounded-2xl border border-emerald-700/50 bg-gradient-to-r from-emerald-900/20 to-green-900/20 backdrop-blur-sm text-white placeholder-green-300 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 hover:bg-gradient-to-r hover:from-emerald-900/30 hover:to-green-900/30 transition-all duration-300"
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
                        <GlassCard className="p-2">
                          <div className="flex items-center gap-2 text-sm text-emerald-700">
                            <MapPin className="h-4 w-4" />
                            <span className="text-white">{stateFilter}, {districtFilter}</span>
                          </div>
                        </GlassCard>
                      </div>
                      <div className="absolute bottom-4 right-4">
                        <GlassCard className="p-2">
                          <div className="text-xs text-emerald-600">
                            <span className="text-white">Zoom: 8x</span>
                            <span className="mx-2">•</span>
                            <span className="text-white">Layers: {layers.filter(l => l.visible).length}/{layers.length}</span>
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
                          <span className="text-sm text-emerald-200">{layer.name}</span>
                        </div>
                      ))}
                    </div>
                  </GlassCard>
                </motion.div>
              </div>

              {/* Platform Overview Section */}
              <section className="relative mt-20">
                {/* Background accent */}
                <div className="absolute inset-0 bg-gradient-to-b from-emerald-900/20 to-transparent rounded-3xl blur-3xl" />

                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                  className="relative"
                >
                  {/* Section header */}
                  <div className="text-center mb-14">
                    <span className="px-3 py-1 text-xs font-medium uppercase tracking-wider text-emerald-300 bg-emerald-800/30 rounded-full">
                      Features
                    </span>
                    <h2 className="text-4xl md:text-5xl font-extrabold text-white mt-4">
                      Explore VanMitra Platform
                    </h2>
                    <p className="text-emerald-200 mt-3 max-w-2xl mx-auto">
                      Discover powerful tools for forest rights management and empower
                      communities with data-driven insights.
                    </p>
                    <div className="mt-5 h-1 w-28 bg-gradient-to-r from-emerald-400 to-green-600 mx-auto rounded-full shadow-lg" />
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
                        preview: (
                          <div className="h-28 flex items-center justify-center bg-emerald-500/5 rounded-lg">
                            <Globe className="h-10 w-10 text-emerald-400" />
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
                          <div className="h-28 flex flex-col justify-center items-center gap-2 bg-blue-500/5 rounded-lg">
                            <input
                              type="text"
                              placeholder="Latitude"
                              className="w-32 px-2 py-1 text-xs rounded bg-blue-950/20 border border-blue-400/30 text-blue-200"
                              readOnly
                            />
                            <input
                              type="text"
                              placeholder="Longitude"
                              className="w-32 px-2 py-1 text-xs rounded bg-blue-950/20 border border-blue-400/30 text-blue-200"
                              readOnly
                            />
                          </div>
                        ),
                      },
                      {
                        title: "OCR Processing",
                        desc: "Digitize & extract data from documents",
                        icon: Upload,
                        color: "purple",
                        href: "/ocr",
                        preview: (
                          <div className="h-28 border-2 border-dashed border-purple-400/40 rounded-lg flex items-center justify-center bg-purple-500/5">
                            <Upload className="h-8 w-8 text-purple-400" />
                            <span className="text-xs text-purple-200 ml-2">Drop file</span>
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
                          <div className="h-28 flex flex-col justify-center items-center bg-red-500/5 rounded-lg">
                            <Users className="h-8 w-8 text-red-400 mb-2" />
                            <span className="text-xs text-red-200">Role: Super Admin</span>
                          </div>
                        ),
                      },
                      {
                        title: "Public Portal",
                        desc: "Community transparency & FRA status",
                        icon: Globe,
                        color: "teal",
                        href: "/public",
                        preview: (
                          <div className="h-28 grid grid-cols-3 text-center bg-teal-500/5 rounded-lg">
                            <div>
                              <p className="text-lg font-bold text-teal-300">123</p>
                              <p className="text-xs text-teal-200">Claims</p>
                            </div>
                            <div>
                              <p className="text-lg font-bold text-teal-300">45</p>
                              <p className="text-xs text-teal-200">Granted</p>
                            </div>
                            <div>
                              <p className="text-lg font-bold text-teal-300">67</p>
                              <p className="text-xs text-teal-200">Villages</p>
                            </div>
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
                          <div className="h-28 flex flex-col gap-2 justify-center px-4 bg-indigo-500/5 rounded-lg">
                            <div className="h-2 w-3/4 bg-indigo-400/60 rounded"></div>
                            <div className="h-2 w-1/2 bg-indigo-400/60 rounded"></div>
                            <div className="h-2 w-5/6 bg-indigo-400/60 rounded"></div>
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
                        <GlassCard className="p-6 flex flex-col h-full backdrop-blur-xl border border-white/10 hover:shadow-xl hover:shadow-emerald-500/20 transition-all duration-300">
                          {/* Card header */}
                          <div className="flex items-center gap-3 mb-5">
                            <div
                              className={`h-12 w-12 rounded-full bg-${item.color}-500/20 flex items-center justify-center shadow-inner`}
                            >
                              <item.icon className={`h-6 w-6 text-${item.color}-400`} />
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold text-white">{item.title}</h3>
                              <p className="text-sm text-emerald-200">{item.desc}</p>
                            </div>
                          </div>

                          {/* Card preview */}
                          <div className="flex-1">{item.preview}</div>

                          {/* Card CTA */}
                          <Link
                            href={item.href}
                            className={`mt-6 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-${item.color}-500 to-${item.color}-600 text-white font-medium text-sm hover:shadow-lg hover:shadow-${item.color}-500/40 transition-all`}
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
            <GlassCard className="w-11/12 max-w-2xl p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white">{selected.village}</h3>
                  <div className="text-sm text-emerald-200">Recommended: {selected.scheme}</div>
                </div>
                <div>
                  <button
                    onClick={() => setSelected(null)}
                    className="text-sm px-3 py-1 bg-white/10 text-white rounded-md"
                  >
                    Close
                  </button>
                </div>
              </div>

              <GlassCard className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-emerald-200">Priority score</h4>
                  <div className="text-2xl font-bold text-white">
                    {(selected.score * 100).toFixed(0)}%
                  </div>
                  <div className="mt-3 text-sm text-emerald-200">
                    This recommendation is generated by combining rule-based eligibility and
                    AI-derived indicators.
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-emerald-200">Actions</h4>
                  <div className="mt-2 flex flex-col gap-2">
                    <button className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-md">
                      Create Plan
                    </button>
                    <button className="inline-flex items-center gap-2 border border-white/10 px-4 py-2 rounded-md text-white/90">
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
