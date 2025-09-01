// src/components/WebGIS.tsx
'use client';

import React, { useRef, useEffect, useState, useCallback, forwardRef, useImperativeHandle } from 'react';
import maplibregl, { Map, Marker, Popup, GeoJSONSource } from 'maplibre-gl';
import MaplibreGeocoder from '@maplibre/maplibre-gl-geocoder';
import * as turf from '@turf/turf';
import { Layers, Ruler, Download, MapPin } from 'lucide-react';

// Types
export interface GISLayer {
  id: string;
  name: string;
  type: 'geojson' | 'raster' | 'vector';
  url?: string;
  data?: any;
  visible: boolean;
  style: {
    fillColor?: string;
    strokeColor?: string;
    strokeWidth?: number;
    opacity?: number;
  };
}

export interface GISMarker {
  id: string;
  lng: number;
  lat: number;
  label?: string;
  color?: string;
  popup?: string;
}

export interface WebGISProps {
  center?: [number, number];
  zoom?: number;
  layers?: GISLayer[];
  markers?: GISMarker[];
  onFeatureClick?: (feature: any) => void;
  onMapClick?: (lngLat: maplibregl.LngLat) => void;
  enableGeocoder?: boolean;
  enableMeasurement?: boolean;
  className?: string;
  // Control visibility props
  showControls?: boolean;
  showLayerControls?: boolean;
  showMeasurementControls?: boolean;
  showExportControls?: boolean;
  // External control callbacks
  onLayerToggle?: (layerId: string) => void;
  onStartMeasurement?: () => void;
  onClearMeasurement?: () => void;
  onExport?: () => void;
  // Location parameters for API calls
  state?: string;
  district?: string;
  // Ref for external access
  ref?: React.Ref<WebGISRef>;
}

export interface WebGISRef {
  exportMap: () => void;
  startMeasurement: () => void;
  clearMeasurement: () => void;
}

