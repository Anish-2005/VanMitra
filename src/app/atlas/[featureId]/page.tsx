"use client";

import React, { useState, useEffect, useRef } from "react";
import * as turf from '@turf/turf';
import { Ruler, Download, Layers, ArrowLeft, ChevronDown } from 'lucide-react';
import Link from "next/link";
import DecorativeBackground from "@/components/ui/DecorativeBackground";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import WebGIS, { GISLayer, GISMarker, WebGISRef } from "@/components/WebGIS";
import { exportToGeoJSON } from '@/lib/gis-utils';
import { STATES, DEFAULT_STATE } from '@/lib/regions';
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import ThreeBackground from "@/components/ui/ThreeBackground";
import GlassCard from "@/components/ui/GlassCard";
import MagneticButton from "@/components/ui/MagneticButton";
import AnimatedCounter from "@/components/ui/AnimatedCounter";

// Client-only components to prevent hydration mismatches
const FloatingOrbs = dynamic(() => import('@/components/ui/FloatingOrbs'), { ssr: false });
const DecorativeElements = dynamic(() => import('@/components/ui/DecorativeElements'), { ssr: false });

interface FeatureData {
  area: number | undefined;
  type: "Feature";
  properties: {
    id?: string;
    claim_id?: string | number;
    type?: string;
    claimant?: string;
    status?: string;
    area?: number;
    land_area?: number;
    claim_type?: string;
    village?: string;
    state: string;
    district: string;
    osm_id?: number;
    tags?: any;
    application_date?: string;
    source?: string;
    resolution_status?: string;
    note?: string;
  };
  geometry: {
    type: string;
    coordinates: any[];
  };
  // Also allow plain object fields used by non-GeoJSON responses
  claim_id?: string | number;
  id?: string | number;
  lat?: number | string;
  lng?: number | string;
  land_area?: number;
  // Other plain object fields
  claimant?: string;
  status?: string;
  claim_type?: string;
  village?: string;
  state?: string;
  district?: string;
  osm_id?: number;
  tags?: any;
  application_date?: string;
  source?: string;
  resolution_status?: string;
  note?: string;
}

