"use client";

import React, { useState, useEffect, useRef } from "react";
import * as turf from '@turf/turf';
import { Ruler, Download, Layers, ArrowLeft } from 'lucide-react';
import Link from "next/link";
import DecorativeBackground from "@/components/DecorativeBackground";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import WebGIS, { GISLayer, GISMarker, WebGISRef } from "@/components/WebGIS";
import { exportToGeoJSON } from '@/lib/gis-utils';
import { STATES, DEFAULT_STATE } from '@/lib/regions';
// LayerManager removed - use map's built-in controls instead

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
        // Try to fetch claim by id via claims API
        const params = new URLSearchParams();
        params.set('id', featureId);
        const url = `/api/claims?${params.toString()}`;
        const resp = await fetch(url, { headers: { Accept: 'application/json' } });
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const data = await resp.json();

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
            let res = null;
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
            let res2 = null;
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
        <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-green-100 p-8 text-gray-900">
          <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow text-gray-900">
            Loading...
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error || !feature) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-green-100 p-8 text-gray-900">
          <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow text-gray-900">
            <h2 className="text-red-600">{error || "Feature not found"}</h2>
            <div className="mt-4">
              <Link href="/atlas" className="inline-flex items-center gap-2 bg-white border border-gray-200 px-3 py-2 rounded text-emerald-800 hover:bg-emerald-50">
                <ArrowLeft size={14} />
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
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-green-100 p-4 text-gray-900 relative overflow-hidden">
        <DecorativeBackground count={4} />

        <header className="relative z-10 max-w-7xl mx-auto px-6 pt-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/atlas" className="inline-flex items-center justify-center h-9 w-9 rounded-md bg-white border border-gray-200 text-emerald-800 shadow-sm hover:bg-emerald-50" aria-label="Back to Atlas">
              <ArrowLeft size={18} />
            </Link>
            <div className="h-9 w-9 rounded-md bg-green-600 flex items-center justify-center border border-green-700 shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M3 6h18M3 12h18M3 18h18" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </div>
            <div>
              <h2 className="text-base font-semibold text-green-900">VanMitra</h2>
              <p className="text-xs text-green-700">Map — Feature</p>
            </div>
          </div>

          <nav className="flex items-center gap-3 text-sm">
            <Link href="/atlas" className="text-green-800 hover:text-green-600">Atlas</Link>
            <Link href="/" className="text-green-800 hover:text-green-600">Home</Link>
          </nav>
        </header>
  <div className="max-w-7xl mx-auto mt-4 mb-6">

          {/* Feature Header */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <div className="flex items-start gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Claim {props.id}</h1>
                <div className="text-sm text-gray-600">{props.village ?? ''}, {props.district ?? ''}</div>
              </div>
              <div className="ml-auto flex items-center gap-2">
                <div className={`px-2 py-1 rounded text-xs font-medium ${String(props.status).toLowerCase() === 'approved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                  {String(props.status ?? '').toUpperCase()}
                </div>
                <div className="px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700">{String(props.claim_type ?? '').toUpperCase()}</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm mt-4">
              <div>
                <span className="font-semibold text-gray-600">ID</span>
                <p className="truncate">{props.id}</p>
              </div>
              <div>
                <span className="font-semibold text-gray-600">Area</span>
                <p>{props.area ? `${props.area} ha` : 'N/A'}</p>
              </div>
              <div>
                <span className="font-semibold text-gray-600">State</span>
                <p>{props.state ?? '—'}</p>
              </div>
              <div>
                <span className="font-semibold text-gray-600">Village</span>
                <p>{props.village ?? '—'}</p>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2">
              <button onClick={() => { }} className="px-3 py-1 bg-green-700 text-white rounded-md text-sm">Open detail</button>
              <button onClick={() => { }} className="px-3 py-1 border rounded-md text-sm">Edit</button>
              <button onClick={() => { }} className="px-3 py-1 border rounded-md text-sm">Report</button>
              <button onClick={() => { }} className="px-3 py-1 border rounded-md text-sm">Verify</button>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Left panel removed - map controls will handle layer toggles */}

            {/* Map Container */}
            <div className="flex-1 bg-white rounded-xl shadow-md overflow-hidden">
              <div style={{ height: '70vh' }}>
                <WebGIS
                  ref={webgisRef}
                  className="w-full h-full"
                  center={(mapCenter ?? (feature.geometry.type === 'Point' ? (feature.geometry.coordinates as [number, number]) : derivedCenter)) as [number, number]}
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

              <div className="p-4 flex justify-center">
                <div className="max-w-sm w-full">
                  <div className="p-3 bg-white rounded shadow-sm border">
                    <div className="flex items-center gap-2 mb-2">
                      <Download size={16} />
                      <h4 className="font-medium">Export</h4>
                    </div>
                    <div className="space-y-2">
                      <button onClick={() => {
                        if (!feature) { pushToast('No feature to export', 'info'); return; }
                        const fc = { type: 'FeatureCollection' as const, features: [feature as any] };
                        const ts = new Date().toISOString().replace(/[:.]/g, '-');
                        const filename = `vanmitra-feature-${feature.properties.id ?? 'unknown'}-${ts}.geojson`;
                        try {
                          exportToGeoJSON(fc as any, filename);
                          pushToast('Export started', 'info');
                        } catch (e) {
                          console.error('Export failed', e);
                          pushToast('Export failed', 'error');
                        }
                      }} className="w-full bg-green-500 text-white px-3 py-2 rounded">Export GeoJSON</button>
                      <button onClick={() => webgisRef.current?.exportMap?.()} className="w-full border border-gray-200 text-gray-800 px-3 py-2 rounded">Export Map Image</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Toasts container */}
        <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
          {toasts.map((t) => (
            <div key={t.id} className={`px-4 py-3 rounded-lg shadow-lg text-white text-sm flex items-center ${t.type === 'error' ? 'bg-red-600' : 'bg-emerald-600'}`}>
              {t.type === 'error' ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              )}
              {t.message}
            </div>
          ))}
        </div>
      </div>
    </ProtectedRoute>
  );
}