const WebGIS = forwardRef<WebGISRef, WebGISProps>(function WebGISComponent({
  center = [88.8, 21.9],
  zoom = 8,
  layers = [],
  markers = [],
  onFeatureClick,
  onMapClick,
  enableGeocoder = true,
  enableMeasurement = true,
  className = "w-full h-full",
  showControls = true,
  showLayerControls = true,
  showMeasurementControls = true,
  showExportControls = true,
  onLayerToggle: externalLayerToggle,
  onStartMeasurement: externalStartMeasurement,
  onClearMeasurement: externalClearMeasurement,
  onExport: externalExport,
  state = 'Madhya Pradesh',
  district = 'Bhopal'
}, ref) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<Map | null>(null);
  const markersRef = useRef<Marker[]>([]);
  const popupsRef = useRef<Popup[]>([]);
  const geocoderRef = useRef<MaplibreGeocoder | null>(null);
  const measurementPoints = useRef<maplibregl.LngLat[]>([]);
  const measurementLine = useRef<string | null>(null);

  const isMeasuringRef = useRef(false);
  const [isMeasuring, setIsMeasuring] = useState(false);
  const [measurementDistance, setMeasurementDistance] = useState<number | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [currentLayers, setCurrentLayers] = useState<GISLayer[]>(layers);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          'osm': {
            type: 'raster',
            tiles: [
              'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png',
              'https://b.tile.openstreetmap.org/{z}/{x}/{y}.png',
              'https://c.tile.openstreetmap.org/{z}/{x}/{y}.png'
            ],
            tileSize: 256,
            attribution: '© OpenStreetMap contributors'
          }
        },
        layers: [{
          id: 'osm',
          type: 'raster',
          source: 'osm'
        }]
      },
      center: center,
      zoom: zoom,
      pitch: 0,
      bearing: 0
    });

    // Add navigation controls
    map.current.addControl(new maplibregl.NavigationControl(), 'top-right');
    map.current.addControl(new maplibregl.ScaleControl(), 'bottom-left');

    // Wait for map to load before setting loaded state
    map.current.on('load', () => {
      setMapLoaded(true);

      // Map click handler (moved here to ensure map is loaded)
      map.current!.on('click', (e) => {
        if (onMapClick) {
          onMapClick(e.lngLat);
        }

        // Handle measurement
        if (isMeasuringRef.current) {
          measurementPoints.current.push(e.lngLat);
          if (measurementPoints.current.length === 2) {
            const distance = turf.distance(
              turf.point([measurementPoints.current[0].lng, measurementPoints.current[0].lat]),
              turf.point([measurementPoints.current[1].lng, measurementPoints.current[1].lat]),
              { units: 'kilometers' }
            );
            setMeasurementDistance(distance);

            // Draw measurement line
            const lineGeoJSON = {
              type: 'Feature' as const,
              properties: {},
              geometry: {
                type: 'LineString' as const,
                coordinates: measurementPoints.current.map(p => [p.lng, p.lat])
              }
            };

            if (measurementLine.current) {
              (map.current!.getSource(measurementLine.current) as GeoJSONSource).setData(lineGeoJSON as any);
            } else {
              measurementLine.current = 'measurement-line';
              map.current!.addSource(measurementLine.current, {
                type: 'geojson',
                data: lineGeoJSON as any
              });
              map.current!.addLayer({
                id: 'measurement-line-layer',
                type: 'line',
                source: measurementLine.current,
                paint: {
                  'line-color': '#ff0000',
                  'line-width': 3,
                  'line-dasharray': [2, 2]
                }
              });
            }

            setIsMeasuring(false);
            isMeasuringRef.current = false;
            measurementPoints.current = [];
          }
        }
      });
    });

    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, []);

  // Update map center and zoom
  useEffect(() => {
    if (!map.current) return;
    map.current.setCenter(center);
    map.current.setZoom(zoom);
  }, [center, zoom]);

  // Load data from APIs
  useEffect(() => {
    console.log('Loading data for layers:', layers.length, 'with state:', state, 'district:', district);
    setIsLoadingData(true);

    // Clear existing data when layers change to force fresh data loading
    setCurrentLayers(prev => prev.map(layer => ({ ...layer, data: undefined })));

    const fetchPromises = layers.map(layer => {
      if (layer.visible && layer.url) {
        // Only add state and district parameters if they're not already in the URL
        let url = layer.url;
        if (!url.includes('state=') && !url.includes('district=')) {
          const separator = url.includes('?') ? '&' : '?';
          const params = [];
          if (state) params.push(`state=${encodeURIComponent(state)}`);
          if (district) params.push(`district=${encodeURIComponent(district)}`);
          if (params.length > 0) {
            url += separator + params.join('&');
          }
        }

        console.log('Fetching data from:', url);
        return fetch(url)
          .then(res => {
            if (!res.ok) {
              throw new Error(`HTTP ${res.status}: ${res.statusText}`);
            }
            return res.json();
          })
          .then(data => {
            console.log('Received data for layer', layer.id, ':', data?.features?.length || 0, 'features');
            setCurrentLayers(prev => prev.map(l =>
              l.id === layer.id ? { ...l, data } : l
            ));
            return data;
          })
          .catch(error => {
            console.error('Error fetching data for layer', layer.id, ':', error);
            // Set empty data to prevent infinite retries
            setCurrentLayers(prev => prev.map(l =>
              l.id === layer.id ? { ...l, data: { type: 'FeatureCollection', features: [] } } : l
            ));
            return null;
          });
      }
      return Promise.resolve(null);
    });

    Promise.all(fetchPromises).then(() => {
      setIsLoadingData(false);
    });
  }, [layers, state, district]);

  // Handle layers
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    console.log('Handling layers, currentLayers:', currentLayers.length);
    currentLayers.forEach(layer => {
      const sourceId = `source-${layer.id}`;
      const layerId = `layer-${layer.id}`;

      if (layer.visible && layer.data) {
        console.log('Adding/updating layer:', layer.id, 'with', layer.data?.features?.length || 0, 'features');

        // Remove existing layer and source if they exist
        if (map.current!.getLayer(layerId)) {
          map.current!.removeLayer(layerId);
        }
        if (map.current!.getSource(sourceId)) {
          map.current!.removeSource(sourceId);
        }

        // Add new source and layer
        map.current!.addSource(sourceId, {
          type: 'geojson',
          data: layer.data
        });
        addLayerFromSource(layer, sourceId, layerId);
      } else if (!layer.visible) {
        // Remove layer and source if not visible
        if (map.current!.getLayer(layerId)) {
          map.current!.removeLayer(layerId);
        }
        if (map.current!.getSource(sourceId)) {
          map.current!.removeSource(sourceId);
        }
      }
    });
  }, [currentLayers, mapLoaded]);

  const addLayerFromSource = (layer: GISLayer, sourceId: string, layerId: string) => {
    if (!map.current) return;

    const layerConfig: any = {
      id: layerId,
      source: sourceId,
      type: 'circle' // Default type
    };

    switch (layer.type) {
      case 'geojson':
        // Determine geometry type from data
        const features = layer.data?.features || [];
        const geometryType = features.length > 0 ? features[0]?.geometry?.type : null;

        console.log('Layer', layer.id, 'has', features.length, 'features, geometry type:', geometryType);

        if (geometryType === 'Point' || geometryType === 'MultiPoint') {
          layerConfig.type = 'circle';
          layerConfig.paint = {
            'circle-radius': 6,
            'circle-color': layer.style.fillColor || '#3b82f6',
            'circle-opacity': layer.style.opacity || 0.8,
            'circle-stroke-color': layer.style.strokeColor || '#ffffff',
            'circle-stroke-width': layer.style.strokeWidth || 2
          };
        } else if (geometryType === 'LineString' || geometryType === 'MultiLineString') {
          layerConfig.type = 'line';
          layerConfig.paint = {
            'line-color': layer.style.strokeColor || '#16a34a',
            'line-width': layer.style.strokeWidth || 2,
            'line-opacity': layer.style.opacity || 0.8
          };
        } else if (geometryType === 'Polygon' || geometryType === 'MultiPolygon') {
          layerConfig.type = 'fill';
          layerConfig.paint = {
            'fill-color': layer.style.fillColor || '#bbf7d0',
            'fill-opacity': layer.style.opacity || 0.4,
            'fill-outline-color': layer.style.strokeColor || '#16a34a'
          };
        } else {
          // Default to circle for unknown or empty geometry types
          console.log('Unknown geometry type for layer', layer.id, ', using default circle type');
          layerConfig.type = 'circle';
          layerConfig.paint = {
            'circle-radius': 6,
            'circle-color': layer.style.fillColor || '#3b82f6',
            'circle-opacity': layer.style.opacity || 0.8,
            'circle-stroke-color': layer.style.strokeColor || '#ffffff',
            'circle-stroke-width': layer.style.strokeWidth || 2
          };
        }
        break;
    }

    try {
      map.current!.addLayer(layerConfig);
      console.log('Successfully added layer:', layerId);
    } catch (error) {
      console.error('Error adding layer', layerId, ':', error);
      return;
    }

    // Add click handler for features
    map.current!.on('click', layerId, (e) => {
      if (e.features && e.features.length > 0 && onFeatureClick) {
        onFeatureClick({
          layer: layer,
          feature: e.features[0],
          lngLat: e.lngLat
        });
      }
    });

    map.current!.on('mouseenter', layerId, () => {
      map.current!.getCanvas().style.cursor = 'pointer';
    });

    map.current!.on('mouseleave', layerId, () => {
      map.current!.getCanvas().style.cursor = '';
    });
  };

  // Handle markers
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Clear existing popups
    popupsRef.current.forEach(popup => popup.remove());
    popupsRef.current = [];

    // Add new markers
    markers.forEach(marker => {
      const el = document.createElement('div');
      el.className = 'marker';
      el.style.width = '24px';
      el.style.height = '24px';
      el.style.borderRadius = '50%';
      el.style.background = marker.color || '#16a34a';
      el.style.border = '3px solid white';
      el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
      el.style.display = 'flex';
      el.style.alignItems = 'center';
      el.style.justifyContent = 'center';
      el.style.fontSize = '12px';
      el.style.fontWeight = 'bold';
      el.style.color = 'white';

      if (marker.label) {
        el.textContent = marker.label;
      }

      const mapMarker = new maplibregl.Marker({ element: el })
        .setLngLat([marker.lng, marker.lat])
        .addTo(map.current!);

      if (marker.popup) {
        const popup = new maplibregl.Popup({ offset: 25 })
          .setHTML(marker.popup);
        mapMarker.setPopup(popup);
      }

      markersRef.current.push(mapMarker);
    });
  }, [markers, mapLoaded]);

  // Measurement functions
  const startMeasurement = useCallback(() => {
    if (externalStartMeasurement) {
      externalStartMeasurement();
    } else {
      setIsMeasuring(true);
      isMeasuringRef.current = true;
      measurementPoints.current = [];
      setMeasurementDistance(null);
      if (measurementLine.current && map.current) {
        if (map.current.getLayer('measurement-line-layer')) {
          map.current.removeLayer('measurement-line-layer');
        }
        if (map.current.getSource(measurementLine.current)) {
          map.current.removeSource(measurementLine.current);
        }
        measurementLine.current = null;
      }
    }
  }, [externalStartMeasurement]);

  const clearMeasurement = useCallback(() => {
    if (externalClearMeasurement) {
      externalClearMeasurement();
    } else {
      setIsMeasuring(false);
      isMeasuringRef.current = false;
      setMeasurementDistance(null);
      measurementPoints.current = [];
      if (measurementLine.current && map.current) {
        if (map.current.getLayer('measurement-line-layer')) {
          map.current.removeLayer('measurement-line-layer');
        }
        if (map.current.getSource(measurementLine.current)) {
          map.current.removeSource(measurementLine.current);
        }
        measurementLine.current = null;
      }
    }
  }, [externalClearMeasurement]);

  // Export functions
  const exportMap = useCallback(() => {
    if (externalExport) {
      externalExport();
    } else {
      if (!map.current) return;

      const canvas = map.current.getCanvas();
      const link = document.createElement('a');
      link.download = 'map-export.png';
      link.href = canvas.toDataURL();
      link.click();
    }
  }, [externalExport]);

  // Expose functions via ref
  useImperativeHandle(ref, () => ({
    exportMap,
    startMeasurement,
    clearMeasurement
  }), [exportMap, startMeasurement, clearMeasurement]);

  // Layer toggle function
  const toggleLayer = useCallback((layerId: string) => {
    if (externalLayerToggle) {
      externalLayerToggle(layerId);
    } else {
      setCurrentLayers(prev =>
        prev.map(layer =>
          layer.id === layerId
            ? { ...layer, visible: !layer.visible }
            : layer
        )
      );
    }
  }, [externalLayerToggle]);

  return (
    <div className={`relative ${className}`}>
      <div ref={mapContainer} className="w-full h-full" />

      {/* Loading Overlay */}
      {isLoadingData && (
        <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center z-20">
          <div className="bg-white rounded-lg p-4 shadow-lg flex items-center gap-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
            <span className="text-sm font-medium text-gray-700">Loading map data...</span>
          </div>
        </div>
      )}

      {/* Map Controls */}
      {showControls && (
        <div className="absolute top-4 left-4 z-10 space-y-2">
          {/* Layer Control */}
          {showLayerControls && (
            <div className="bg-white rounded-lg shadow-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <Layers size={16} />
                <span className="text-sm font-medium">Layers</span>
              </div>
              <div className="space-y-1">
                {currentLayers.map(layer => (
                  <label key={layer.id} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={layer.visible}
                      onChange={() => toggleLayer(layer.id)}
                      className="rounded"
                    />
                    {layer.name}
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Measurement Control */}
          {showMeasurementControls && enableMeasurement && (
            <div className="bg-white rounded-lg shadow-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <Ruler size={16} />
                <span className="text-sm font-medium">Measure</span>
              </div>
              <div className="space-y-2">
                {!isMeasuring ? (
                  <button
                    onClick={startMeasurement}
                    className="w-full text-sm bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                  >
                    Start Measurement
                  </button>
                ) : (
                  <div className="text-xs text-gray-600">
                    Click two points to measure distance
                  </div>
                )}
                {measurementDistance && (
                  <div className="text-xs">
                    Distance: {measurementDistance.toFixed(2)} km
                  </div>
                )}
                <button
                  onClick={clearMeasurement}
                  className="w-full text-sm bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600"
                >
                  Clear
                </button>
              </div>
            </div>
          )}

          {/* Export Control */}
          {showExportControls && (
            <div className="bg-white rounded-lg shadow-lg p-3">
              <button
                onClick={exportMap}
                className="flex items-center gap-2 text-sm hover:bg-gray-100 px-2 py-1 rounded"
              >
                <Download size={16} />
                Export
              </button>
            </div>
          )}
        </div>
      )}

      {/* Measurement Status */}
      {isMeasuring && (
        <div className="absolute top-4 right-4 z-10 bg-yellow-500 text-white px-3 py-2 rounded-lg shadow-lg">
          <div className="flex items-center gap-2">
            <MapPin size={16} />
            <span className="text-sm">Click to measure distance</span>
          </div>
        </div>
      )}

      {measurementDistance && (
        <div className="absolute bottom-4 left-4 z-10 bg-green-500 text-white px-3 py-2 rounded-lg shadow-lg">
          <div className="flex items-center gap-2">
            <Ruler size={16} />
            <span className="text-sm">Distance: {measurementDistance.toFixed(2)} km</span>
          </div>
        </div>
      )}
    </div>
  );
});

export default WebGIS;
