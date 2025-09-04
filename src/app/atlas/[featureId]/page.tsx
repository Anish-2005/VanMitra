"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import DecorativeBackground from "@/components/DecorativeBackground";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import WebGIS, { GISLayer, GISMarker } from "@/components/WebGIS";
// LayerManager removed - use map's built-in controls instead

interface FeatureData {
  type: "Feature";
  properties: {
    id: string;
    type?: string;
    claimant?: string;
    status?: string;
    area?: number;
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
    coordinates: any;
  };
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

  const webgisRef = useRef<any>(null);
  const [layers, setLayers] = useState<GISLayer[]>([]);
  const [markers, setMarkers] = useState<GISMarker[]>([]);
  const [isFetchingBoundaries, setIsFetchingBoundaries] = useState(false);
  const [toasts, setToasts] = useState<{ id: number; message: string; type?: 'info'|'error' }[]>([]);

  const pushToast = (message: string, type: 'info'|'error' = 'info') => {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
  };

  const fetchWithRetry = async (url: string, attempts = 3, backoff = 500) => {
    let lastErr: any = null;
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

    const fetchFeature = async () => {
      setLoading(true);
      setError(null);
      try {
        // Try assets API first
        const resp = await fetch(
          `/api/atlas/assets?featureId=${encodeURIComponent(featureId)}`
        );
        if (resp.ok) {
          const data = await resp.json();
          const found = data.features?.find(
            (f: FeatureData) => f.properties.id === featureId
          );
          if (found) {
            setFeature(found);
            if (found.geometry?.type === "Point") {
              const coords = found.geometry.coordinates as [number, number];
              setMarkers([
                {
                  id: found.properties.id,
                  lng: coords[0],
                  lat: coords[1],
                  label: "Feature",
                  color: "#ef4444",
                },
              ]);
            }
            setLoading(false);
            return;
          }
        }

        // Fallback to FRA
        const resp2 = await fetch(
          `/api/atlas/fra?featureId=${encodeURIComponent(featureId)}`
        );
        if (resp2.ok) {
          const data2 = await resp2.json();
          const found2 = data2.features?.find(
            (f: FeatureData) => f.properties.id === featureId
          );
          if (found2) {
            setFeature(found2);
            if (found2.geometry?.type === "Point") {
              const coords = found2.geometry.coordinates as [number, number];
              setMarkers([
                {
                  id: found2.properties.id,
                  lng: coords[0],
                  lat: coords[1],
                  label: "Feature",
                  color: "#ef4444",
                },
              ]);
            }
            setLoading(false);
            return;
          }
        }

        setError("Feature not found");
      } catch (err) {
        console.error(err);
        setError("Failed to load feature");
      } finally {
        setLoading(false);
      }
    };

    fetchFeature();
  }, [featureId]);

  const derivedState = feature?.properties?.state || "Madhya Pradesh";
  const derivedDistrict = feature?.properties?.district || "Bhopal";

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
            <Link href="/atlas" className="text-blue-600">Back to Atlas</Link>
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
            <div className="h-9 w-9 rounded-md bg-green-600 flex items-center justify-center border border-green-700 shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M3 6h18M3 12h18M3 18h18" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
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
          {/* Breadcrumb Navigation */}
          <nav className="mb-4">
            <Link href="/atlas" className="text-emerald-700 hover:text-emerald-900 font-medium">
              &larr; Back to Atlas
            </Link>
          </nav>
          
          {/* Feature Header */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Feature Details</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="font-semibold text-gray-600">ID:</span>
                <p className="truncate">{props.id}</p>
              </div>
              <div>
                <span className="font-semibold text-gray-600">Type:</span>
                <p>{props.type || "N/A"}</p>
              </div>
              <div>
                <span className="font-semibold text-gray-600">Status:</span>
                <p>{props.status || "N/A"}</p>
              </div>
              <div>
                <span className="font-semibold text-gray-600">Area:</span>
                <p>{props.area ? `${props.area} ha` : "N/A"}</p>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Left panel removed - map controls will handle layer toggles */}

            {/* Map Container */}
            <div className="flex-1 bg-white rounded-xl shadow-md overflow-hidden" style={{ height: '90vh' }}>
              <WebGIS
                ref={webgisRef}
                className="w-full h-full"
                center={
                  feature.geometry.type === "Point"
                    ? (feature.geometry.coordinates as [number, number])
                    : [88.8, 21.9]
                }
                zoom={12}
                layers={layers}
                markers={markers}
                state={derivedState}
                district={derivedDistrict}
                baseRasterTiles={
                  process.env.NEXT_PUBLIC_OPENWEATHER_KEY
                    ? [
                        `https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=${process.env.NEXT_PUBLIC_OPENWEATHER_KEY}`,
                      ]
                    : undefined
                }
                baseRasterAttribution={"Map data © OpenWeatherMap"}
                showControls={true}
                showExportControls={true}
                onLayerToggle={handleLayerToggle}
              />
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