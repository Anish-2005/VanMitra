"use client";

import React, { useState, useRef, useEffect } from "react";
import { STATES, DEFAULT_STATE, DEFAULT_DISTRICT } from '../../lib/regions';
import { motion } from "framer-motion";
import { Layers, ArrowRight, Ruler, Download } from "lucide-react";
import DecorativeBackground from "@/components/DecorativeBackground";
import Link from "next/link";
import WebGIS, { WebGISRef } from "../../components/WebGIS";
import LayerManager from "../../components/LayerManager";
import Modal from "../../components/Modal";
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { GISLayer, GISMarker } from "../../components/WebGIS";
import { createGeoJSONPoint, exportToGeoJSON } from "../../lib/gis-utils";

export default function AtlasPage() {
  const [layers, setLayers] = useState<GISLayer[]>([
    {
      id: 'fra-claims',
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
      id: 'village-boundaries',
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
      id: 'assets',
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

  const [markers, setMarkers] = useState<GISMarker[]>([
    { id: 'marker-mp', lng: 78.4, lat: 23.2, label: 'MP', color: '#16a34a', popup: '<b>Madhya Pradesh</b><br>FRA Claim IFR-001<br>Area: 15.5 ha' },
    { id: 'marker-tr', lng: 91.2, lat: 23.8, label: 'TR', color: '#dc2626', popup: '<b>Tripura</b><br>FRA Claim CR-001<br>Area: 8.7 ha' },
    { id: 'marker-od', lng: 85.8, lat: 19.8, label: 'OD', color: '#ea580c', popup: '<b>Odisha</b><br>FRA Claim IFR-001<br>Area: 18.9 ha' },
    { id: 'marker-ts', lng: 78.4, lat: 17.3, label: 'TS', color: '#7c3aed', popup: '<b>Telangana</b><br>FRA Claim CR-001<br>Area: 14.2 ha' },
    { id: 'marker-wb', lng: 88.8, lat: 21.9, label: 'WB', color: '#0891b2', popup: '<b>West Bengal</b><br>FRA Claim IFR-001<br>Area: 16.5 ha' }
  ]);

  const [stateFilter, setStateFilter] = useState(DEFAULT_STATE);
  const [districtFilter, setDistrictFilter] = useState(DEFAULT_DISTRICT);
  const [mapKey, setMapKey] = useState(0); // Key to force WebGIS re-render

  // Temporary state for pending filter changes
  const [pendingStateFilter, setPendingStateFilter] = useState(DEFAULT_STATE);
  const [pendingDistrictFilter, setPendingDistrictFilter] = useState(DEFAULT_DISTRICT);
  const [isApplyingFilters, setIsApplyingFilters] = useState(false);

  const stateCenter = STATES.find(s => s.name === stateFilter)?.center ?? [88.8, 21.9];

  // Update layer URLs when state/district changes
  useEffect(() => {
    setLayers(prevLayers => prevLayers.map(layer => ({
      ...layer,
      url: layer.id === 'fra-claims'
        ? `/api/atlas/fra?state=${encodeURIComponent(stateFilter)}&district=${encodeURIComponent(districtFilter)}`
        : layer.id === 'village-boundaries'
        ? `/api/atlas/boundaries?state=${encodeURIComponent(stateFilter)}&district=${encodeURIComponent(districtFilter)}`
        : layer.id === 'assets'
        ? `/api/atlas/assets?state=${encodeURIComponent(stateFilter)}&district=${encodeURIComponent(districtFilter)}`
        : layer.url
    })));
    // Force WebGIS re-render by changing key
    setMapKey(prev => prev + 1);
  }, [stateFilter, districtFilter]);

  // Update pending filters when selects change
  useEffect(() => {
    setPendingStateFilter(stateFilter);
    setPendingDistrictFilter(districtFilter);
  }, []);

  const handleStateChange = (newState: string) => {
    setPendingStateFilter(newState);
    // Reset district if state changes
    const stateData = STATES.find(s => s.name === newState);
    if (stateData && stateData.districts.length > 0) {
      setPendingDistrictFilter(stateData.districts[0]);
    }
  };

  const handleDistrictChange = (newDistrict: string) => {
    setPendingDistrictFilter(newDistrict);
  };

  const handleApplyFilters = () => {
    setIsApplyingFilters(true);
    setStateFilter(pendingStateFilter);
    setDistrictFilter(pendingDistrictFilter);
    
    // Reset loading state after a short delay
    setTimeout(() => setIsApplyingFilters(false), 1000);
  };

  const [selectedFeature, setSelectedFeature] = useState<{ layer: string; feature: any; lngLat: any; properties?: any } | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const router = useRouter();

  // Measurement state
  const [isMeasuring, setIsMeasuring] = useState(false);
  const [measurementDistance, setMeasurementDistance] = useState<number | null>(null);

  const webGISRef = useRef<WebGISRef>(null);

  const handleLayerToggle = (layerId: string) => {
    setLayers(prev => prev.map(layer =>
      layer.id === layerId ? { ...layer, visible: !layer.visible } : layer
    ));
  };

  const handleLayerRemove = (layerId: string) => {
    setLayers(prev => prev.filter(layer => layer.id !== layerId));
  };

  const handleLayerUpdate = (layerId: string, updates: Partial<GISLayer>) => {
    setLayers(prev => prev.map(layer =>
      layer.id === layerId ? { ...layer, ...updates } : layer
    ));
  };

  const handleMarkerUpdate = (markerId: string, updates: Partial<GISMarker>) => {
    setMarkers(prev => prev.map(marker =>
      marker.id === markerId ? { ...marker, ...updates } : marker
    ));
  };

  const handleFeatureClick = (featureInfo: { layer: string; feature: any; lngLat: any }) => {
    setSelectedFeature({ ...featureInfo, properties: featureInfo.feature?.properties });
    setModalOpen(true);
  };

  const handleMapClick = (lngLat: { lng: number; lat: number }) => {
    console.log('Map clicked at:', lngLat);
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

  const handleStartMeasurement = () => {
    setIsMeasuring(true);
    setMeasurementDistance(null);
  };

  const handleClearMeasurement = () => {
    setIsMeasuring(false);
    setMeasurementDistance(null);
  };

  const handleExportGeoJSON = () => {
    const allFeatures: Array<{ type: 'Feature'; properties: any; geometry: any }> = [];
    layers.forEach(layer => {
      if (layer.data?.features) {
        allFeatures.push(...layer.data.features);
      }
    });
    exportToGeoJSON(allFeatures, 'atlas-export.geojson');
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-green-100 text-green-900 relative overflow-hidden">
        <DecorativeBackground count={6} />

        <header className="relative z-10 max-w-7xl mx-auto px-6 pt-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-green-600 flex items-center justify-center border border-green-700 shadow-md">
              <Layers className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-green-900">VanMitra</h1>
              <p className="text-xs text-green-700">Interactive Map & Layers</p>
            </div>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/" className="text-sm text-green-800 font-medium hover:text-green-600 transition-colors">Home</Link>
            <Link href="/dashboard" className="text-sm text-green-800 font-medium hover:text-green-600 transition-colors">Dashboard</Link>
          </nav>
        </header>

        <main className="relative z-10 max-w-7xl mx-auto px-6 py-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <section className="lg:col-span-8">
              <motion.div initial={{ y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }}>
                <div className="rounded-2xl overflow-hidden shadow-2xl border border-green-300 bg-white">
                  <div className="w-full h-[560px] p-6 relative">
                    <div className="absolute inset-0 bg-green-800/6 pointer-events-none"></div>
                    <div className="relative z-10 h-full">
                      <WebGIS
                        key={mapKey}
                        ref={webGISRef}
                        center={stateCenter as [number, number]}
                        zoom={7.5}
                        layers={layers}
                        markers={markers}
                        onFeatureClick={handleFeatureClick}
                        onMapClick={handleMapClick}
                        enableGeocoder={true}
                        enableMeasurement={true}
                        className="w-full h-full"
                        showControls={false}
                        state={stateFilter}
                        district={districtFilter}
                        onLayerToggle={handleLayerToggle}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            </section>

            <aside className="lg:col-span-4">
              <div className="mb-6">
                <LayerManager
                  layers={layers}
                  markers={markers}
                  onLayerToggle={handleLayerToggle}
                  onLayerRemove={handleLayerRemove}
                  onLayerUpdate={handleLayerUpdate}
                  onMarkerUpdate={handleMarkerUpdate}
                />
              </div>

              <div className="mb-6 p-6 bg-white rounded-xl shadow-md border border-green-100">
                <div className="flex items-center gap-2 mb-3">
                  <Ruler size={16} />
                  <h4 className="font-semibold text-green-900">Measurement Tools</h4>
                </div>
                <div className="space-y-3">
                  {!isMeasuring ? (
                    <button
                      onClick={() => webGISRef.current?.startMeasurement?.()}
                      className="w-full bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
                    >
                      Start Measurement
                    </button>
                  ) : (
                    <div className="text-sm text-gray-600 bg-yellow-50 p-3 rounded-md">
                      Click two points on the map to measure distance
                    </div>
                  )}
                  {measurementDistance && (
                    <div className="text-sm bg-green-50 p-3 rounded-md">
                      <strong>Distance:</strong> {measurementDistance.toFixed(2)} km
                    </div>
                  )}
                  <button
                    onClick={() => webGISRef.current?.clearMeasurement?.()}
                    className="w-full bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors"
                  >
                    Clear Measurement
                  </button>
                </div>
              </div>

              <div className="p-6 bg-white rounded-xl shadow-md border border-green-100">
                <h4 className="font-semibold text-green-900">Filters</h4>
                <div className="mt-3">
                  <label className="block text-sm text-green-700">State</label>
                  <select 
                    value={pendingStateFilter} 
                    onChange={(e) => handleStateChange(e.target.value)} 
                    className="mt-1 w-full rounded-md border border-green-100 p-2 bg-green-50"
                  >
                    {STATES.map(s => <option key={s.code} value={s.name}>{s.name}</option>)}
                  </select>
                </div>

                <div className="mt-3">
                  <label className="block text-sm text-green-700">District</label>
                  <select 
                    value={pendingDistrictFilter} 
                    onChange={(e) => handleDistrictChange(e.target.value)} 
                    className="mt-1 w-full rounded-md border border-green-100 p-2 bg-green-50"
                  >
                    {(STATES.find(s => s.name === pendingStateFilter)?.districts || []).map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>

                <div className="mt-4">
                  <button 
                    onClick={handleApplyFilters}
                    disabled={isApplyingFilters}
                    className="w-full inline-flex items-center justify-center gap-2 bg-green-700 text-white px-4 py-2 rounded-md shadow-md hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isApplyingFilters ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Applying...
                      </>
                    ) : (
                      'Apply Filters'
                    )}
                  </button>
                </div>
              </div>

              <div className="mb-6 p-6 bg-white rounded-xl shadow-md border border-green-100">
                <div className="flex items-center gap-2 mb-3">
                  <Download size={16} />
                  <h4 className="font-semibold text-green-900">Export Tools</h4>
                </div>
                <div className="space-y-3">
                  <button
                    onClick={handleExportGeoJSON}
                    className="w-full bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors"
                  >
                    Export GeoJSON
                  </button>
                  <button
                    onClick={() => {
                      console.log('Export button clicked');
                      handleExportMap();
                    }}
                    className="w-full border border-green-200 text-green-700 px-4 py-2 rounded-md hover:bg-green-50 transition-colors"
                  >
                    Export Map Image
                  </button>
                </div>
              </div>
            </aside>
          </div>
        </main>

        <Modal open={modalOpen} onClose={() => { setModalOpen(false); setSelectedFeature(null); }} title={selectedFeature ? `Feature — ${selectedFeature.layer}` : undefined}>
          {selectedFeature ? (
            <div>
              <div className="text-sm text-green-700">Properties</div>
              <div className="mt-2 text-xs text-gray-700" style={{ maxHeight: 260, overflow: 'auto' }}>
                <pre className="whitespace-pre-wrap">{JSON.stringify(selectedFeature.properties, null, 2)}</pre>
              </div>

              <div className="mt-4 flex gap-2">
                <button className="px-3 py-1 bg-green-700 text-white rounded-md text-sm">Edit</button>
                <button className="px-3 py-1 border rounded-md text-sm">Report</button>
                <button className="px-3 py-1 border rounded-md text-sm" onClick={() => { /* toggled verify */ }}>Verify</button>
                <button className="ml-auto px-3 py-1 text-sm text-green-700" onClick={() => { setModalOpen(false); router.push(`/atlas/${encodeURIComponent(selectedFeature.properties?.id ?? 'unknown')}`); }}>Open detail</button>
              </div>
            </div>
          ) : null}
        </Modal>
      </div>
    </ProtectedRoute>
  );
}