export default function FeaturePage({
  params,
}: {
  params: Promise<{ featureId: string }>;
}) {
  const [featureId, setFeatureId] = useState<string>("");
  const [feature, setFeature] = useState<FeatureData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState<string>("");
  const webgisRef = useRef<WebGISRef | null>(null);
  const [layers, setLayers] = useState<GISLayer[]>([]);
  const [markers, setMarkers] = useState<GISMarker[]>([]);
  const [mapCenter, setMapCenter] = useState<[number, number] | null>(null);
  const [mapZoom, setMapZoom] = useState<number>(12);
  const [isFetchingBoundaries, setIsFetchingBoundaries] = useState(false);
  const [toasts, setToasts] = useState<{ id: number; message: string; type?: 'info' | 'error' }[]>([]);

  const pushToast = (message: string, type: 'info' | 'error' = 'info') => {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
  };

  const fetchWithRetry = async (url: string, attempts = 3, backoff = 500) => {
    let lastErr: unknown = null;
    for (let i = 0; i < attempts; i++) {
      try {
        const r = await fetch(url, { headers: { Accept: 'application/json' } });
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return await r.json();
      } catch (err) {
        lastErr = err;
        await new Promise(res => setTimeout(res, backoff * Math.pow(2, i)));
      }
    }
    throw lastErr;
  };

  useEffect(() => {
    const loadParams = async () => {
      const { featureId: id } = await params;
      setFeatureId(decodeURIComponent(id));
    };
    loadParams();
  }, [params]);

  useEffect(() => {
    if (!featureId) return;

    const fetchClaim = async () => {
      setLoading(true);
      setError(null);
      try {
        // Try to fetch claim by id via claims API. Use a few fallback URL shapes
        // because environments may expose different proxy routes.
        const tryUrls = [
          `/api/claims?id=${encodeURIComponent(featureId)}`,
          `/api/claims?claim_id=${encodeURIComponent(featureId)}`,
          `/api/claims/${encodeURIComponent(featureId)}`,
          `/api/claims/village/${encodeURIComponent(featureId)}`,
          `https://vanmitra.onrender.com/claims?id=${encodeURIComponent(featureId)}`,
          `https://vanmitra.onrender.com/claims/${encodeURIComponent(featureId)}`,
          `https://vanmitra.onrender.com/claims?village=${encodeURIComponent(featureId)}`,
        ];

        let data: any = null;
        let lastErr: any = null;
        for (const u of tryUrls) {
          try {
            // Prefer using fetchWithRetry for noisy networks for the external host only
            if (u.startsWith('http')) {
              data = await fetchWithRetry(u, 3, 400);
            } else {
              const r = await fetch(u, { headers: { Accept: 'application/json' } });
              if (!r.ok) throw new Error(`HTTP ${r.status} for ${u}`);
              data = await r.json();
            }
            if (data) break;
          } catch (err) {
            lastErr = err;
            // try next
            console.warn('Claim fetch attempt failed for', u, err);
          }
        }

        if (!data) throw lastErr || new Error('No data returned from claim endpoints');

        // Data may be a GeoJSON FeatureCollection or an array/object
        let item: FeatureData | null = null;
        if (data && data.type === 'FeatureCollection' && Array.isArray(data.features)) {
          item = data.features.find((f: FeatureData) => String(f.properties?.claim_id ?? f.properties?.id) === String(featureId)) || (data.features[0] as FeatureData) || null;
          if (item) {
            // wrap into feature shape expected below
          }
        } else if (Array.isArray(data)) {
          item = (data.find((d: any) => String(d.claim_id ?? d.id) === String(featureId)) as FeatureData) || (data[0] as FeatureData) || null;
        } else if (data && (data.claim_id || data.id)) {
          item = data;
        }

        if (!item) {
          setError('Feature not found');
          setLoading(false);
          return;
        }

        // If item is a feature (GeoJSON) use it directly, else normalize
        let featureObj: FeatureData;
        if (item.type === 'Feature') {
          featureObj = {
            area: item.properties?.land_area ?? item.properties?.area,
            type: 'Feature',
            properties: {
              id: String(item.properties?.claim_id ?? item.properties?.id ?? ''),
              type: item.properties?.type,
              claimant: item.properties?.claimant,
              status: item.properties?.status,
              area: item.properties?.land_area ?? item.properties?.area,
              claim_type: item.properties?.claim_type,
              village: item.properties?.village,
              state: item.properties?.state ?? 'Madhya Pradesh',
              district: item.properties?.district ?? 'Bhopal',
              osm_id: item.properties?.osm_id,
              tags: item.properties?.tags,
              application_date: item.properties?.application_date,
              source: item.properties?.source,
              resolution_status: item.properties?.resolution_status,
              note: item.properties?.note,
            },
            geometry: item.geometry
          };
        } else {
          const geom = item.geometry ?? (item.lat && item.lng ? { type: 'Point', coordinates: [Number(item.lng), Number(item.lat)] } : null);
          featureObj = {
            area: item.land_area ?? item.area,
            type: 'Feature',
            properties: {
              id: String(item.claim_id ?? item.id ?? ''),
              type: item.type,
              claimant: item.claimant,
              status: item.status,
              area: item.land_area ?? item.area,
              claim_type: item.claim_type,
              village: item.village,
              state: item.state ?? 'Madhya Pradesh',
              district: item.district ?? 'Bhopal',
              osm_id: item.osm_id,
              tags: item.tags,
              application_date: item.application_date,
              source: item.source,
              resolution_status: item.resolution_status,
              note: item.note,
            },
            // fallback to the project's DEFAULT_STATE center if no geometry is available
            geometry: geom || { type: 'Point', coordinates: (STATES.find(s => s.name === (item.state || item.properties?.state || DEFAULT_STATE))?.center ?? STATES.find(s => s.name === DEFAULT_STATE)?.center ?? [78.9629, 22.9734]) }
          };
        }

        setFeature(featureObj);

        // Create a dedicated layer for this feature so polygons render with fill + outline
        const fc: GeoJSON.FeatureCollection = { type: 'FeatureCollection', features: [featureObj as unknown as GeoJSON.Feature] };
        const claimType = String(featureObj.properties?.claim_type ?? '').toUpperCase();
        const colorMap: Record<string, string> = { IFR: '#16a34a', CR: '#3b82f6', CFR: '#f59e0b' };
        const fillColor = colorMap[claimType] ?? '#60a5fa';

        setLayers(prev => [
          ...prev.filter(l => l.id !== 'claims-feature'),
          {
            id: 'claims-feature',
            name: 'Claim',
            type: 'geojson',
            visible: true,
            data: fc,
            url: '',
            style: { fillColor, strokeColor: fillColor, strokeWidth: 3, opacity: 0.6 }
          }
        ]);

        // For polygon, compute centroid for marker and center map
        try {
          if (featureObj.geometry?.type === 'Point') {
            const coords = featureObj.geometry.coordinates as [number, number];
            setMarkers([{ id: String(featureObj.properties.id ?? 'unknown'), lng: coords[0], lat: coords[1], label: '1', color: '#ef4444' }]);
            setMapCenter([coords[0], coords[1]]);
            setMapZoom(14);
          } else if (featureObj.geometry && (featureObj.geometry.type === 'Polygon' || featureObj.geometry.type === 'MultiPolygon')) {
            const centroid = turf.centroid(featureObj as unknown as GeoJSON.Feature);
            if (centroid && centroid.geometry && centroid.geometry.coordinates) {
              const [lng, lat] = centroid.geometry.coordinates as [number, number];
              setMarkers([{ id: String(featureObj.properties.id ?? 'unknown'), lng, lat, label: '1', color: '#ef4444' }]);
              setMapCenter([lng, lat]);
              setMapZoom(12);
            }
          }
        } catch (e) {
          // fallback: do nothing
        }
      } catch (err) {
        console.error('Failed to fetch claim', err);
        setError('Failed to load feature');
      } finally {
        setLoading(false);
      }
    };

    fetchClaim();
  }, [featureId]);

  const derivedState = feature?.properties?.state || DEFAULT_STATE;
  const derivedDistrict = feature?.properties?.district || "Bhopal";
  const derivedCenter = STATES.find(s => s.name === derivedState)?.center ?? STATES.find(s => s.name === DEFAULT_STATE)?.center ?? [78.9629, 22.9734];

  // Example state for layers
  const [mapLayers, setMapLayers] = useState([
    { id: "roads", name: "Roads", visible: true },
    { id: "buildings", name: "Buildings", visible: false },
    { id: "satellite", name: "Satellite Imagery", visible: true },
  ]);

  const toggleLayer = (id: string) => {
    setMapLayers((prev) =>
      prev.map((layer) =>
        layer.id === id ? { ...layer, visible: !layer.visible } : layer
      )
    );

    // Hook into your GIS ref if needed:
    // webgisRef.current?.setLayerVisibility(id, newVisibility)
  };


  useEffect(() => {
    setLayers([
      {
        id: "boundaries",
        name: "State / District Boundaries",
        type: "geojson",
        url: "/api/atlas/boundaries",
        visible: false,
        style: {
          fillColor: "#ffffff",
          strokeColor: "#0b815a",
          strokeWidth: 2,
          opacity: 0.6,
        },
      },
      {
        id: "assets",
        name: "Assets",
        type: "geojson",
        url: "/api/atlas/assets",
        visible: true,
        style: {
          fillColor: "#0ea5e9",
          strokeColor: "#0369a1",
          strokeWidth: 1,
          opacity: 0.9,
        },
      },
    ]);
  }, []);

  const handleLayerToggle = (layerId: string) => {
    const toggled = layers.find((l) => l.id === layerId);
    if (toggled?.id === "boundaries") {
      const willBeVisible = !toggled.visible;
      if (willBeVisible) {
        (async () => {
          setIsFetchingBoundaries(true);
          try {
            const districtQuery = encodeURIComponent(
              `${derivedDistrict}, ${derivedState}, India`
            );
            const nomUrl = `https://nominatim.openstreetmap.org/search.php?q=${districtQuery}&polygon_geojson=1&format=jsonv2`;
            let res: any[] | null = null;
            try {
              res = await fetchWithRetry(nomUrl, 3, 400);
            } catch (err) {
              console.warn('District lookup failed, will try state fallback', err);
            }

            const cand = res && res.length > 0 ? res[0] : null;
            if (cand && cand.geojson) {
              setLayers((prev) =>
                prev.map((l) =>
                  l.id === "boundaries"
                    ? { ...l, data: cand.geojson, visible: true }
                    : l
                )
              );
              pushToast('Boundaries loaded', 'info');
              return;
            }

            // fallback: state boundaries
            const stateQuery = encodeURIComponent(`${derivedState}, India`);
            const nomUrl2 = `https://nominatim.openstreetmap.org/search.php?q=${stateQuery}&polygon_geojson=1&format=jsonv2`;
            let res2: any[] | null = null;
            try {
              res2 = await fetchWithRetry(nomUrl2, 3, 400);
            } catch (err) {
              console.warn('State lookup failed', err);
            }

            const cand2 = res2 && res2.length > 0 ? res2[0] : null;
            if (cand2 && cand2.geojson) {
              setLayers((prev) =>
                prev.map((l) =>
                  l.id === "boundaries"
                    ? { ...l, data: cand2.geojson, visible: true }
                    : l
                )
              );
              pushToast('State boundaries loaded', 'info');
              return;
            }

            pushToast('Boundaries not found for this area', 'error');
          } catch (err) {
            console.error("Boundaries fetch failed", err);
            pushToast('Failed to fetch boundaries', 'error');
          } finally {
            setIsFetchingBoundaries(false);
          }
        })();
      } else {
        setLayers((prev) =>
          prev.map((l) =>
            l.id === "boundaries" ? { ...l, visible: false } : l
          )
        );
      }
    } else {
      setLayers((prev) =>
        prev.map((l) =>
          l.id === layerId ? { ...l, visible: !l.visible } : l
        )
      );
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-emerald-900/95 p-8 text-white">
          <div className="max-w-3xl mx-auto bg-emerald-800/30 border border-emerald-700/50 p-8 rounded-3xl shadow-2xl backdrop-blur-sm">
            <div className="flex items-center justify-center">
              <div className="w-6 h-6 bg-emerald-400 rounded-full animate-pulse mr-3"></div>
              <span className="text-emerald-100">Loading...</span>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error || !feature) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-emerald-900/95 p-8 text-white">
          <div className="max-w-3xl mx-auto bg-emerald-800/30 border border-emerald-700/50 p-8 rounded-3xl shadow-2xl backdrop-blur-sm">
            <h2 className="text-red-400 text-xl font-semibold mb-4">{error || "Feature not found"}</h2>
            <div className="mt-6">
              <Link href="/atlas" className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl transition-colors duration-200 shadow-lg hover:shadow-xl">
                <ArrowLeft size={16} />
                Back to Atlas
              </Link>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  const props = feature.properties;


  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-green-900 to-emerald-900 text-white relative overflow-hidden">
        <ThreeBackground />
        <DecorativeElements />
        <FloatingOrbs />

        {/* Mesh Gradient Overlay */}
        <div className="fixed inset-0 bg-gradient-to-br from-green-900/20 via-transparent to-emerald-900/20 pointer-events-none z-1" />

        {/* Animated Grid */}
        <div className="fixed inset-0 opacity-10 pointer-events-none z-1">
          <div className="absolute inset-0" style={{
            backgroundImage: `
            linear-gradient(rgba(34, 197, 94, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(34, 197, 94, 0.1) 1px, transparent 1px)
          `,
            backgroundSize: '50px 50px'
          }} />
        </div>

        <Navbar />

        <main className="relative z-10 max-w-7xl mx-auto px-6 py-10">
          <motion.div initial={{ y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }}>
            <div className="mb-8">
              <div className="flex items-center gap-4 mb-6">
                <Link href="/atlas" className="inline-flex items-center justify-center h-12 w-12 rounded-2xl bg-emerald-800/30 border border-emerald-600/50 text-emerald-100 shadow-lg hover:bg-emerald-700/40 transition-colors duration-200" aria-label="Back to Atlas">
                  <ArrowLeft size={20} />
                </Link>
                <div>
                  <h1 className="text-4xl font-bold text-white mb-2">Claim {props.id}</h1>
                  <p className="text-xl text-emerald-200/80">{props.village ?? ''}, {props.district ?? ''}</p>
                </div>
              </div>

              {/* Feature Header */}
              <GlassCard className="p-8 mb-8">
                {/* Top Row: Status + Type */}
                <div className="flex items-start gap-6 mb-8">
                  <div className="flex flex-wrap gap-3">
                    <div
                      className={`px-4 py-1.5 rounded-full text-sm font-semibold border shadow-sm backdrop-blur-sm ${String(props.status).toLowerCase() === 'approved'
                        ? 'bg-emerald-600/30 text-emerald-100 border-emerald-400/40 shadow-emerald-800/20'
                        : 'bg-amber-600/30 text-amber-100 border-amber-400/40 shadow-amber-800/20'
                        }`}
                    >
                      {String(props.status ?? '').toUpperCase()}
                    </div>
                    <div className="px-4 py-1.5 rounded-full text-sm font-semibold bg-slate-700/40 text-slate-200 border border-slate-600/40 shadow-inner">
                      {String(props.claim_type ?? '').toUpperCase()}
                    </div>
                  </div>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-sm">
                  {/* ID */}
                  <div className="group relative bg-emerald-900/20 rounded-2xl p-6 border border-emerald-700/40 hover:border-emerald-500/50 transition-colors shadow-lg shadow-emerald-900/10">
                    <span className="font-semibold text-emerald-300/70 text-xs uppercase tracking-wide flex items-center gap-2">
                      <svg className="w-4 h-4 text-emerald-400/80" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path d="M9 12h6m2 0a2 2 0 100-4h-1V7a2 2 0 10-4 0v1H9a2 2 0 100 4h1v1a2 2 0 104 0v-1h1z" />
                      </svg>
                      ID
                    </span>
                    <p className="text-2xl font-bold text-white mt-2 truncate">{props.id}</p>
                  </div>

                  {/* Area */}
                  <div className="group relative bg-emerald-900/20 rounded-2xl p-6 border border-emerald-700/40 hover:border-emerald-500/50 transition-colors shadow-lg shadow-emerald-900/10">
                    <span className="font-semibold text-emerald-300/70 text-xs uppercase tracking-wide flex items-center gap-2">
                      <svg className="w-4 h-4 text-emerald-400/80" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path d="M4 4h16v16H4z" />
                      </svg>
                      Area
                    </span>
                    <span className="text-2xl font-bold text-white mt-2">
                      <AnimatedCounter value={props.area || 0} /> <span className="text-base text-emerald-300/70">ha</span>
                    </span>
                  </div>

                  {/* State */}
                  <div className="group relative bg-emerald-900/20 rounded-2xl p-6 border border-emerald-700/40 hover:border-emerald-500/50 transition-colors shadow-lg shadow-emerald-900/10">
                    <span className="font-semibold text-emerald-300/70 text-xs uppercase tracking-wide flex items-center gap-2">
                      <svg className="w-4 h-4 text-emerald-400/80" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path d="M12 2l9 4.5v11L12 22l-9-4.5v-11L12 2z" />
                      </svg>
                      State
                    </span>
                    <p className="text-2xl font-bold text-white mt-2">{props.state ?? '—'}</p>
                  </div>

                  {/* Village */}
                  <div className="group relative bg-emerald-900/20 rounded-2xl p-6 border border-emerald-700/40 hover:border-emerald-500/50 transition-colors shadow-lg shadow-emerald-900/10">
                    <span className="font-semibold text-emerald-300/70 text-xs uppercase tracking-wide flex items-center gap-2">
                      <svg className="w-4 h-4 text-emerald-400/80" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path d="M12 22s8-4 8-10a8 8 0 10-16 0c0 6 8 10 8 10z" />
                      </svg>
                      Village
                    </span>
                    <p className="text-2xl font-bold text-white mt-2">{props.village ?? '—'}</p>
                  </div>
                </div>
              </GlassCard>


              {/* Main Content Area */}
              <div className="flex flex-col gap-8">
                {/* Full-width Map */}
                <GlassCard className="p-0 overflow-hidden h-[calc(100vh-120px)]">
                  <div className="w-full h-full relative rounded-2xl">
                    {/* Subtle dark overlay */}
                    <div className="absolute inset-0 bg-green-900/10 rounded-2xl pointer-events-none" />
                    <div className="relative z-10 h-full">
                      <WebGIS
                        ref={webgisRef}
                        className="w-full h-full"
                        center={
                          (mapCenter ??
                            (feature.geometry.type === "Point"
                              ? (feature.geometry.coordinates as [number, number])
                              : derivedCenter)) as [number, number]
                        }
                        zoom={mapZoom}
                        layers={layers}
                        markers={markers}
                        state={derivedState}
                        district={derivedDistrict}
                        showControls={true}
                        showExportControls={true}
                        onLayerToggle={handleLayerToggle}
                      />
                    </div>
                  </div>
                </GlassCard>

                {/* Tools + Panels Below Map */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* LEFT SIDE */}
                  <div className="flex flex-col gap-6 lg:col-span-1">
                    {/* Measurement Tools */}
                    <GlassCard className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <Ruler size={20} className="text-emerald-400" />
                        <h4 className="font-semibold text-white text-lg">Measurement Tools</h4>
                      </div>
                      <div className="space-y-3">
                        <button
                          onClick={() => webgisRef.current?.startMeasurement?.()}
                          className="w-full bg-blue-600 text-white px-4 py-3 rounded-xl hover:bg-blue-500 transition duration-200 shadow-md hover:shadow-lg font-medium"
                        >
                          Start Measurement
                        </button>
                        <button
                          onClick={() => webgisRef.current?.clearMeasurement?.()}
                          className="w-full border border-emerald-600/50 bg-emerald-800/30 hover:bg-emerald-700/40 text-emerald-100 px-4 py-3 rounded-xl font-medium transition duration-200"
                        >
                          Clear Measurement
                        </button>
                      </div>
                    </GlassCard>

                    {/* Export Tools */}
                    <GlassCard className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <Download size={20} className="text-emerald-400" />
                        <h4 className="font-semibold text-white text-lg">Export Tools</h4>
                      </div>
                      <div className="space-y-3">
                        <button
                          onClick={() => {
                            if (!feature) {
                              pushToast("No feature to export", "info");
                              return;
                            }
                            const fc = {
                              type: "FeatureCollection" as const,
                              features: [feature as any],
                            };
                            const ts = new Date().toISOString().replace(/[:.]/g, "-");
                            const filename = `vanmitra-feature-${feature.properties.id ?? "unknown"
                              }-${ts}.geojson`;
                            try {
                              exportToGeoJSON(fc as any, filename);
                              pushToast("Export started", "info");
                            } catch (e) {
                              console.error("Export failed", e);
                              pushToast("Export failed", "error");
                            }
                          }}
                          className="w-full bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-3 rounded-xl font-medium transition duration-200 shadow-md hover:shadow-lg"
                        >
                          Export GeoJSON
                        </button>
                        <button
                          onClick={() => webgisRef.current?.exportMap?.()}
                          className="w-full border border-emerald-600/50 bg-emerald-800/30 hover:bg-emerald-700/40 text-emerald-100 px-4 py-3 rounded-xl font-medium transition duration-200"
                        >
                          Export Map Image
                        </button>
                      </div>
                    </GlassCard>
                  </div>

                  {/* RIGHT SIDE */}
                  <div className="lg:col-span-2 flex flex-col gap-6">
                    {/* Properties Panel */}
                    <GlassCard className="p-6 flex flex-col h-[433px]">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-semibold text-white">Properties</h4>
                        <input
                          type="text"
                          placeholder="Search properties..."
                          className="bg-emerald-900/30 border border-emerald-700/40 text-white text-sm rounded-lg px-3 py-2 w-56 focus:outline-none focus:ring-2 focus:ring-emerald-400/40"
                          onChange={(e) => setSearch(e.target.value)}
                        />
                      </div>

                      {/* Advanced property list */}
                      <div className="flex-1 overflow-y-auto custom-scroll pr-1">
                        <div className="divide-y divide-emerald-700/20 space-y-2">
                          {Object.entries(props)
                            .filter(
                              ([key, value]) =>
                                key.toLowerCase().includes(search.toLowerCase()) ||
                                String(value).toLowerCase().includes(search.toLowerCase())
                            )
                            .map(([key, value]) => (
                              <details
                                key={key}
                                className="group bg-emerald-800/20 rounded-lg px-3 py-2 hover:bg-emerald-700/30 transition"
                              >
                                <summary className="flex justify-between items-center cursor-pointer">
                                  <span className="text-emerald-300/80 text-xs uppercase tracking-wide">
                                    {key.replace(/_/g, " ")}
                                  </span>
                                  <ChevronDown
                                    size={16}
                                    className="text-emerald-400 group-open:rotate-180 transition-transform"
                                  />
                                </summary>
                                <p className="text-white font-medium text-sm mt-2 break-all">
                                  {String(value || "—")}
                                </p>
                              </details>
                            ))}
                        </div>
                      </div>
                    </GlassCard>


                  </div>

                </div>

                {/* Layer Control */}
                <GlassCard className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Layers size={20} className="text-emerald-400" />
                    <h4 className="font-semibold text-white text-lg">Layer Control</h4>
                  </div>
                  <div className="space-y-3">
                    {/* Example toggle */}
                    {layers.map((layer) => (
                      <div key={layer.id} className="flex items-center justify-between">
                        <span className="text-sm text-white">{layer.name}</span>
                        <input
                          type="checkbox"
                          checked={layer.visible}
                          onChange={() => toggleLayer(layer.id)}
                          className="w-4 h-4 accent-emerald-500"
                        />
                      </div>
                    ))}
                  </div>
                </GlassCard>
              </div>

            </div>
          </motion.div>
        </main>

        <Footer />

        {/* Toasts container */}
        <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
          <AnimatePresence>
            {toasts.map((t) => (
              <motion.div
                key={t.id}
                initial={{ x: 300, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 300, opacity: 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                className={`px-6 py-4 rounded-2xl shadow-2xl text-white text-sm flex items-center backdrop-blur-sm border ${t.type === 'error'
                  ? 'bg-red-600/90 border-red-500/50'
                  : 'bg-emerald-600/90 border-emerald-500/50'
                  }`}
              >
                {t.type === 'error' ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                )}
                {t.message}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </ProtectedRoute>
  );
}