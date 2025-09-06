"use client";

import React, { useMemo, useState, useEffect, useRef } from "react";
import { STATES, DEFAULT_STATE, DEFAULT_DISTRICT } from '../../lib/regions';
import { motion } from "framer-motion";
import { MapPin, Database, Target, Satellite, ArrowRight, TrendingUp, Users, FileText, BarChart3, Activity, Calendar, Download, Filter } from "lucide-react";
import DecorativeBackground from "@/components/DecorativeBackground";
import Link from "next/link";
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

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-green-100 text-green-900 relative overflow-hidden">
      <DecorativeBackground count={8} />
      <header className="relative z-10 max-w-7xl mx-auto px-6 pt-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-green-600 flex items-center justify-center border border-green-700 shadow-md">
            <BarChart3 className="text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-green-900">VanMitra Dashboard</h1>
            <p className="text-xs text-green-700">FRA Management & Analytics Platform</p>
          </div>
        </div>
        <nav className="flex items-center gap-4">
          <Link href="/" className="text-sm text-green-800 font-medium hover:text-green-600 transition-colors">Home</Link>
          <Link href="/atlas" className="text-sm text-green-800 font-medium hover:text-green-600 transition-colors">Atlas</Link>
          <button onClick={handleLogout} className="inline-flex items-center gap-2 bg-green-700 text-white px-4 py-2 rounded-md shadow-md hover:bg-green-600 transition-colors text-sm">Sign out</button>
        </nav>
      </header>

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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <section className="lg:col-span-7">
            <motion.div initial={{ y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }}>
              <div className="rounded-2xl overflow-hidden shadow-2xl border border-green-300 bg-white">
                <div className="w-full h-[420px] bg-gradient-to-br from-green-50 to-emerald-100 p-6 relative">
                  <div className="absolute inset-0 bg-green-800/6 pointer-events-none"></div>
                  <div className="relative z-10 h-full flex flex-col">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs text-green-600">Map Preview</div>
                        <div className="text-lg font-semibold text-green-900">Sundarbans — Pilot</div>
                      </div>
                      <div className="text-sm text-green-700">Last updated: Aug 2025</div>
                    </div>

                    <div className="flex-1 mt-4 bg-white rounded-md border border-green-100 shadow-inner flex flex-col p-4">
                      {/* Replace this section with a MapLibre/Map component later */}
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="text-sm text-green-700 mb-2">Map preview - interactive map goes here</div>
                            <div className="h-56 bg-green-50 rounded-md border border-dashed border-green-100 relative overflow-visible">
                            <WebGIS
                              ref={webGISRef}
                              center={stateCenter as [number, number]}
                              zoom={6.5}
                              layers={layers}
                              markers={markers}
                              onFeatureClick={handleFeatureClick}
                              onMapClick={handleMapClick}
                              enableGeocoder={false}
                              enableMeasurement={false}
                              className="w-full h-full"
                              showLayerControls={false}
                              showMeasurementControls={false}
                              showExportControls={true}
                            />
                          </div>
                        </div>
                        <div className="w-44 flex flex-col items-end">
                          <div className="text-xs text-green-600">Claims over time</div>
                          <div className="mt-2">
                            <Sparkline data={timeSeries} width={140} height={48} />
                          </div>
                          <div className="text-sm text-green-700 mt-2">+12% month-over-month</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              {kpis.map((k) => (
                <div key={k.label} className="p-4 bg-white rounded-xl shadow-md border border-green-100">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-50 rounded-md text-green-700">
                      <k.icon />
                    </div>
                    <div>
                      <div className="text-xs text-green-600">{k.label}</div>
                      <div className="text-2xl font-bold text-green-800">{k.value}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <section className="mt-8">
              <h3 className="text-xl font-semibold text-green-900">Recent Recommendations</h3>
              <div className="mt-3 space-y-3">
                {filtered.length === 0 && (
                  <div className="p-4 bg-white rounded-lg shadow-sm border border-green-100 text-green-700">No recommendations for the selected filters.</div>
                )}

                {filtered.map((r) => (
                  <div key={r.id} className="p-4 bg-white rounded-lg shadow-sm border border-green-100 flex items-center justify-between hover:shadow-md transition-shadow">
                    <div>
                      <div className="flex items-center gap-2">
                        <div className={`text-sm px-2 py-1 rounded-md font-medium ${r.score > 0.9 ? 'bg-emerald-100 text-emerald-800' : r.score > 0.8 ? 'bg-yellow-100 text-amber-800' : 'bg-slate-100 text-slate-700'}`}>
                          {(r.score * 100).toFixed(0)}%
                        </div>
                        <div className="font-semibold text-green-900">{r.village}</div>
                      </div>
                      <div className="text-sm text-green-700 mt-1">Recommended: {r.scheme}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button onClick={() => setSelected(r)} className="inline-flex items-center gap-2 bg-green-700 text-white px-3 py-1 rounded-md text-sm hover:bg-green-600 transition-colors">View</button>
                      <button onClick={() => navigator.clipboard?.writeText(JSON.stringify(r))} className="inline-flex items-center gap-2 border border-green-200 px-3 py-1 rounded-md text-sm">Share</button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <div className="mt-4 flex gap-2">
              <button onClick={() => downloadCSV(filtered)} className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-md">Download CSV</button>
              <button onClick={() => alert('Run prioritization (mock)') } className="inline-flex items-center gap-2 border border-green-200 px-4 py-2 rounded-md">Run Prioritization</button>
            </div>
          </section>

          <aside className="lg:col-span-5">
            <div className="mb-6">
              <LayerManager
                layers={layers}
                initiallyCollapsed={true}
                onLayerToggle={handleLayerToggle}
                onLayerAdd={handleLayerAdd}
                onLayerRemove={handleLayerRemove}
                onLayerUpdate={handleLayerUpdate}
              />
            </div>

            <div className="p-6 bg-white rounded-xl shadow-md border border-green-100">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-green-900">Filters</h4>
                <button onClick={() => setFiltersCollapsed(prev => !prev)} className="text-sm text-green-700">{filtersCollapsed ? 'Expand' : 'Collapse'}</button>
              </div>
              {!filtersCollapsed && (
                <div className="mt-3 space-y-3 text-green-800">
                <div>
                  <label className="block text-sm text-green-700">State</label>
                  <select value={stateFilter} onChange={(e) => setStateFilter(e.target.value)} className="mt-1 w-full rounded-md border border-green-100 p-2 bg-green-50">
                    {STATES.map(s => <option key={s.code} value={s.name}>{s.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-green-700">District</label>
                  <select value={districtFilter} onChange={(e) => setDistrictFilter(e.target.value)} className="mt-1 w-full rounded-md border border-green-100 p-2 bg-green-50">
                    {(STATES.find(s => s.name === stateFilter)?.districts || []).map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-green-700">Village</label>
                  <input value={villageQuery} onChange={(e) => setVillageQuery(e.target.value)} className="mt-1 w-full rounded-md border border-green-100 p-2 bg-white" placeholder="Search village" />
                </div>

                <div className="mt-2">
                  <button onClick={() => { setVillageQuery(""); setDistrictFilter(DEFAULT_DISTRICT); setStateFilter(DEFAULT_STATE); }} className="w-full inline-flex items-center justify-center gap-2 bg-green-700 text-white px-4 py-2 rounded-md shadow-md hover:bg-green-600 transition-colors">Reset Filters</button>
                </div>
              </div>
              )}
            </div>

            <div className="mt-6 p-6 bg-white rounded-xl shadow-md border border-green-100">
              <h4 className="font-semibold text-green-900">Quick Actions</h4>
              <div className="mt-3 grid grid-cols-1 gap-3">
                <Link href="/" className="inline-flex items-center gap-2 bg-green-700 text-white px-4 py-2 rounded-md shadow-sm hover:bg-green-600 transition-colors">Open Atlas <ArrowRight size={14} /></Link>
                <button
                  onClick={handleExportMap}
                  className="inline-flex items-center gap-2 border border-green-200 px-4 py-2 rounded-md hover:bg-green-50 transition-colors"
                >
                  <Download size={14} />
                  Export Map
                </button>
                <button className="inline-flex items-center gap-2 border border-green-200 px-4 py-2 rounded-md">Upload Documents</button>
                <button className="inline-flex items-center gap-2 border border-green-200 px-4 py-2 rounded-md">Run Asset Mapping</button>
              </div>
            </div>

            <div className="mt-6 p-6 bg-white rounded-xl shadow-md border border-green-100">
              <h4 className="font-semibold text-green-900">Analytics</h4>
              <div className="mt-3 text-green-700">Simple trend charts and distribution widgets are rendered inline. Replace with Recharts/Plotly when adding the dependency.</div>
            </div>
          </aside>
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
